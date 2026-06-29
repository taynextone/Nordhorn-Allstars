#!/usr/bin/env node
/*
 * Nordhorn Allstars smoke flow verifier.
 * Runs the inline browser game in a tiny Node VM with stubbed canvas/browser APIs.
 * Focus: clean Gameboy UI guardrails plus title → character select → overworld →
 * battle → victory → all-rivals champion credits state flow.
 */
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const code = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function getFunctionBody(source, name) {
  const start = source.indexOf('function ' + name + '(');
  assert(start !== -1, 'Missing function ' + name);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    if (depth === 0) return source.slice(open + 1, i);
  }
  throw new Error('Could not parse function ' + name);
}

function assertCleanRenderPaths() {
  const overworld = getFunctionBody(code, 'drawOverworld');
  const battle = getFunctionBody(code, 'drawBattle');
  const runtimeLoop = getFunctionBody(code, 'gameLoop');
  const overworldUpdate = getFunctionBody(code, 'updateOverworld');
  const battleUpdate = getFunctionBody(code, 'updateBattle');
  const forbidden = [
    '.renderHUD(', '.renderBattleHUD(', '.renderOverlay(',
    'CoachTip.', 'ScoutCard.', 'ControlsHelp.', 'QuestRadar.',
    'MomentumMeter.', 'ShotQualityAdvisor.', 'RouteCoach.'
  ];
  for (const token of forbidden) {
    assert(!overworld.includes(token), 'drawOverworld reintroduced overlay token: ' + token);
    assert(!battle.includes(token), 'drawBattle reintroduced overlay token: ' + token);
  }
  assert(overworld.includes('drawCleanOverworldHUD()'), 'Overworld must use the compact clean HUD');
  assert(code.includes('let minimapVisible = false;'), 'Minimap should default off for a clean overworld');
  const removedLegacyModules = [
    'const RivalProgress =', 'const BattlePrep =', 'const DuelRiskMeter =',
    'const RouteCoach =', 'const PossessionCoach =', 'const MomentumMeter =',
    'const ShotQualityAdvisor =', 'const ZoneDefenseCoach =', 'const PracticePlan =',
    'const WarmupCoach =', 'const HydrationCoach =', 'const TipoffChecklist =',
    'const BenchCoach =', 'const RecoveryCoach =', 'const TravelPaceCoach =',
    'const CrowdEnergyCoach =', 'const FlowStateCoach ='
  ];
  for (const token of removedLegacyModules) {
    assert(!code.includes(token), 'Legacy coach/advisor module should stay removed: ' + token);
  }
  assert(!code.includes('renderBattleHUD() {'), 'Legacy battle-HUD module methods must stay removed');
  assert(!code.includes('renderHUD() {'), 'Legacy overworld-HUD module methods must stay removed');
  assert(battle.includes('drawBattleHUD()'), 'Battle must keep the core HP/EN boxes');
  assert(battle.includes('drawMoveSelect()'), 'Battle must keep the move menu');
  assert(battle.includes('drawBattlePlayer(76, 145)'), 'Player sprite must render above the move menu');
  assert(battle.includes('ctx.arc(104, 191, 6'), 'Player ball must stay above the move menu');
  const moveSelect = getFunctionBody(code, 'drawMoveSelect');
  assert(moveSelect.includes('const menuY = VIEW_H - 150;'), 'Move menu must stay lifted above the HP/EN HUD');
  assert(moveSelect.includes('menuY + menuH - 8'), 'Move description must stay inside the command box');
  assert(!moveSelect.includes('menuY + menuH + 10'), 'Move description must not overlap the HP/EN HUD');
  assert(battle.includes('ctx.arc(VIEW_W / 2, 120, 28'), 'Battle court should keep the clean center-circle polish');
  assert(code.includes("← → select, ENTER/A/B confirm"), 'Gender select hint must match A/B confirm support');
  assert(code.includes("↑ ↓ select, ENTER/A/B confirm"), 'Build select hint must match A/B confirm support');
  assert(code.includes('UP/DOWN Select · ENTER/A/B Start · C Credits'), 'Title hint must mention the working A/B start buttons');
  const battleHud = getFunctionBody(code, 'drawBattleHUD');
  assert(battleHud.includes('battle.subMessage'), 'Battle result subMessage/score must be rendered in the core message box');
  assert(battleHud.includes('drawWrappedBattleText'), 'Battle messages should wrap inside the compact message box');
  assert(code.includes('function movePlayerToHomeGate()'), 'Return-home flows should share one safe home-gate helper');
  assert(code.includes('ENTER/SPACE/A/B to continue'), 'Game Over hint must mention all working confirm buttons');
  assert(code.includes('const PLAYER_ENERGY_REGEN = 3;'), 'Player energy regen should be a single tuned constant');
  assert(battleHud.includes("'REG +' + PLAYER_ENERGY_REGEN"), 'Battle HUD regen text must stay synced to the regen constant');
  assert(!battleHud.includes("'REG +3'"), 'Battle HUD should not hard-code a stale regen label');

  const forbiddenLegacyToggles = ['ControlsHelp.toggle', 'ScoutCard.toggle', 'CoachTip.toggle'];
  for (const token of forbiddenLegacyToggles) {
    assert(!runtimeLoop.includes(token), 'gameLoop reintroduced legacy overlay toggle: ' + token);
    assert(!overworldUpdate.includes(token), 'updateOverworld reintroduced legacy overlay toggle: ' + token);
    assert(!battleUpdate.includes(token), 'updateBattle reintroduced legacy overlay toggle: ' + token);
  }
}

