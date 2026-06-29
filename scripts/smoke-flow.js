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
  assert(battle.includes('drawBattleHUD()'), 'Battle must keep the core HP/EN boxes');
  assert(battle.includes('drawMoveSelect()'), 'Battle must keep the move menu');
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
  const confirm = () => { press('Enter'); tick(1); release('Enter'); };
  const closeDialog = () => { confirm(); confirm(); };

  assert(get('gameState') === 'TITLE', 'Boot should start at TITLE');
  confirm();
  assert(get('gameState') === 'CHARSELECT', 'Title confirm should open character select');
  confirm();
  assert(get('charSelect.phase') === 'build', 'Gender confirm should move to build select');
  confirm();
  assert(get('gameState') === 'DIALOG', 'Build confirm should open intro dialog');
  closeDialog();
  assert(get('gameState') === 'OVERWORLD', 'Intro dialog should return to overworld');

  assert(!get('ControlsHelp.visible') && !get('ScoutCard.visible') && !get('CoachTip.visible'), 'Legacy overlays must stay hidden');

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
      closeDialog();
      assert(get('gameState') === 'CREDITS', 'Final victory should enter credits');
      confirm();
      assert(get('gameState') === 'TITLE', 'Credits confirm should return to title');
    } else {
      closeDialog();
      assert(get('gameState') === 'OVERWORLD', 'Victory dialog should return to overworld for trainer ' + i);
    }
    assert(get(`trainers[${i}].beaten`) === true, 'Trainer ' + i + ' should be marked beaten');
  }

  console.log('NORDHORN_SMOKE_FLOW_OK trainers=' + trainerCount + ' finalState=' + get('gameState'));
}

runSmokeFlow();
