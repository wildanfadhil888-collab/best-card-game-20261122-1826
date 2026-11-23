// The Clockwork Spire renderer: turns climb state into DOM. It never changes
// the rules, it only paints them — hp bars, intent badge, energy gears, hands,
// draft choices and end screens.
import { guardianFor, MAX_HP } from './state.js';
import { lookupCard } from './cards.js';

const $ = (id) => document.getElementById(id);

function cardElement(id, onClick, handIndex, draftMode) {
  const card = lookupCard(id);
  const el = document.createElement('div');
  el.className = `card${draftMode ? ' draft-card' : ''}`;
  const values = [];
  if (card.attack > 0) values.push(`<span class="atk">⚔ ${card.attack}</span>`);
  if (card.block > 0) values.push(`<span class="blk">🛡 ${card.block}</span>`);
  el.innerHTML =
    `<div class="card-cost">${card.cost}</div>` +
    `<div class="card-name">${card.name}</div>` +
    `<div class="card-sigil">${card.sigil}</div>` +
    `<div class="card-values">${values.join(' &nbsp;') || '—'}</div>` +
    `<div class="card-effect">${card.effect}</div>` +
    `<div class="card-kind">${card.kind}</div>`;
  if (onClick) el.addEventListener('click', () => onClick(handIndex, el));
  return el;
}

export function renderAll(state, hooks) {
  const show = (id, visible) => $(id).classList.toggle('hidden', !visible);
  show('title-screen', state.screen === 'title');
  show('battle-screen', state.screen === 'battle');
  show('draft-screen', state.screen === 'draft');
  show('victory-screen', state.screen === 'victory');
  show('defeat-screen', state.screen === 'defeat');

  if (state.screen === 'battle') {
    const guardian = guardianFor(state.floor);
    $('floor-label').textContent = `FLOOR ${state.floor} / 5`;
    $('deck-label').textContent = `DECK ${state.deck.length} CARDS`;
    $('guardian-name').textContent = guardian.name;
    const intent = $('intent-badge');
    if (state.enemyIntent.kind === 'attack') {
      intent.className = 'intent attack';
      intent.textContent = `⚔ ${state.enemyIntent.value}`;
    } else {
      intent.className = 'intent defend';
      intent.textContent = `🛡 ${state.enemyIntent.value}`;
    }
    $('enemy-hp-fill').style.width = `${(state.enemyHp / state.enemyMaxHp) * 100}%`;
    $('enemy-hp-text').textContent = `${state.enemyHp} / ${state.enemyMaxHp}`;
    $('enemy-block').textContent = state.enemyBlock > 0 ? `🛡 Block ${state.enemyBlock}` : '';
    $('player-hp-fill').style.width = `${(state.playerHp / MAX_HP) * 100}%`;
    $('player-hp-text').textContent = `${state.playerHp} / ${MAX_HP}`;
    $('player-block').textContent = state.playerBlock > 0 ? `🛡 Block ${state.playerBlock}` : '';
    $('arena-message').textContent = state.message;
    $('energy-text').textContent = `${state.energy} / 3 energy`;
    $('energy-gears').textContent = '⚙️'.repeat(state.energy) + '·'.repeat(Math.max(0, 3 - state.energy));
    $('score-text').textContent = String(state.score);
    $('end-turn-button').disabled = state.phase !== 'player';

    const myRow = $('player-row');
    myRow.innerHTML = '';
    state.hand.forEach((id, i) => {
      const card = lookupCard(id);
      const el = cardElement(id, hooks.onPlayCard, i, false);
      if (card.cost > state.energy || state.phase !== 'player') el.classList.add('unaffordable');
      myRow.appendChild(el);
    });

    const played = $('played-row');
    played.innerHTML = '';
    state.played.forEach((p) => {
      const chip = document.createElement('div');
      chip.className = 'played-chip';
      chip.textContent = p.attack > 0 ? `${p.name} ⚔ ${p.attack}` : `${p.name} 🛡 ${p.block}`;
      played.appendChild(chip);
    });
  }

  if (state.screen === 'draft') {
    $('draft-line').textContent =
      `${guardianFor(state.floor).name} winds down. The Spire offers you a new card.`;
    const row = $('draft-row');
    row.innerHTML = '';
    state.draftChoices.forEach((id, i) => {
      row.appendChild(cardElement(id, hooks.onDraftCard, i, true));
    });
  }

  if (state.screen === 'victory') {
    $('victory-stats').innerHTML =
      `Floors cleared: <b>5 / 5</b><br>` +
      `Final score: <b>${state.score}</b> damage dealt &nbsp;·&nbsp; Cards played: <b>${state.cardsPlayed}</b><br>` +
      `Your HP: <b>${state.playerHp}</b> &nbsp;·&nbsp; Deck size: <b>${state.deck.length}</b> cards`;
  }

  if (state.screen === 'defeat') {
    $('defeat-stats').innerHTML =
      `You fell on floor <b>${state.floor} / 5</b> — ${guardianFor(state.floor).name}<br>` +
      `Score: <b>${state.score}</b> damage dealt &nbsp;·&nbsp; Cards played: <b>${state.cardsPlayed}</b><br>` +
      `Deck size: <b>${state.deck.length}</b> cards`;
  }
}

let toastTimer = 0;
export function showToast(text) {
  const toast = $('toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}
