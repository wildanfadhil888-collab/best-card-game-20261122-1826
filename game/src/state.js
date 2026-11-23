// The Clockwork Spire rules and climb state. No DOM here: pure game logic the
// renderer paints. Screens: title | battle | draft | victory | defeat.
import { DRAFT_POOL, GUARDIANS, lookupCard, starterDeck } from './cards.js';
import { makeRng } from './random.js';

export const MAX_HP = 40;
export const MAX_ENERGY = 3;
export const HAND_SIZE = 5;
export const FLOORS = 5;

export function newClimb(seed) {
  const rng = makeRng(seed);
  const state = {
    seed,
    rng,
    screen: 'title',
    floor: 1,
    score: 0,
    playerHp: MAX_HP,
    playerBlock: 0,
    enemyHp: GUARDIANS[0].hp,
    enemyMaxHp: GUARDIANS[0].hp,
    enemyBlock: 0,
    enemyIntent: { kind: 'attack', value: GUARDIANS[0].attack },
    energy: MAX_ENERGY,
    deck: starterDeck(),
    drawPile: [],
    discardPile: [],
    hand: [],
    played: [],
    phase: 'player',
    message: 'Your turn — play cards, then end your turn.',
    draftChoices: [],
    cardsPlayed: 0,
    floorsCleared: 0,
  };
  startFloor(state);
  return state;
}

export function guardianFor(floor) {
  return GUARDIANS[floor - 1];
}

function shuffleIntoDraw(state) {
  state.drawPile = [...state.deck];
  for (let i = state.drawPile.length - 1; i > 0; i--) {
    const j = Math.floor(state.rng() * (i + 1));
    [state.drawPile[i], state.drawPile[j]] = [state.drawPile[j], state.drawPile[i]];
  }
  state.discardPile = [];
}

function drawCards(state, n) {
  for (let i = 0; i < n; i++) {
    if (state.drawPile.length === 0) {
      if (state.discardPile.length === 0) return;
      state.drawPile = [...state.discardPile];
      state.discardPile = [];
      for (let k = state.drawPile.length - 1; k > 0; k--) {
        const j = Math.floor(state.rng() * (k + 1));
        [state.drawPile[k], state.drawPile[j]] = [state.drawPile[j], state.drawPile[k]];
      }
    }
    state.hand.push(state.drawPile.pop());
  }
}

export function startFloor(state) {
  const guardian = guardianFor(state.floor);
  state.enemyHp = guardian.hp;
  state.enemyMaxHp = guardian.hp;
  state.enemyBlock = 0;
  state.playerBlock = 0;
  state.energy = MAX_ENERGY;
  state.hand = [];
  state.played = [];
  state.phase = 'player';
  shuffleIntoDraw(state);
  drawCards(state, HAND_SIZE);
  rollIntent(state);
  state.message = `Floor ${state.floor} — ${guardian.name} blocks the stairs!`;
}

function rollIntent(state) {
  const guardian = guardianFor(state.floor);
  // The guardian mostly attacks; sometimes it braces instead.
  if (state.rng() < 0.3) {
    state.enemyIntent = { kind: 'defend', value: guardian.block };
  } else {
    state.enemyIntent = { kind: 'attack', value: guardian.attack };
  }
}

function damageEnemy(state, amount) {
  const absorbed = Math.min(state.enemyBlock, amount);
  state.enemyBlock -= absorbed;
  state.enemyHp -= (amount - absorbed);
  state.score += amount - absorbed;
}

function damagePlayer(state, amount) {
  const absorbed = Math.min(state.playerBlock, amount);
  state.playerBlock -= absorbed;
  state.playerHp -= (amount - absorbed);
}

// Play one hand card. Returns 'ok', 'no-energy', 'not-your-turn' or 'over'.
export function playHandCard(state, handIndex) {
  if (state.phase !== 'player' || state.screen !== 'battle') return 'not-your-turn';
  const id = state.hand[handIndex];
  if (!id) return 'over';
  const card = lookupCard(id);
  if (card.cost > state.energy) return 'no-energy';
  state.hand.splice(handIndex, 1);
  state.discardPile.push(id);
  state.energy -= card.cost;
  state.cardsPlayed += 1;
  if (card.attack > 0) damageEnemy(state, card.attack);
  if (card.block > 0) state.playerBlock += card.block;
  if (card.id === 'oil-can') state.playerHp = Math.min(MAX_HP, state.playerHp + 6);
  if (card.id === 'tick-tock' || card.id === 'cog-swarm') drawCards(state, 1);
  state.played.push({ name: card.name, attack: card.attack, block: card.block });
  state.message = card.attack > 0
    ? `${card.name} hits for ${card.attack}!`
    : `${card.name} — ${card.effect || 'braced.'}`;
  if (state.enemyHp <= 0) {
    state.enemyHp = 0;
    state.floorsCleared += 1;
    if (state.floor >= FLOORS) {
      state.screen = 'victory';
      state.phase = 'over';
      state.message = 'The Spire is yours!';
    } else {
      state.screen = 'draft';
      state.phase = 'draft';
      state.draftChoices = pickDraft(state);
      state.message = `Floor ${state.floor} cleared!`;
    }
  }
  return 'ok';
}

function pickDraft(state) {
  const pool = [...DRAFT_POOL];
  const choices = [];
  while (choices.length < 3 && pool.length > 0) {
    const i = Math.floor(state.rng() * pool.length);
    choices.push(pool.splice(i, 1)[0].id);
  }
  return choices;
}

// Take a drafted card, then climb to the next floor.
export function takeDraftCard(state, choiceIndex) {
  if (state.screen !== 'draft') return false;
  const id = state.draftChoices[choiceIndex];
  if (!id) return false;
  state.deck.push(id);
  state.floor += 1;
  state.screen = 'battle';
  startFloor(state);
  return true;
}

// The guardian acts on its telegraphed intent, then the player draws a new hand.
export function runGuardianTurn(state, onStep) {
  if (state.phase !== 'player' || state.screen !== 'battle') return;
  state.phase = 'enemy';
  const steps = [];
  if (state.enemyIntent.kind === 'attack') {
    damagePlayer(state, state.enemyIntent.value);
    steps.push(`${guardianFor(state.floor).name} strikes for ${state.enemyIntent.value}!`);
  } else {
    state.enemyBlock += state.enemyIntent.value;
    steps.push(`${guardianFor(state.floor).name} braces for ${state.enemyIntent.value} block.`);
  }
  if (state.playerHp <= 0) {
    state.playerHp = 0;
    state.screen = 'defeat';
    state.phase = 'over';
    state.message = 'The Spire stands silent.';
  } else {
    state.playerBlock = 0;
    state.energy = MAX_ENERGY;
    state.discardPile.push(...state.hand);
    state.hand = [];
    drawCards(state, HAND_SIZE);
    state.played = [];
    rollIntent(state);
    state.phase = 'player';
    state.message = steps[steps.length - 1];
  }
  if (onStep) onStep(steps);
}