function createSandbox() {
  const noop = () => {};
  const ctx = new Proxy({
    imageSmoothingEnabled: false,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    globalAlpha: 1,
    fillRect: noop,
    strokeRect: noop,
    clearRect: noop,
    fillText: noop,
    strokeText: noop,
    drawImage: noop,
    beginPath: noop,
    closePath: noop,
    arc: noop,
    fill: noop,
    stroke: noop,
    moveTo: noop,
    lineTo: noop,
    save: noop,
    restore: noop,
    translate: noop,
    scale: noop,
    rotate: noop,
    measureText: text => ({ width: String(text).length * 6 })
  }, {
    get: (target, prop) => prop in target ? target[prop] : noop,
    set: (target, prop, value) => { target[prop] = value; return true; }
  });

  const canvas = {
    width: 480,
    height: 432,
    getContext: () => ctx,
    addEventListener: noop,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 480, height: 432 })
  };
  const storage = new Map();
  const document = {
    getElementById: id => id === 'gameCanvas'
      ? canvas
      : { classList: { add: noop, remove: noop }, addEventListener: noop, querySelectorAll: () => [] },
    createElement: tag => tag === 'canvas' ? { width: 0, height: 0, getContext: () => ctx } : {}
  };
  const timers = [];
  const sandbox = {
    console,
    Math,
    Date,
    document,
    navigator: { userAgent: 'NordhornSmoke Chromium' },
    localStorage: {
      getItem: key => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key),
      clear: () => storage.clear()
    },
    window: null,
    performance: { now: () => 0 },
    setTimeout: fn => { timers.push(fn); return timers.length; },
    clearTimeout: noop,
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: noop,
    AudioContext: function AudioContext() {},
    webkitAudioContext: function webkitAudioContext() {}
  };
  sandbox.window = sandbox;
  sandbox.addEventListener = noop;
  sandbox.removeEventListener = noop;
  sandbox.location = { search: '' };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'index-inline.js' });
  return { sandbox, timers };
}

