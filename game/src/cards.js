// The Clockwork Spire card catalogue. Every card costs gears (energy) and deals
// attack, grants block, or both. Kinds: strike, guard, trick.
export const CARD_DEFS = [
  { id: 'strike',        name: 'Strike',         kind: 'STRIKE', cost: 1, attack: 6,  block: 0, sigil: '🔧', effect: '' },
  { id: 'guard',         name: 'Guard',          kind: 'GUARD',  cost: 1, attack: 0,  block: 5, sigil: '🛡️', effect: '' },
  { id: 'wrench-throw',  name: 'Wrench Throw',   kind: 'STRIKE', cost: 2, attack: 9,  block: 0, sigil: '🔩', effect: '' },
  { id: 'gear-toss',     name: 'Gear Toss',      kind: 'STRIKE', cost: 0, attack: 3,  block: 0, sigil: '⚙️', effect: 'Free — no energy' },
  { id: 'brass-wall',    name: 'Brass Wall',     kind: 'GUARD',  cost: 2, attack: 0,  block: 10, sigil: '🧱', effect: '' },
  { id: 'polished-plate', name: 'Polished Plate', kind: 'GUARD',  cost: 1, attack: 0,  block: 8, sigil: '✨', effect: '' },
  { id: 'overwind',      name: 'Overwind',       kind: 'STRIKE', cost: 2, attack: 12, block: 0, sigil: '🌪️', effect: '' },
  { id: 'mainspring',    name: 'Mainspring',     kind: 'STRIKE', cost: 3, attack: 16, block: 0, sigil: '🌀', effect: '' },
  { id: 'tick-tock',     name: 'Tick Tock',      kind: 'TRICK',  cost: 1, attack: 5,  block: 0, sigil: '⏰', effect: 'Draw 1 card' },
  { id: 'cog-swarm',     name: 'Cog Swarm',      kind: 'TRICK',  cost: 2, attack: 4,  block: 0, sigil: '⚙️', effect: 'Draw 1 card' },
  { id: 'spring-coil',   name: 'Spring Coil',    kind: 'TRICK',  cost: 2, attack: 7,  block: 5, sigil: '➰', effect: 'Attack and block' },
  { id: 'oil-can',       name: 'Oil Can',        kind: 'TRICK',  cost: 1, attack: 0,  block: 0, sigil: '🛢️', effect: 'Heal 6 HP' },
  { id: 'grand-strike',  name: 'Grand Strike',   kind: 'STRIKE', cost: 2, attack: 11, block: 0, sigil: '⚒️', effect: '' },
  { id: 'pendulum-swing', name: 'Pendulum Swing', kind: 'STRIKE', cost: 3, attack: 14, block: 4, sigil: '🔔', effect: 'Attack and block' },
];

export function lookupCard(id) {
  return CARD_DEFS.find((c) => c.id === id);
}

// The starting deck: 4 strikes, 3 guards, 1 wrench throw.
export function starterDeck() {
  return ['strike', 'strike', 'strike', 'strike', 'guard', 'guard', 'guard', 'wrench-throw'];
}

// Cards offered in a draft: everything except the three starters.
export const DRAFT_POOL = CARD_DEFS.filter((c) => !['strike', 'guard', 'wrench-throw'].includes(c.id));

// One guardian per floor. The fifth is the boss.
export const GUARDIANS = [
  { name: '⚙ COG RAT',            hp: 18, attack: 6,  block: 4, sigil: '🐀' },
  { name: '⚙ BRASS SENTRY',       hp: 24, attack: 8,  block: 5, sigil: '🗿' },
  { name: '⚙ GEAR GOLEM',         hp: 30, attack: 10, block: 6, sigil: '🤖' },
  { name: '⚙ PENDULUM WRAITH',    hp: 36, attack: 12, block: 7, sigil: '👻' },
  { name: '👑 THE GRAND HOROLOGIST', hp: 48, attack: 14, block: 8, sigil: '🎩' },
];
