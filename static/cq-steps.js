/**
 * cq-steps.js: the exercise's steps, kept on screen over the code area.
 *
 * Codabox opens the editor on `/?cq_project=<id>` when a child starts a
 * parcours exercise. This asks Codabox which exercise that project belongs to
 * and draws its steps as a strip at the top of the code area: one dot per step,
 * and a bubble under it with the step to do now, "J'ai fini" to move on and
 * "Retour" to go back. "Objectif" swaps the bubble for the exercise's goal and
 * its blocks. The bubble folds away and the strip stays, so it never hides the
 * child's script for good.
 *
 * Which step the child is on is remembered in this browser per project, so a
 * reload or tomorrow's session comes back to the same step.
 *
 * Everything here is optional. A project that is not exercise work, a signed
 * out child or Codabox being down all leave the editor exactly as it was.
 */

(function () {
  'use strict';

  var LMS_ORIGIN = 'https://codabox.codaquest.com';
  // Must match SCRATCH_EDITOR_PROJECT_PARAM in the LMS (lib/scratch-editor.ts).
  var PROJECT_PARAM = 'cq_project';
  var STORAGE_PREFIX = 'cq_steps_';

  function guiStore() {
    var store = window.__SCRATCHGUI_STORE__ || window.ReduxStore;
    return store && typeof store.getState === 'function' ? store : null;
  }

  function locale() {
    try {
      var store = guiStore();
      if (store && store.getState().locales.locale === 'en') return 'en';
    } catch (e) { /* fall through */ }
    try {
      if (new URL(window.location.href).searchParams.get('locale') === 'en') return 'en';
    } catch (e) { /* French */ }
    return 'fr';
  }

  function t(fr, en) {
    return locale() === 'en' ? en : fr;
  }

  function projectId() {
    try {
      return new URL(window.location.href).searchParams.get(PROJECT_PARAM);
    } catch (e) {
      return null;
    }
  }

  // ── Progress, per project, in this browser ──────────────────────────────

  function readStep(id) {
    try {
      var n = parseInt(localStorage.getItem(STORAGE_PREFIX + id), 10);
      return isNaN(n) ? 0 : n;
    } catch (e) {
      return 0;
    }
  }

  function writeStep(id, n) {
    try { localStorage.setItem(STORAGE_PREFIX + id, String(n)); } catch (e) { /* private mode */ }
  }

  // ── Fetch ───────────────────────────────────────────────────────────────

  /** Null when there is nothing to show, whatever the reason. */
  async function fetchExercise(id) {
    try {
      var res = await fetch(
        LMS_ORIGIN + '/api/projects/' + encodeURIComponent(id) + '/scratch-exercise?locale=' + locale(),
        { credentials: 'include', cache: 'no-store' }
      );
      if (!res.ok) return null;
      var body = await res.json();
      var exercise = body && body.exercise;
      if (!exercise || !Array.isArray(exercise.steps)) return null;
      return exercise;
    } catch (e) {
      return null;
    }
  }

  // ── DOM helpers ─────────────────────────────────────────────────────────

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function button(className, text, onClick) {
    var node = el('button', className, text);
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
  }

  var CSS =
    '#cq-steps{position:fixed;z-index:500;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;' +
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#575E75;}' +
    '#cq-steps[hidden]{display:none;}' +
    '#cq-steps button{font:inherit;font-weight:700;border:0;border-radius:8px;cursor:pointer;height:34px;padding:0 14px;}' +
    '#cq-steps .cq-primary{background:#855CD6;color:#fff;}' +
    '#cq-steps .cq-primary:hover{background:#7148c7;}' +
    '#cq-steps .cq-ghost{background:#fff;color:#575E75;border:1px solid #D9D9E3;}' +
    '#cq-steps .cq-ghost:hover{background:#f4f4f8;}' +
    '#cq-steps .cq-strip{pointer-events:auto;display:flex;align-items:center;background:#fff;border:1px solid #D9D9E3;border-radius:22px;' +
      'padding:5px 6px 5px 10px;box-shadow:0 3px 10px rgba(0,0,0,.08);}' +
    '#cq-steps .cq-dot{width:28px;height:28px;padding:0!important;border-radius:50%!important;background:#E5E7EF;color:#575E75;display:grid;place-items:center;}' +
    '#cq-steps .cq-dot.cq-done{background:#0FBD8C;color:#fff;}' +
    '#cq-steps .cq-dot.cq-current{background:#855CD6;color:#fff;box-shadow:0 0 0 4px #E3D7FF;}' +
    '#cq-steps .cq-line{width:48px;height:4px;background:#E5E7EF;margin:0 6px;border-radius:2px;}' +
    '#cq-steps .cq-line.cq-done{background:#0FBD8C;}' +
    '#cq-steps .cq-goal{margin-left:12px;height:28px!important;border-radius:14px!important;background:#F1EBFF;color:#855CD6;}' +
    '#cq-steps .cq-goal.cq-on{background:#855CD6;color:#fff;}' +
    '#cq-steps .cq-fold{margin-left:6px;height:28px!important;width:28px;padding:0!important;border-radius:14px!important;background:#F4F4F8;color:#575E75;}' +
    '#cq-steps .cq-bubble{pointer-events:auto;position:relative;width:100%;box-sizing:border-box;background:#fff;border:2px solid #855CD6;' +
      'border-radius:14px;padding:12px 14px;box-shadow:0 8px 24px rgba(0,0,0,.12);}' +
    '#cq-steps .cq-bubble.cq-finished{border-color:#0FBD8C;}' +
    '#cq-steps .cq-text{margin:0 0 4px;font-size:17px;line-height:1.4;color:#2b2f3d;}' +
    '#cq-steps .cq-detail{margin:0 0 4px;font-size:14px;line-height:1.4;font-style:italic;color:#575E75;}' +
    '#cq-steps .cq-label{margin:0 0 4px;text-transform:uppercase;font-size:11px;font-weight:700;letter-spacing:.06em;color:#855CD6;}' +
    '#cq-steps .cq-blocks{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}' +
    '#cq-steps .cq-blocks span{background:#FFAB19;color:#fff;font-size:12px;font-weight:700;padding:5px 10px;border-radius:6px;}' +
    '#cq-steps .cq-actions{display:flex;align-items:center;gap:10px;margin-top:10px;}' +
    '#cq-steps .cq-grow{flex:1;}';

  // ── The strip ───────────────────────────────────────────────────────────

  function mount(id, exercise) {
    var steps = exercise.steps;
    var total = steps.length;
    var state = {
      // `total` means every step is done.
      step: Math.min(Math.max(readStep(id), 0), total),
      showGoal: total === 0,
      folded: false,
    };

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = el('div');
    root.id = 'cq-steps';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', t('Étapes de l\'exercice', 'Exercise steps'));
    document.body.appendChild(root);

    function go(n) {
      state.step = Math.min(Math.max(n, 0), total);
      state.showGoal = false;
      state.folded = false;
      writeStep(id, state.step);
      render();
    }

    function strip() {
      var bar = el('div', 'cq-strip');
      steps.forEach(function (_, i) {
        if (i > 0) bar.appendChild(el('span', 'cq-line' + (i <= state.step ? ' cq-done' : '')));
        var done = i < state.step;
        var dot = button(
          'cq-dot' + (done ? ' cq-done' : i === state.step && !state.showGoal ? ' cq-current' : ''),
          done ? '✓' : String(i + 1),
          function () { go(i); }
        );
        dot.setAttribute('aria-label', t('Étape ', 'Step ') + (i + 1));
        bar.appendChild(dot);
      });
      bar.appendChild(button('cq-goal' + (state.showGoal && !state.folded ? ' cq-on' : ''), t('Objectif', 'Goal'), function () {
        state.showGoal = !state.showGoal || state.folded;
        state.folded = false;
        render();
      }));
      var fold = button('cq-fold', state.folded ? '▾' : '–', function () {
        state.folded = !state.folded;
        render();
      });
      fold.setAttribute('aria-label', state.folded ? t('Afficher', 'Show') : t('Réduire', 'Hide'));
      bar.appendChild(fold);
      return bar;
    }

    function goalBubble() {
      var bubble = el('div', 'cq-bubble');
      bubble.appendChild(el('p', 'cq-label', exercise.title));
      if (exercise.objective) bubble.appendChild(el('p', 'cq-text', exercise.objective));
      if (exercise.blocks && exercise.blocks.length) {
        var blocks = el('div', 'cq-blocks');
        exercise.blocks.forEach(function (b) { blocks.appendChild(el('span', null, b)); });
        bubble.appendChild(blocks);
      }
      if (total > 0) {
        var actions = el('div', 'cq-actions');
        actions.appendChild(button('cq-ghost', t('Voir les étapes', 'See the steps'), function () {
          state.showGoal = false;
          render();
        }));
        bubble.appendChild(actions);
      }
      return bubble;
    }

    function stepBubble() {
      var step = steps[state.step];
      var bubble = el('div', 'cq-bubble');
      bubble.appendChild(el('p', 'cq-text', step.instruction));
      if (step.detail) bubble.appendChild(el('p', 'cq-detail', step.detail));
      var actions = el('div', 'cq-actions');
      if (state.step > 0) actions.appendChild(button('cq-ghost', '‹ ' + t('Retour', 'Back'), function () { go(state.step - 1); }));
      actions.appendChild(el('span', 'cq-grow'));
      actions.appendChild(button('cq-primary', t('J\'ai fini', 'Done') + ' ✓', function () { go(state.step + 1); }));
      bubble.appendChild(actions);
      return bubble;
    }

    function finishedBubble() {
      var bubble = el('div', 'cq-bubble cq-finished');
      var text = el('p', 'cq-text');
      text.appendChild(el('b', null, t('Toutes les étapes sont faites. ', 'Every step is done. ')));
      text.appendChild(document.createTextNode(t(
        'Clique sur le drapeau vert pour vérifier, puis rends ton travail dans Codabox.',
        'Click the green flag to check, then hand in your work in Codabox.'
      )));
      bubble.appendChild(text);
      var actions = el('div', 'cq-actions');
      actions.appendChild(button('cq-ghost', t('Revoir les étapes', 'Go over the steps again'), function () { go(0); }));
      bubble.appendChild(actions);
      return bubble;
    }

    function render() {
      root.textContent = '';
      root.appendChild(strip());
      if (state.folded) return;
      if (state.showGoal) root.appendChild(goalBubble());
      else if (state.step >= total) root.appendChild(finishedBubble());
      else root.appendChild(stepBubble());
    }

    render();
    followCodeArea(root);
  }

  /**
   * Sit at the top of the code area wherever it is: it moves with the stage
   * size buttons, and it is gone in the Costumes tab and in full screen.
   */
  function followCodeArea(root) {
    function place() {
      var area = document.querySelector('.injectionDiv');
      var rect = area && area.getBoundingClientRect();
      var store = guiStore();
      var fullScreen = false;
      try { fullScreen = Boolean(store && store.getState().scratchGui.mode.isFullScreen); } catch (e) { /* not full screen */ }
      if (!rect || rect.width < 200 || fullScreen) {
        root.hidden = true;
        return;
      }
      // The code area starts where the block palette ends.
      var flyout = area.querySelector('.blocklyFlyout');
      var flyoutRect = flyout && flyout.getBoundingClientRect();
      var left = flyoutRect && flyoutRect.width > 0 ? Math.max(rect.left, flyoutRect.right) : rect.left;
      var free = rect.right - left;
      if (free < 200) {
        root.hidden = true;
        return;
      }
      root.hidden = false;
      var width = Math.min(560, free - 40);
      root.style.width = width + 'px';
      root.style.top = (rect.top + 10) + 'px';
      root.style.left = (left + (free - width) / 2) + 'px';
    }
    place();
    window.addEventListener('resize', place);
    var store = guiStore();
    if (store && typeof store.subscribe === 'function') store.subscribe(place);
    if (typeof ResizeObserver === 'function') {
      var watched = null;
      var observer = new ResizeObserver(place);
      setInterval(function () {
        var area = document.querySelector('.injectionDiv');
        if (area !== watched) {
          if (watched) observer.unobserve(watched);
          if (area) observer.observe(area);
          watched = area;
          place();
        }
      }, 500);
    }
  }

  /** The code area exists once the GUI has rendered. */
  function waitForCodeArea() {
    return new Promise(function (resolve) {
      var tries = 0;
      var iv = setInterval(function () {
        if (document.querySelector('.injectionDiv') || tries++ > 300) {
          clearInterval(iv);
          resolve();
        }
      }, 100);
    });
  }

  async function boot() {
    var id = projectId();
    if (!id) return;
    var exercise = await fetchExercise(id);
    if (!exercise) return;
    await waitForCodeArea();
    mount(id, exercise);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