function runSmokeFlow() {
  assertCleanRenderPaths();
  const { sandbox, timers } = createSandbox();
  const get = expression => vm.runInContext(expression, sandbox);
  const run = statement => vm.runInContext(statement, sandbox);
  const press = key => { get('keysPressed')[key] = true; get('keys')[key] = true; };
  const release = key => { get('keys')[key] = false; };
  const tick = (count = 1) => { for (let i = 0; i < count; i++) get('gameLoop')(); };
  const flushTimers = (limit = 50) => {
    let i = 0;
    while (timers.length && i++ < limit) {
      timers.shift()();
      tick(1);
    }
  };
  const confirm = (key = 'Enter') => { press(key); tick(1); release(key); };
  const escape = () => { press('Escape'); tick(1); release('Escape'); };
  const closeDialog = () => { confirm(); confirm(); };

  assert(get('gameState') === 'TITLE', 'Boot should start at TITLE');
  confirm('a');
  assert(get('gameState') === 'CHARSELECT', 'Keyboard A should start from title like the printed A-button control');
  confirm('b');
  assert(get('charSelect.phase') === 'build', 'Keyboard B should confirm in character select like the printed B-button control');
  confirm('A');
  assert(get('gameState') === 'DIALOG', 'Build confirm should open intro dialog');
  closeDialog();
  assert(get('gameState') === 'OVERWORLD', 'Intro dialog should return to overworld');

  assert(!get('ControlsHelp.visible') && !get('ScoutCard.visible') && !get('CoachTip.visible'), 'Legacy overlays must stay hidden');
  assert(get('minimapVisible') === false, 'Minimap should default off after the clean-UI pass');

  run(`localStorage.setItem(SaveSystem.STORAGE_KEY, JSON.stringify({
    version: 2,
    savedAt: '2026-01-01T00:00:00.000Z',
    player: { level: 3, hp: 77, maxHp: 100, energy: 12, maxEnergy: 20, moves: ['Layup'], beatenTrainers: [] },
    trainers: [{ id: 0, beaten: true }, { id: 2, beaten: true }]
  }))`);
  assert(get('SaveSystem.getInfo().beaten') === 2, 'Continue info should count legacy trainer-state saves');
  assert(get('SaveSystem.load()') === true, 'Legacy trainer-state save should load');
  assert(get('player.beatenTrainers.length') === 2, 'Loaded legacy save should sync beatenTrainers');
  assert(get('trainers[0].beaten && trainers[2].beaten') === true, 'Loaded legacy save should keep trainer beaten flags');
  closeDialog();
  run('SaveSystem.clear(); resetRunProgress(); gameState = "OVERWORLD";');

  run('startBattle(trainers[0])');
  tick(1);
  assert(get('gameState') === 'BATTLE', 'Loss smoke should enter battle');
  assert(get('battle.phase') === 'select', 'Loss smoke battle should start at move select');
  run('battle.playerEnergy = 0; battle.turnCount = 2; endTurn();');
  assert(get('battle.playerEnergy') === get('PLAYER_ENERGY_REGEN'), 'Player turn regen should match the HUD regen label');
  run('battle.playerEnergy = 20; battle.turnCount = 0; battle.phase = "select";');
  run('battle.enemyScore = battle.currentTrainer.ptsToWin; endTurn();');
  flushTimers();
  flushTimers();
  assert(get('gameState') === 'DIALOG', 'Loss should show defeat dialog before returning to overworld');
  assert(get('dialog.active') === true, 'Loss dialog should be active/readable');
  closeDialog();
  assert(get('gameState') === 'OVERWORLD', 'Loss dialog should return to overworld');
  assert(get('player.hp') === get('player.maxHp'), 'Loss respawn should restore HP');
  assert(get('player.energy') === get('player.maxEnergy'), 'Loss respawn should restore energy');
  assert(get('player.x') === get('HomeRest.homeX') && get('player.y') === get('HomeRest.homeY'), 'Loss respawn should use the safe home-gate helper');
  assert(get('isWalkable(player.x, player.y)') === true, 'Loss respawn tile must be walkable');
  assert(get('trainers[0].beaten') === false, 'Loss must not mark trainer beaten');

  run('player.x = 3; player.y = 4; ErrorGuard.validateGameState();');
  assert(get('player.x') === get('HomeRest.homeX') && get('player.y') === get('HomeRest.homeY'), 'ErrorGuard should recover corrupt positions to the walkable home gate');
  assert(get('isWalkable(player.x, player.y)') === true, 'ErrorGuard recovery tile must be walkable');

  const trainerCount = get('trainers.length');
  for (let i = 0; i < trainerCount; i++) {
    run(`startBattle(trainers[${i}])`);
    tick(1);
    assert(get('gameState') === 'BATTLE', 'Trainer ' + i + ' should enter battle');
    assert(get('battle.phase') === 'select', 'Trainer ' + i + ' battle should start at move select');
    assert(Object.values(get('keysPressed')).every(value => !value), 'Battle start should clear pressed input');
    run('battle.playerScore = battle.currentTrainer.ptsToWin; endTurn();');
    flushTimers();
    flushTimers();
    if (i === trainerCount - 1) {
      escape();
      assert(get('gameState') === 'CREDITS', 'Final victory Escape should honor Champion dialog callback and enter credits');
      confirm();
      assert(get('gameState') === 'TITLE', 'Credits confirm should return to title');
    } else {
      closeDialog();
      assert(get('gameState') === 'OVERWORLD', 'Victory dialog should return to overworld for trainer ' + i);
    }
    assert(get(`trainers[${i}].beaten`) === true, 'Trainer ' + i + ' should be marked beaten');
  }

  console.log('NORDHORN_SMOKE_FLOW_OK lossDialog=pass trainers=' + trainerCount + ' finalState=' + get('gameState'));
}

runSmokeFlow();
