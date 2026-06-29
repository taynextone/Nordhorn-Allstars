#!/usr/bin/env python3
"""
Headless browser smoke test for Nordhorn Allstars.

This complements scripts/smoke-flow.js by loading the real HTML page in Chromium,
driving the existing game state through the DevTools protocol, and asserting the
critical clean-UI gameplay flow without adding any in-game debug overlays.
"""
from __future__ import annotations

import asyncio
import contextlib
import functools
import json
import os
import shutil
import socket
import subprocess
import tempfile
import threading
import time
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

try:
    import websockets
except ImportError as exc:  # pragma: no cover - environment guard
    raise SystemExit("Missing Python package 'websockets'; install it or run scripts/smoke-flow.js instead") from exc

ROOT = Path(__file__).resolve().parents[1]
VIEWPORT = "480,432"


def free_tcp_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def find_chromium() -> str:
    for name in ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable"):
        path = shutil.which(name)
        if path:
            return path
    raise SystemExit("Chromium/Chrome not found; cannot run browser smoke")


@contextlib.contextmanager
def local_server():
    configured = os.environ.get("NORDHORN_SMOKE_URL")
    if configured:
        yield configured
        return

    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{httpd.server_port}/"
    finally:
        httpd.shutdown()
        thread.join(timeout=5)
        httpd.server_close()


def wait_for_cdp(port: int) -> str:
    deadline = time.time() + 20
    last_error: Exception | None = None
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/json", timeout=1) as response:
                tabs = json.load(response)
            for tab in tabs:
                if tab.get("type") == "page" and tab.get("webSocketDebuggerUrl"):
                    return tab["webSocketDebuggerUrl"]
        except Exception as exc:  # pragma: no cover - diagnostic path
            last_error = exc
            time.sleep(0.2)
    raise RuntimeError(f"No Chrome DevTools page websocket: {last_error}")


