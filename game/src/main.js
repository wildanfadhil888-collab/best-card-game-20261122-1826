// The Clockwork Spire bootstrap: read ?shot= / ?seed=, build the climb, wire
// controls, paint the first frame. No network, no libraries — vanilla DOM only.
import { newClimb } from './state.js';
import { climbForShot } from './shots.js';
import { renderAll } from './render.js';
import { wireControls } from './input.js';

const params = new URLSearchParams(window.location.search);
const seed = Number.parseInt(params.get('seed') ?? '1', 10) || 1;
const shot = params.get('shot');

const state = shot ? climbForShot(shot, seed) ?? newClimb(seed) : newClimb(seed);

let hooks;
function rerender() {
  renderAll(state, hooks);
}
hooks = wireControls(state, rerender);
rerender();
