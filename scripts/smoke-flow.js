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
  assert(battle.includes("drawBattleHoop(28, 68, 'left')"), 'Battle court should render left pixel hoop as scenery');
  assert(battle.includes("drawBattleHoop(VIEW_W - 44, 68, 'right')"), 'Battle court should render right pixel hoop as scenery');
  assert(code.includes('function drawBattleHoop('), 'Pixel hoop renderer must stay as court art, not HUD');
  assert(!battle.includes('ctx.fillRect(30, 70, 10, 10);'), 'Old flat hoop block should stay replaced by readable pixel hoop art');
  assert(code.includes('ctx.fillRect(128, 18, 224, 40);'), 'Core scoreboard should keep its readable compact geometry');
  assert(code.includes("ctx.fillText('FIRST ' + battle.currentTrainer.ptsToWin, 240, 46);"), 'Core scoreboard should show the target score without a new overlay');
  assert(code.includes('function shortenBattleLabel('), 'Battle labels should share one compact truncation helper');
  assert(code.includes('const enemyScoreName = shortenBattleLabel(battle.currentTrainer.name, 12);'), 'Long trainer names should be shortened in the scoreboard');
  assert(code.includes('ctx.fillText(shortenBattleLabel(trainer.name, 12), x + 24, y + 68);'), 'Long trainer names should be shortened below battle sprites');
  assert(code.includes('ctx.fillText(shortenBattleLabel(battle.currentTrainer.name, 12), enemyBox.x + 8, VIEW_H - 60);'), 'Enemy HP/EN box should show the compact trainer label');
  assert(battle.includes('drawBattleHUD()'), 'Battle must keep the core HP/EN boxes');
  assert(code.includes("← → select, ENTER/A/B confirm"), 'Gender select hint must match A/B confirm support');
  assert(code.includes("↑ ↓ select, ENTER/A/B confirm"), 'Build select hint must match A/B confirm support');

  assert(code.includes('UP/DOWN Select · ENTER/A/B Start · C Credits'), 'Title hint must mention the working A/B start buttons');
  assert(code.includes('A/B/ENTER START · C CREDITS'), 'Compact title status must stay synced with A/B/ENTER start controls');
  assert(html.includes('<link rel="icon" href="data:image/svg+xml,'), 'HTML should ship an inline pixel favicon so browser smoke stays free of 404 noise');
  const battleHud = getFunctionBody(code, 'drawBattleHUD');
  assert(battleHud.includes('battle.subMessage'), 'Battle result subMessage/score must be rendered in the core message box');
  assert(battleHud.includes('drawWrappedBattleText'), 'Battle messages should wrap inside the compact message box');
  assert(battleHud.includes('battle.feedbackTimer > 0'), 'Select-phase battle feedback must be readable in the core message box');
  assert(battleHud.includes('const clampBarWidth ='), 'Battle HP/EN bars must clamp to their compact boxes');
  assert(battleHud.includes('clampBarWidth(battle.playerHp, player.maxHp, 88)'), 'Player HP bar must be clamped');
  assert(battleHud.includes('clampBarWidth(battle.playerEnergy, player.maxEnergy, 88)'), 'Player EN bar must be clamped');
  assert(battleHud.includes('clampBarWidth(battle.enemyHp, battle.currentTrainer.playerHp, 88)'), 'Enemy HP bar must be clamped');
  assert(battleHud.includes('clampBarWidth(battle.enemyEnergy, battle.enemyMaxEnergy, 88)'), 'Enemy EN bar must be clamped');
  assert(code.includes('function setBattleMessage('), 'Battle message helper should clear stale submessages');
  assert(code.includes("trainerName + ' besiegt! Siege: '"), 'Victory dialog should show rival progress in the existing dialog box');
  assert(!code.includes('Coach: Great game! Keep training!'), 'Generic coach victory line should stay replaced by compact rival progress');
  assert(code.includes('const newMove = MOVE_UNLOCKS[player.level];'), 'Level-up move unlocks should match the level just reached');
  assert(!code.includes('MOVE_UNLOCKS[player.level + 1]'), 'Level-up move unlocks must not skip one tier ahead');
  assert(code.includes('function movePlayerToHomeGate()'), 'Return-home flows should share one safe home-gate helper');
  assert(code.includes('ENTER/SPACE/A/B to continue'), 'Game Over hint must mention all working confirm buttons');
  assert(code.includes('const PLAYER_ENERGY_REGEN = 3;'), 'Player energy regen should be a single tuned constant');
  assert(battleHud.includes("'REG +' + PLAYER_ENERGY_REGEN"), 'Battle HUD regen text must stay synced to the regen constant');
  assert(!battleHud.includes("'REG +3'"), 'Battle HUD should not hard-code a stale regen label');
  assert(!code.includes("battle.enemyEnergy = Math.min(battle.enemyMaxEnergy, battle.enemyEnergy + 5)"), 'Enemy rest should not double-stack hard-coded +5 energy with normal regen');
  assert(code.includes("setBattleMessage(battle.currentTrainer.name + ' rests...', '+' + regen + ' EN')"), 'Enemy rest message should match trainer regen inside the compact message box');
  assert(code.includes("'-' + calc.damage + ' HP'"), 'Enemy scoring moves should show player HP damage in the compact message subline');
  const drawTile = getFunctionBody(code, 'drawTile');
  assert(drawTile.includes('Tiny court-paint pixels'), 'Overworld court tiles should keep pixel-art court polish without new HUDs');
  assert(drawTile.includes('ctx.fillRect(sx, sy + 7, TILE, 2);'), 'Court tiles should include horizontal court-paint lines');
  assert(drawTile.includes('ctx.fillRect(sx + 6, sy + 6, 4, 4);'), 'Court tiles should include tiny center-paint pixels');
  assert(code.includes('const MAP_LANDMARKS = ['), 'Nordhorn overview should define reusable map landmarks');
  assert(code.includes("label: 'KLOSTER'"), 'Overview landmarks should include Kloster Frenswegen inspiration');
  assert(code.includes("label: 'TIERPARK'"), 'Overview landmarks should include Tierpark/Park area');
  assert(code.includes("label: '→ LINGEN'"), 'Overview landmarks should include the route toward Lingen');
  assert(code.includes('function drawOverviewMap()'), 'Full overview map screen should exist');
  assert(code.includes('drawOverviewTargets(mapX, mapY, scale)'), 'Overview map should show tiny trainer target dots only on the separate map screen');
  assert(code.includes("ctx.fillText('NEXT', nx, ny - 9);"), 'Overview map should identify the next unbeaten rival without adding overworld/battle HUDs');
  assert(code.includes("ctx.fillText('M: Mini  O: Overview'"), 'Overworld hint should advertise mini map and overview map without HUD spam');
  assert(code.includes("O / ESC / A/B/ENTER: BACK"), 'Overview back hint should match the actual confirm aliases');

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
  assert(get('MAP_LANDMARKS.length') >= 9, 'Overview map should expose the main Nordhorn landmarks');
  assert(get('MAP_LANDMARKS.some(m => m.label === "TIERPARK") && MAP_LANDMARKS.some(m => m.label === "→ LINGEN")') === true, 'Overview landmarks should include park and Lingen route');
  assert(get('ObjectiveTracker.getNextTrainer().name') === 'Klaus', 'Fresh overview routing should target the first unbeaten rival');
  press('o');
  tick(1);
  release('o');
  assert(get('gameState') === 'OVERVIEW', 'O should open the full Nordhorn overview screen from overworld');
  press('Escape');
  tick(1);
  release('Escape');
  assert(get('gameState') === 'OVERWORLD', 'Escape should close the overview screen back to overworld');
  press('O');
  tick(1);
  release('O');
  assert(get('gameState') === 'OVERVIEW', 'Shift+O should open the full Nordhorn overview screen from overworld');
  confirm('b');
  assert(get('gameState') === 'OVERWORLD', 'A/B/Enter-style confirm should close the overview screen as hinted');

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

  run(`localStorage.setItem(SaveSystem.STORAGE_KEY, JSON.stringify({
    version: 2,
    savedAt: '2026-01-02T00:00:00.000Z',
    player: {
      x: 3, y: 4, facing: 'sideways', gender: 'robot', build: 'hacker',
      level: 'bad', hp: -9, maxHp: -25, energy: -4, maxEnergy: 0,
      stats: { shooting: 'NaN', defense: 9999, dribbling: -7 },
      moves: ['Layup', 'Glitch Dunk'], beatenTrainers: [999, '1']
    },
    trainers: [{ id: '2', beaten: true }, { id: 404, beaten: true }]
  }))`);
  assert(get('SaveSystem.getInfo().beaten') === 2, 'Continue info should ignore stale trainer IDs but count valid string IDs');
  assert(get('SaveSystem.load()') === true, 'Corrupt vital save should still load through sanitizer');
  assert(get('player.maxHp') === 100 && get('player.hp') === 1, 'Load should revive corrupt nonpositive HP to one playable point before any HUD/dialog frame');
  assert(get('player.maxEnergy') === 20 && get('player.energy') === 0, 'Load should clamp corrupt energy before battle/overworld use');
  assert(get('player.level') === 1 && get('player.build') === 'shooter' && get('player.facing') === 'down', 'Load should sanitize corrupt level/build/facing fields');
  assert(get('Number.isFinite(player.stats.shooting) && player.stats.shooting === 5 && player.stats.defense === 30 && player.stats.dribbling === 1'), 'Load should sanitize corrupt stat values into finite balanced bounds');
  assert(get('player.moves.includes("Layup") && player.moves.includes("Jump Shot") && !player.moves.includes("Three Pointer") && !player.moves.includes("Glitch Dunk")'), 'Load should remove invalid or too-early saved moves while keeping core playable moves');
  assert(get('player.beatenTrainers.length') === 2 && get('trainers[1].beaten && trainers[2].beaten') === true, 'Load should sync only known valid trainer IDs from mixed save shapes');
  assert(get('player.x') === get('HomeRest.homeX') && get('player.y') === get('HomeRest.homeY'), 'Load should recover invalid save positions to the home gate immediately');
  assert(get('isWalkable(player.x, player.y)') === true, 'Sanitized save position must be walkable');
  closeDialog();
  run('SaveSystem.clear(); resetRunProgress(); gameState = "OVERWORLD";');

  run(`startBattle(trainers[0]);
    player.level = 2;
    player.exp = player.expNext;
    player.moves = ['Layup', 'Jump Shot'];
    battle.playerHp = player.hp;
    battle.playerEnergy = player.energy;
    winBattle();`);
  assert(get('player.level') === 3, 'Level-up smoke should advance the player to level 3');
  assert(get('player.moves.includes("Three Pointer")') === true, 'Level 3 should unlock Three Pointer at the matching tier');
  assert(get('player.moves.includes("Block")') === false, 'Level 3 must not skip ahead and unlock the level-4 Block');
  run('battle.playerMoves = getPlayerMoves();');
  assert(get('battle.playerMoves.some(m => m.name === "Three Pointer")') === true, 'Level 3 battle menu should include the newly earned Three Pointer');
  assert(get('battle.playerMoves.some(m => m.name === "Block")') === false, 'Level 3 battle menu must not expose level-4 Block early');
  timers.length = 0;
  run('resetRunProgress(); gameState = "OVERWORLD"; battle.active = false;');

  run('startBattle(trainers[0]); battle.enemyHp = 0; battle.playerScore = 0; endTurn();');
  assert(get('battle.phase') === 'result', 'Enemy HP reaching zero should immediately end the duel');
  assert(get('battle.message') === 'YOU WIN!', 'Enemy HP KO should use the normal compact victory message');
  assert(get('battle.subMessage').includes('is out!'), 'Enemy HP KO detail should explain the finish inside the message box');
  flushTimers();
  flushTimers();
  assert(get('gameState') === 'DIALOG', 'Enemy HP KO should flow into the victory dialog');
  assert(get('dialog.subText').startsWith('Klaus besiegt! Siege: 1/5'), 'Victory dialog should name the rival and compact progress without extra HUD');
  assert(get('dialog.subText').includes('Wohnhof'), 'Victory dialog should include the new local story flavor in the existing dialog box');
  closeDialog();
  assert(get('gameState') === 'OVERWORLD', 'Enemy HP KO victory dialog should return to overworld');
  assert(get('trainers[0].beaten') === true, 'Enemy HP KO should mark trainer beaten');
  run('resetRunProgress(); gameState = "OVERWORLD";');

  run('startBattle(trainers[0])');
  tick(1);
  assert(get('gameState') === 'BATTLE', 'Loss smoke should enter battle');
  assert(get('battle.phase') === 'select', 'Loss smoke battle should start at move select');
  assert(get('battle.feedbackTimer') > 0, 'Battle intro message should be visible without adding a HUD');
  run('battle.playerEnergy = 4; battle.selectedMove = 1; executePlayerMove();');
  assert(get('battle.phase') === 'select', 'Invalid low-energy move should keep the player in command select when a cheaper move is available');
  assert(get('battle.message') === 'Not enough energy!', 'Low-energy move should explain why it failed');
  assert(get('battle.feedbackTimer') > 0, 'Low-energy message should be readable during select phase');
  run('battle.playerEnergy = 0; battle.selectedMove = 0; executePlayerMove();');
  assert(get('battle.phase') === 'anim', 'Zero-energy player should catch breath instead of getting stuck in command select');
  assert(get('battle.message') === 'You catch breath...', 'Zero-energy fallback should use the compact battle message box');
  assert(get('battle.playerEnergy') === get('PLAYER_ENERGY_REGEN'), 'Catch-breath fallback should restore the tuned regen amount');
  assert(get('battle.turnCount') === 1, 'Catch-breath fallback should consume exactly one player turn');
  flushTimers();
  flushTimers();
  run('battle.playerEnergy = 20; battle.selectedMove = 0; battle.playerTurn = true; battle.phase = "select"; battle.turnCount = 0; executePlayerMove();');
  assert(get('battle.subMessage') === '', 'Next battle action should clear stale low-energy detail text');
  run('battle.subMessage = "OLD DETAIL"; battle.turnCount = 1; endTurn();');
  assert(get('battle.message') === "Klaus's turn...", 'Enemy-turn banner should use the compact battle message helper');
  assert(get('battle.subMessage') === '', 'Enemy-turn banner should clear stale detail text');
  timers.length = 0;
  run('battle.enemyEnergy = 99; battle.enemyMoves = [MOVE_UNLOCKS[1]]; Math.random = () => 0; executeEnemyMove();');
  assert(get('battle.message') === 'Klaus: Layup! 2 pts!', 'Enemy scoring should keep the main message compact');
  assert(/^-[0-9]+ HP$/.test(get('battle.subMessage')), 'Enemy scoring should show player HP damage in the compact message subline');
  timers.length = 0;
  run('battle.enemyEnergy = 0; battle.turnCount = 1; battle.playerTurn = false; battle.phase = "anim"; executeEnemyMove();');
  assert(get('battle.enemyEnergy') === 0, 'Exhausted enemy rest should not add a hard-coded energy burst before end-turn regen');
  assert(get('battle.subMessage') === '+3 EN', 'Exhausted enemy rest message should match trainer regen');
  flushTimers();
  assert(get('battle.enemyEnergy') === 3, 'Exhausted enemy rest should receive exactly one normal trainer regen tick');
  assert(get('battle.phase') === 'select' && get('battle.playerTurn') === true, 'Enemy rest should hand control back to player cleanly');
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
