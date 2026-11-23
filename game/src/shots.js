// Deterministic screenshot presets: ?shot=start|play|win|loss (&seed=1) jumps
// the climb straight to that screen so every screenshot is a real render.
import { newClimb, playHandCard, runGuardianTurn } from './state.js';

export const SHOT_NAMES = ['start', 'play', 'win', 'loss'];

export function applyShot(state, shot) {
  if (shot === 'start') {
    state.screen = 'title';
    return state;
  }
  if (shot === 'play') {
    // A lively mid-climb battle: floor 2, both sides hurt, energy half spent.
    state.screen = 'battle';
    state.floor = 2;
    state.score = 23;
    state.playerHp = 31;
    state.playerBlock = 5;
    state.enemyHp = 14;
    state.enemyMaxHp = 24;
    state.enemyBlock = 3;
    state.enemyIntent = { kind: 'attack', value: 8 };
    state.energy = 2;
    state.deck = ['strike', 'strike', 'strike', 'strike', 'guard', 'guard', 'guard',
      'wrench-throw', 'overwind', 'tick-tock', 'brass-wall'];
    state.hand = ['overwind', 'tick-tock', 'guard', 'wrench-throw', 'strike'];
    state.played = [
      { name: 'Strike', attack: 6, block: 0 },
      { name: 'Guard', attack: 0, block: 5 },
    ];
    state.message = 'Strike hits for 6! Your turn — play cards, then end your turn.';
    return state;
  }
  if (shot === 'win') {
    // Floor victory + draft: the shot that shows the deck-builder.
    state.screen = 'draft';
    state.phase = 'draft';
    state.floor = 2;
    state.floorsCleared = 2;
    state.score = 41;
    state.draftChoices = ['mainspring', 'brass-wall', 'tick-tock'];
    state.message = 'Floor 2 cleared!';
    return state;
  }
  if (shot === 'loss') {
    state.screen = 'defeat';
    state.phase = 'over';
    state.floor = 3;
    state.score = 38;
    state.playerHp = 0;
    state.cardsPlayed = 14;
    return state;
  }
  return state;
}

export function climbForShot(shot, seed) {
  if (!SHOT_NAMES.includes(shot)) return null;
  return applyShot(newClimb(seed), shot);
}