async def run_cdp_flow(ws_url: str) -> str:
    async with websockets.connect(ws_url, max_size=2**24) as ws:
        seq = 0
        page_errors: list[str] = []

        def record_event(msg: dict) -> None:
            method = msg.get("method")
            params = msg.get("params", {})
            if method == "Runtime.exceptionThrown":
                details = params.get("exceptionDetails", {})
                page_errors.append(details.get("text") or json.dumps(details, sort_keys=True))
            elif method == "Runtime.consoleAPICalled" and params.get("type") in {"error", "assert"}:
                args = params.get("args", [])
                text = " ".join(str(arg.get("value") or arg.get("description") or arg.get("type")) for arg in args)
                page_errors.append(text or "console error")
            elif method == "Log.entryAdded":
                entry = params.get("entry", {})
                if entry.get("level") in {"error", "warning"}:
                    page_errors.append(entry.get("text") or json.dumps(entry, sort_keys=True))

        async def send(method: str, params: dict | None = None) -> dict:
            nonlocal seq
            seq += 1
            await ws.send(json.dumps({"id": seq, "method": method, "params": params or {}}))
            while True:
                msg = json.loads(await ws.recv())
                if msg.get("id") == seq:
                    if "error" in msg:
                        raise RuntimeError(msg["error"])
                    return msg.get("result", {})
                record_event(msg)

        await send("Runtime.enable")
        await send("Log.enable")
        await send("Page.enable")
        await send("Runtime.evaluate", {
            "expression": "new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))",
            "awaitPromise": True,
        })
        if page_errors:
            raise RuntimeError("Page emitted errors before smoke flow: " + " | ".join(page_errors))

        flow = r"""
(() => {
  const out = [];
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
  const press = k => { keysPressed[k] = true; keys[k] = true; gameLoop(); keys[k] = false; };
  const tick = n => { for (let i = 0; i < n; i++) gameLoop(); };
  const closeDialog = () => { press('Enter'); press('Enter'); };
  const timerQueue = [];
  window.setTimeout = fn => { timerQueue.push(fn); return timerQueue.length; };
  const flushTimers = () => {
    let guard = 0;
    while (timerQueue.length && guard++ < 50) {
      timerQueue.shift()();
      tick(5);
    }
    assert(guard < 50, 'timer queue should settle');
  };

  assert(gameState === 'TITLE', 'boot state should be TITLE');
  assert(!ControlsHelp.visible && !ScoutCard.visible && !CoachTip.visible, 'legacy overlays should boot hidden');
  out.push('boot=' + gameState);

  press('a');
  assert(gameState === 'CHARSELECT' && charSelect.phase === 'gender', 'A should start character select');
  press('b');
  assert(charSelect.phase === 'build', 'B should confirm gender');
  press('A');
  tick(100);
  assert(gameState === 'DIALOG' && dialog.active, 'build confirm should open intro dialog');
  closeDialog();
  assert(gameState === 'OVERWORLD' && !dialog.active, 'intro dialog should close to overworld');
  out.push('intro=OVERWORLD');

  startBattle(trainers[0]);
  player.level = 2;
  player.exp = player.expNext;
  player.moves = ['Layup', 'Jump Shot'];
  battle.playerHp = player.hp;
  battle.playerEnergy = player.energy;
  winBattle();
  assert(player.level === 3, 'level-up should advance to level 3');
  assert(player.moves.includes('Three Pointer'), 'level 3 should unlock Three Pointer at the matching tier');
  assert(!player.moves.includes('Block'), 'level 3 must not skip ahead to level-4 Block');
  timerQueue.length = 0;
  resetRunProgress();
  gameState = 'OVERWORLD';
  battle.active = false;
  out.push('levelMove=Three Pointer');

  startBattle(trainers[0]);
  tick(5);
  assert(gameState === 'BATTLE', 'startBattle should enter battle');
  assert(battle.phase === 'select', 'battle should start in move select');
  assert(Object.values(keysPressed).every(v => !v), 'battle start should clear stale pressed input');
  assert(!ControlsHelp.visible && !ScoutCard.visible && !CoachTip.visible, 'legacy overlays should stay hidden in battle');
  battle.playerEnergy = 0;
  battle.selectedMove = 0;
  executePlayerMove();
  assert(battle.phase === 'anim' && battle.message === 'You catch breath...', 'zero-energy battle should catch breath instead of trapping the player in the move menu');
  assert(battle.playerEnergy === PLAYER_ENERGY_REGEN && battle.turnCount === 1, 'catch-breath fallback should restore tuned regen and spend one turn');
  startBattle(trainers[0]);
  tick(5);
  out.push('battleStart=' + battle.phase);

  battle.playerScore = battle.currentTrainer.ptsToWin;
  endTurn();
  flushTimers();
  assert(gameState === 'DIALOG' && dialog.active && dialog.text === 'Victory!', 'victory should show dialog');
  assert(dialog.subText === 'Klaus besiegt! Siege: 1/5', 'victory dialog should show compact rival progress in the existing dialog box');
  closeDialog();
  assert(gameState === 'OVERWORLD' && trainers[0].beaten, 'victory dialog should return to overworld and mark win');
  out.push('firstVictoryWins=' + trainers.filter(t => t.beaten).length);

  resetRunProgress();
  gameState = 'OVERWORLD';
  for (let i = 0; i < trainers.length; i++) {
    startBattle(trainers[i]);
    tick(2);
    assert(gameState === 'BATTLE' && battle.phase === 'select', 'trainer ' + i + ' should enter clean battle select');
    battle.playerScore = battle.currentTrainer.ptsToWin;
    endTurn();
    flushTimers();
    if (i === trainers.length - 1) {
      closeDialog();
      assert(gameState === 'CREDITS', 'final victory should enter credits after champion dialog');
      press('Enter');
      assert(gameState === 'TITLE', 'credits confirm should return to title');
    } else {
      closeDialog();
      assert(gameState === 'OVERWORLD', 'trainer ' + i + ' victory should return to overworld');
    }
  }
  assert(trainers.every(t => t.beaten), 'all trainers should be beaten in browser flow');
  return out.concat(['allTrainers=' + trainers.length, 'final=' + gameState]).join('|');
})()
"""
        result = await send("Runtime.evaluate", {
            "expression": flow,
            "awaitPromise": False,
            "returnByValue": True,
        })
        value = result.get("result", {})
        if value.get("subtype") == "error":
            raise RuntimeError(value.get("description") or value.get("value") or "browser smoke JS error")
        if "exceptionDetails" in result:
            raise RuntimeError(result["exceptionDetails"])
        if page_errors:
            raise RuntimeError("Page emitted errors during smoke flow: " + " | ".join(page_errors))
        return str(value.get("value", ""))


def main() -> int:
    chromium = find_chromium()
    profile = tempfile.mkdtemp(prefix="nordhorn-chrome-")
    port = int(os.environ.get("NORDHORN_CDP_PORT") or free_tcp_port())
    with local_server() as url:
        proc = subprocess.Popen([
            chromium,
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            f"--remote-debugging-port={port}",
            f"--user-data-dir={profile}",
            f"--window-size={VIEWPORT}",
            url,
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            ws_url = wait_for_cdp(port)
            flow_result = asyncio.run(run_cdp_flow(ws_url))
            print("NORDHORN_BROWSER_SMOKE_OK " + flow_result)
            return 0
        finally:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait(timeout=5)
            shutil.rmtree(profile, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
