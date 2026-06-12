(function () {
  let editorRef = null;
  let leaving = false;

  function isPerfLow() {
    return !!(window.EditorPerfProfile?.isLow?.() || document.documentElement.classList.contains('perf-low'));
  }

  function applyGlobalFontScale() {
    const STORAGE_KEY = 'tamanho-fonte-global';
    const DEFAULT_SIZE = 16;
    const MIN_SIZE = DEFAULT_SIZE;
    const MAX_SIZE = DEFAULT_SIZE + 10;

    const raw = parseInt(localStorage.getItem(STORAGE_KEY) || DEFAULT_SIZE, 10);
    const size = Math.min(MAX_SIZE, Math.max(MIN_SIZE, Number.isFinite(raw) ? raw : DEFAULT_SIZE));
    const scale = size / DEFAULT_SIZE;
    const root = document.documentElement;
    root.style.setProperty('--tamanho-fonte', `${size}px`);
    root.style.setProperty('--font-base-default', String(DEFAULT_SIZE));
    root.style.setProperty('--font-base-global', `${size}px`);
    root.style.setProperty('--font-scale-global', String(scale));
    root.dataset.fontSizeGlobal = String(size);
  }

  applyGlobalFontScale();

  // ── COR GLOBAL + CONTRASTE ──────────────────────────────────────────────
  function applyCorGlobal() {
    const params = new URLSearchParams(location.search);
    const cor = (params.get('cor') || '').trim();
    if (!cor) return;

    document.documentElement.style.setProperty('--cor-global', cor);

    // Converte a cor para RGB via canvas (aceita hex, rgb, hsl, named colors...)
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillStyle = cor;
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

    // Luminância relativa WCAG 2.1
    function linearize(c) {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    }
    const L = 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);

    // Qual contraste é maior — texto branco ou texto preto?
    const contrasteComBranco = 1.05 / (L + 0.05);
    const contrasteComPreto  = (L + 0.05) / 0.05;

    const textoClaro  = '#ffffff';
    const textoEscuro = '#1a1a1a';
    const texto = contrasteComBranco >= contrasteComPreto ? textoClaro : textoEscuro;

    // Opacidade para elementos secundários (kicker, status)
    const textoParcial = texto === textoClaro
      ? 'rgba(255,255,255,0.55)'
      : 'rgba(0,0,0,0.42)';

    const backBg = texto === textoClaro
      ? 'rgba(255,255,255,0.14)'
      : 'rgba(0,0,0,0.10)';

    document.documentElement.style.setProperty('--fullsc-topbar-text', texto);
    document.documentElement.style.setProperty('--fullsc-topbar-text-muted', textoParcial);
    document.documentElement.style.setProperty('--fullsc-back-bg', backBg);
  }

  applyCorGlobal();
  // ────────────────────────────────────────────────────────────────────────

  function qs(name) {
    return new URLSearchParams(location.search).get(name) || '';
  }

  function decode(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value || '';
    }
  }

  function getStorageKey() {
    return qs('id') || 'asmb-fullsc-temp';
  }

  function stripTrailingScriptureRefs(title) {
    const raw = String(title || '').trim();
    if (!raw) return raw;

    const match = raw.match(/\s*\(([^()]*)\)\s*$/);
    if (!match) return raw;

    const refs = (match[1] || '').trim();
    const looksLikeBibleRefs =
      /\d/.test(refs) &&
      /[:;,-–—]/.test(refs) &&
      /[A-Za-zÀ-ÿ]/.test(refs);

    if (!looksLikeBibleRefs) return raw;
    return raw.slice(0, match.index).trim();
  }

  function titleFromId(id) {
    return String(id || '')
      .replace(/^asmb-/, '')
      .replace(/-/g, ' ')
      .trim() || 'Anotação';
  }

  function getAgent() {
    return window.AssembleiaIA || null;
  }

  function waitForEditor() {
    return new Promise((resolve) => {
      const check = () => {
        const editor = document.getElementById('editor');
        const ready = editor && typeof M6_Tree !== 'undefined' && typeof M5_Factory !== 'undefined' && typeof M3_TextModel !== 'undefined';
        if (ready) resolve(editor);
        else setTimeout(check, 80);
      };
      check();
    });
  }

  function looksLikeV23Markup(html) {
    return /class\s*=\s*["'][^"']*(node-paragraph|node-toggle|node-text)/i.test(html || '');
  }

  function ensureRoot(editor) {
    if (!editor) return;
    if (editor.children.length) return;
    const bloco = typeof M5_Factory !== 'undefined' ? M5_Factory.para('') : null;
    if (bloco) editor.appendChild(bloco);
    if (typeof M3_TextModel !== 'undefined') M3_TextModel.syncAll();
    if (typeof M11_Layout !== 'undefined') M11_Layout.schedule(2);
  }

  function applyHTML(editor, html) {
    const trimmed = (html || '').trim();
    editor.innerHTML = '';
    if (!trimmed) {
      ensureRoot(editor);
      return;
    }

    if (looksLikeV23Markup(trimmed)) {
      editor.innerHTML = trimmed;
    } else if (typeof M5_Factory !== 'undefined' && typeof M2_Query !== 'undefined') {
      const bloco = M5_Factory.para('');
      const editable = M2_Query.getParC(bloco);
      if (editable) editable.innerHTML = trimmed;
      editor.appendChild(bloco);
    } else {
      editor.innerHTML = trimmed;
    }

    ensureRoot(editor);
    if (typeof M3_TextModel !== 'undefined') M3_TextModel.syncAll();
    if (typeof M11_Layout !== 'undefined') M11_Layout.schedule(2);
  }

  function exportHTML(editor) {
    return editor ? editor.innerHTML : '';
  }

  function goBack() {
    const from = qs('from');
    leaving = true;
    if (history.length > 1) {
      history.back();
      return;
    }
    location.href = decode(from) || '../../../index.html';
  }

  function queueSummaryAndLeave() {
    if (leaving || !editorRef) return;
    leaving = true;
    const key = getStorageKey();
    const agent = getAgent();
    const html = exportHTML(editorRef);

    try {
      if (agent?.queueSummaryFromFull) {
        agent.queueSummaryFromFull(key, html);
      } else if (agent?.saveFullDraft) {
        agent.saveFullDraft(key, html);
      }
    } catch {}

    goBack();
  }

  function setupBack() {
    const btn = document.getElementById('fullscBack');
    if (!btn) return;
    btn.addEventListener('click', () => {
      queueSummaryAndLeave();
    });
  }

  function setupTitle() {
    const titleEl = document.getElementById('fullscTitle');
    const kickerEl = document.querySelector('.fullsc-kicker');
    if (!titleEl) return;

    const rawTitle = decode(qs('title')) || titleFromId(getStorageKey());
    const title = stripTrailingScriptureRefs(rawTitle);
    const isSymposium = qs('isSymposium') === '1';
    const symposiumTitle = decode(qs('symposiumTitle'));

    titleEl.textContent = title;

    if (kickerEl) {
      if (isSymposium && symposiumTitle) {
        kickerEl.textContent = symposiumTitle;
        kickerEl.hidden = false;
        kickerEl.classList.remove('is-hidden');
      } else {
        kickerEl.textContent = '';
        kickerEl.hidden = true;
        kickerEl.classList.add('is-hidden');
      }
    }

    document.title = title + ' — Full Screen';
  }

  function bootAnim() {
    if (isPerfLow()) {
      document.body.classList.remove('fullsc-boot');
      document.body.classList.add('fullsc-ready');
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove('fullsc-boot');
        document.body.classList.add('fullsc-ready');
      });
    });
  }

  function syncToolbarFocusState(editor) {
    if (!editor || !document.body) return;

    const sel = window.getSelection?.();
    const selectionInside = !!(sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode));
    const activeInside = document.activeElement === editor || editor.contains(document.activeElement);
    const keepVisible = document.body.classList.contains('leitor-keep-toolbar') || document.body.classList.contains('zombie-toolbar-active');

    if (selectionInside || activeInside || keepVisible) {
      document.body.classList.add('editor-has-focus');
    } else {
      document.body.classList.remove('editor-has-focus');
    }
  }


  function isIOSStandalonePwa() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.navigator.standalone === true || !!window.matchMedia?.('(display-mode: standalone)')?.matches;
    return isIOS && isStandalone;
  }

  function getFullscToolbarViewportMetrics() {
    const vv = window.visualViewport;
    const rawBottomGap = vv
      ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
      : 0;

    const keyboardOpen = rawBottomGap > 100;
    let bottomGap = rawBottomGap;

    // No iOS em modo PWA/standalone, o WebKit costuma entregar a barra fixa
    // um pouco acima do teclado quando usamos o mesmo cálculo do navegador.
    // A correção abaixo só roda em PWA + teclado aberto, então não mexe no Safari.
    if (isIOSStandalonePwa() && keyboardOpen) {
      const correction = Math.min(44, Math.max(26, Math.round(rawBottomGap * 0.08)));
      bottomGap = Math.max(0, rawBottomGap - correction);
      document.documentElement.style.setProperty('--fullsc-toolbar-pad-bottom', '10px');
      document.body.classList.add('fullsc-pwa-keyboard-open');
    } else {
      document.documentElement.style.removeProperty('--fullsc-toolbar-pad-bottom');
      document.body.classList.remove('fullsc-pwa-keyboard-open');
    }

    return { bottomGap, rawBottomGap, keyboardOpen };
  }

  function bindToolbarSafety(editor) {
    if (!editor) return;

    const refresh = () => {
      requestAnimationFrame(() => syncToolbarFocusState(editor));
    };

    editor.addEventListener('focus', refresh);
    editor.addEventListener('pointerdown', refresh, true);
    editor.addEventListener('touchstart', refresh, { passive: true });
    editor.addEventListener('click', refresh, true);
    document.addEventListener('selectionchange', refresh);
    window.addEventListener('pageshow', refresh);

    setTimeout(refresh, 0);
    requestAnimationFrame(refresh);
  }


  function setupFullscRichtextToolbarBridge(editor) {
    const toolbar = document.getElementById('kbdToolbar');
    if (!toolbar) return;

    const glass = document.getElementById('glassFx');
    const leitorBtn = toolbar.querySelector('[aria-label="Modo Bíblia"]');

    document.body.classList.add('fullsc-richtext-toolbar');
    toolbar.setAttribute('data-fullsc-toolbar', 'true');

    // No fullsc, .fullsc-app recebe transform e vira stacking-context.
    // O modal bíblico é inserido direto no body; por isso a barra ficava presa atrás dele.
    // Tirando a barra do .fullsc-app, ela passa a flutuar igual à barra original do richtext.
    if (glass && glass.parentElement !== document.body) document.body.appendChild(glass);
    if (toolbar.parentElement !== document.body) document.body.appendChild(toolbar);

    let raf = 0;

    const modalIsOpen = () => {
      const modal = document.getElementById('modal-biblia');
      if (!modal) return false;
      const style = window.getComputedStyle(modal);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    };

    const readerIsActive = () => {
      return document.body.classList.contains('leitor-keep-toolbar') ||
        toolbar.classList.contains('leitor-toolbar-locked') ||
        editor?.getAttribute('contenteditable') === 'false' ||
        leitorBtn?.getAttribute('aria-pressed') === 'true';
    };

    const sync = () => {
      raf = 0;

      const { bottomGap } = getFullscToolbarViewportMetrics();

      const toolbarHeight = Math.max(68, Math.round(toolbar.getBoundingClientRect().height || toolbar.offsetHeight || 68));
      document.documentElement.style.setProperty('--fullsc-visual-bottom-gap', `${bottomGap}px`);
      document.documentElement.style.setProperty('--kbd-toolbar-real-height', `${toolbarHeight}px`);

      const active = readerIsActive();
      const modalOpen = modalIsOpen();

      document.body.classList.toggle('fullsc-reader-active', active);
      document.body.classList.toggle('fullsc-bible-modal-open', modalOpen);

      if (active || modalOpen) {
        document.body.classList.add('editor-has-focus');
      }
    };

    const queueSync = () => {
      if (raf) return;
      raf = requestAnimationFrame(sync);
    };

    const observeModal = () => {
      const modal = document.getElementById('modal-biblia');
      if (!modal || modal.__fullscToolbarObserved) return;
      modal.__fullscToolbarObserved = true;
      modalObserver.observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
    };

    const modalObserver = new MutationObserver(queueSync);
    const stateObserver = new MutationObserver(() => {
      observeModal();
      queueSync();
    });

    stateObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'], childList: true });
    stateObserver.observe(toolbar, { attributes: true, attributeFilter: ['class', 'style'] });
    if (editor) stateObserver.observe(editor, { attributes: true, attributeFilter: ['contenteditable', 'class'] });
    if (leitorBtn) stateObserver.observe(leitorBtn, { attributes: true, attributeFilter: ['aria-pressed', 'class'] });

    observeModal();

    const originalAbrirModalBibl = window.abrirModalBibl;
    if (typeof originalAbrirModalBibl === 'function' && !originalAbrirModalBibl.__fullscToolbarWrapped) {
      const wrappedAbrirModalBibl = function (...args) {
        document.body.classList.add('fullsc-reader-active', 'fullsc-bible-modal-open', 'editor-has-focus');
        const result = originalAbrirModalBibl.apply(this, args);
        setTimeout(queueSync, 0);
        setTimeout(queueSync, 80);
        return result;
      };
      wrappedAbrirModalBibl.__fullscToolbarWrapped = true;
      window.abrirModalBibl = wrappedAbrirModalBibl;
    }

    window.addEventListener('resize', queueSync, { passive: true });
    window.addEventListener('orientationchange', queueSync, { passive: true });
    window.visualViewport?.addEventListener('resize', queueSync, { passive: true });
    window.visualViewport?.addEventListener('scroll', queueSync, { passive: true });

    queueSync();
    setTimeout(queueSync, 80);
  }

  async function init() {
    setupBack();
    setupTitle();
    bootAnim();

    const key = getStorageKey();
    const editor = await waitForEditor();
    editorRef = editor;

    const agent = getAgent();
    const fullHtml = agent?.getFullHTML ? agent.getFullHTML(key) : '';
    applyHTML(editor, fullHtml);
    setupFullscRichtextToolbarBridge(editor);
    bindToolbarSafety(editor);
    syncToolbarFocusState(editor);
    if (typeof M4_Caret !== 'undefined' && typeof M4_Caret.updateFocus === 'function') {
      requestAnimationFrame(() => {
        try { M4_Caret.updateFocus(true); } catch (_) {}
        syncToolbarFocusState(editor);
      });
    }

    let saveTimer = null;
    const queueSave = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const html = exportHTML(editor);
        agent?.saveFullDraft?.(key, html);
      }, 180);
    };

    editor.addEventListener('input', queueSave);
    if (!isPerfLow()) {
      editor.addEventListener('keyup', queueSave);
    }
    editor.addEventListener('paste', queueSave);
    editor.addEventListener('cut', queueSave);
    editor.addEventListener('blur', () => {
      const html = exportHTML(editor);
      agent?.saveFullDraft?.(key, html);
    }, true);
    window.addEventListener('beforeunload', () => {
      const html = exportHTML(editor);
      agent?.saveFullDraft?.(key, html);
    });
    window.addEventListener('pagehide', () => {
      const html = exportHTML(editor);
      agent?.saveFullDraft?.(key, html);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();