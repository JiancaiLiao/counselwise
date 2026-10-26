/* Counselwise landing page behaviour (S10 version, 26 Oct 2026; copied from S8 and changed only in the pixel events)
   - reads the experimental arm from ?arm= (single | multi) and keeps it for the session; anything else is 'unknown'
   - opens the waitlist panel and records the two custom pixel events, both stamped with the arm:
       fbq('trackCustom', 'WaitlistClick', { arm: arm })
       fbq('trackCustom', 'MC_answer',     { arm: arm, answer: 'one' | 'four' | 'dont_remember' })
   - the page content is identical for both arms; the arm is never shown or used to change any text
   - falls back to console.log('[pixel]', ...) when the Meta Pixel is not loaded */

(function () {
  'use strict';

  var VALID_ARMS = ['single', 'multi'];
  var STORAGE_KEY = 'cw_arm';

  function readStoredArm() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeArm(arm) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, arm);
    } catch (e) {
      /* storage unavailable (private mode, blocked); carry on */
    }
  }

  function resolveArm() {
    var fromUrl = null;
    try {
      fromUrl = new URLSearchParams(window.location.search).get('arm');
    } catch (e) {
      fromUrl = null;
    }
    if (fromUrl && VALID_ARMS.indexOf(fromUrl) !== -1) {
      storeArm(fromUrl);
      return fromUrl;
    }
    var stored = readStoredArm();
    if (stored && VALID_ARMS.indexOf(stored) !== -1) {
      return stored;
    }
    return 'unknown';
  }

  var ARM = resolveArm();

  /* Pixel wrapper: use fbq when configured, otherwise log so the page can be tested locally */
  function pixel() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof window.fbq === 'function') {
      try {
        window.fbq.apply(null, args);
        return;
      } catch (e) {
        /* fall through to console */
      }
    }
    console.log.apply(console, ['[pixel]'].concat(args));
  }

  console.log('[pixel] arm =', ARM);
  pixel('track', 'PageView');

  /* Waitlist panel */
  var backdrop = document.getElementById('waitlist-panel');
  if (!backdrop) { return; }

  var panel = backdrop.querySelector('.panel');
  var closeBtn = backdrop.querySelector('.panel-close');
  var question = document.getElementById('panel-question');
  var result = document.getElementById('panel-result');
  var lastTrigger = null;

  function openPanel(trigger) {
    lastTrigger = trigger || null;
    backdrop.classList.add('is-open');
    backdrop.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    pixel('trackCustom', 'WaitlistClick', { arm: ARM });
    window.setTimeout(function () {
      if (closeBtn) { closeBtn.focus(); }
    }, 0);
  }

  function closePanel() {
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
  }

  var triggers = document.querySelectorAll('[data-waitlist]');
  Array.prototype.forEach.call(triggers, function (btn) {
    btn.addEventListener('click', function () { openPanel(btn); });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }

  backdrop.addEventListener('click', function (event) {
    if (event.target === backdrop) { closePanel(); }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && backdrop.classList.contains('is-open')) {
      closePanel();
    }
  });

  /* Keep tab focus inside the panel while it is open */
  backdrop.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab' || !panel) { return; }
    var focusable = panel.querySelectorAll('button:not([disabled]), a[href]');
    if (!focusable.length) { return; }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* Manipulation-check question ("how many AI assistants did the ad mention?"); the answer goes to the pixel with the arm */
  var answerButtons = backdrop.querySelectorAll('[data-answer]');
  Array.prototype.forEach.call(answerButtons, function (btn) {
    btn.addEventListener('click', function () {
      var answer = btn.getAttribute('data-answer');
      pixel('trackCustom', 'MC_answer', { arm: ARM, answer: answer });
      if (question) { question.setAttribute('hidden', ''); }
      if (result) {
        result.removeAttribute('hidden');
        var link = result.querySelector('a');
        if (link) { link.focus(); }
      }
    });
  });
})();
