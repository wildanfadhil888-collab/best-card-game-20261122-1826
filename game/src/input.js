// Mouse and keyboard controls for The Clockwork Spire. Click a card to play it,
// click END TURN (or press Enter) to let the Guardian answer, keys 1-5 pick a
// hand card, keys 1-3 pick a draft card.
import { playHandCard, runGuardianTurn, takeDraftCard } from './state.js';
import { renderAll, showToast } from './render.js';

export function wireControls(state, rerender) {
  const hooks = {
    onPlayCard(handIndex, cardEl) {
      const result = playHandCard(state, handIndex);
      if (result === 'no-energy') {
        showToast('Not enough energy for that card!');
        if (cardEl) {
          cardEl.classList.add('shake');
          setTimeout(() => cardEl.classList.remove('shake'), 320);
        }
        return;
      }
      if (result === 'ok') rerender();
    },
    onDraftCard(choiceIndex) {
      if (takeDraftCard(state, choiceIndex)) {
        showToast('Card added to your deck — climb on!');
        rerender();
      }
    },
  };

  document.getElementById('start-button').addEventListener('click', () => {
    state.screen = 'battle';
    rerender();
  });
  document.getElementById('victory-again-button').addEventListener('click', () => window.location.reload());
  document.getElementById('defeat-again-button').addEventListener('click', () => window.location.reload());
  document.getElementById('end-turn-button').addEventListener('click', () => endTurn(state, rerender));

  document.addEventListener('keydown', (event) => {
    if (state.screen === 'title' && (event.key === 'Enter' || event.key === ' ')) {
      state.screen = 'battle';
      rerender();
      return;
    }
    if ((state.screen === 'victory' || state.screen === 'defeat') && event.key === 'Enter') {
      window.location.reload();
      return;
    }
    if (state.screen === 'draft') {
      const n = Number.parseInt(event.key, 10);
      if (n >= 1 && n <= state.draftChoices.length) hooks.onDraftCard(n - 1);
      return;
    }
    if (state.screen !== 'battle' || state.phase !== 'player') return;
    if (event.key === 'Enter') {
      endTurn(state, rerender);
      return;
    }
    const n = Number.parseInt(event.key, 10);
    if (n >= 1 && n <= state.hand.length) hooks.onPlayCard(n - 1, null);
  });

  return hooks;
}

function endTurn(state, rerender) {
  if (state.phase !== 'player' || state.screen !== 'battle') return;
  state.message = 'The Guardian winds up…';
  rerender();
  setTimeout(() => {
    runGuardianTurn(state, (steps) => {
      if (steps.length) showToast(steps[steps.length - 1]);
    });
    rerender();
  }, 650);
}
