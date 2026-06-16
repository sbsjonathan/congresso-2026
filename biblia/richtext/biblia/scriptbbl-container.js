(function() {
  if (window.bibleSystemInitialized) return;
  window.bibleSystemInitialized = true;

  let isModalOpen = false;
  let lastClickedBbl = null; // Memória de qual span abriu o modal
  let refAtivaModal = null;
  let processandoBotao = false;

  function campoEstaFocado() {
    const campo = document.getElementById('modal-biblia-campo');
    return !!(campo && document.activeElement === campo);
  }

  const LIVROS_NUMERAVEIS = ['samuel','sam','sm','reis','rei','re','rs','cronicas','cron','cro','cr','corintios','corint','cor','co','tessalonicenses','tessa','tess','tes','te','ts','timoteo','tim','ti','tm','pedro','ped','pe','pd','joao','joa'];

  function tirarAcentos(txt) {
    return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function normalizarChaveLivro(refLivro) {
    let s = tirarAcentos(String(refLivro)).toLowerCase().trim();
    s = s.replace(/[\.]/g, ' ');

    const romanos = { 'iii': '3', 'ii': '2', 'i': '1' };
    let m = s.match(/^(iii|ii|i)\s+(.*)$/);
    if (m) {
      const resto = m[2].replace(/[\s]/g, '');
      if (LIVROS_NUMERAVEIS.indexOf(resto) !== -1) {
        s = romanos[m[1]] + ' ' + m[2];
      }
    }

    s = s.replace(/^(\d)\s*[\u00aa\u00ba]/, '$1');
    s = s.replace(/^(\d)\s*o\s/, '$1 ');
    s = s.replace(/^(primeira|primeiro)\b/, '1');
    s = s.replace(/^(segunda|segundo)\b/, '2');
    s = s.replace(/^(terceira|terceiro)\b/, '3');

    s = s.replace(/\s/g, '');
    return s;
  }

  function resolverLivroCanonico(refLivro) {
    const chave = normalizarChaveLivro(refLivro);
    if (typeof ABREVIACOES !== 'undefined' && ABREVIACOES[chave]) return ABREVIACOES[chave];
    return chave;
  }

  function blockTextSelection() {
    document.body.classList.add('no-select-global');
  }

  function unblockTextSelection() {
    document.body.classList.remove('no-select-global');
  }

  function ensureModalExists() {
    if (document.getElementById('modal-biblia')) return;
    
    const modalHTML = `
      <div id="modal-biblia" style="display: none;">
        <div class="modal-biblia-content">
          <span id="modal-biblia-add" title="Adicionar versículos">+</span>
          <span id="modal-biblia-transcrever" title="Transcrever versículo">T</span>
          <span id="modal-biblia-fechar">&times;</span>
          <div id="modal-biblia-acrescimo">
            <input type="text" id="modal-biblia-campo" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="ex. 2-5, 8, 2:1-3">
            <div id="modal-biblia-passo">
              <button type="button" id="modal-biblia-mais" aria-label="Adicionar próximo versículo">+</button>
              <button type="button" id="modal-biblia-menos" aria-label="Remover último versículo">−</button>
            </div>
          </div>
          <div id="modal-biblia-corpo"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalListeners();
  }

  function setupModalListeners() {
    const modal = document.getElementById('modal-biblia');
    const btnFechar = document.getElementById('modal-biblia-fechar');
    const btnTranscrever = document.getElementById('modal-biblia-transcrever');
    const btnAdd = document.getElementById('modal-biblia-add');
    const content = modal.querySelector('.modal-biblia-content');

    if (btnFechar) btnFechar.addEventListener('click', fecharModal);

    if (btnTranscrever) {
      btnTranscrever.addEventListener('pointerdown', (e) => {
        if (campoEstaFocado()) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
      btnTranscrever.addEventListener('pointerup', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (processandoBotao) return;
        processandoBotao = true;
        const querInserir = campoEstaFocado() || btnTranscrever.dataset.modo === 'verificar';
        if (querInserir) {
          aplicarAcrescimo().then(() => { processandoBotao = false; });
        } else {
          transcreverVersiculo();
          processandoBotao = false;
        }
      });
    }

    if (btnAdd) {
      btnAdd.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCampoAcrescimo();
      });
    }

    const btnMais = document.getElementById('modal-biblia-mais');
    const btnMenos = document.getElementById('modal-biblia-menos');
    if (btnMais) {
      btnMais.addEventListener('click', (e) => {
        e.stopPropagation();
        adicionarProximo();
      });
    }
    if (btnMenos) {
      btnMenos.addEventListener('click', (e) => {
        e.stopPropagation();
        removerUltimo();
      });
    }

    if (modal) modal.addEventListener('click', fecharModal);
    if (content) {
        content.addEventListener('click', e => e.stopPropagation());
        content.addEventListener('touchstart', e => e.stopPropagation());
    }
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && isModalOpen) fecharModal(); });
  }

  let scrollTravado = 0;
  let scrollElTravado = null;
  let scrollElPos = 0;

  function acharScrollContainer() {
    const cands = ['editorScroll', 'fullsc-scroll'];
    for (let i = 0; i < cands.length; i++) {
      const el = document.getElementById(cands[i]);
      if (el) return el;
    }
    const possiveis = document.querySelectorAll('.editor-scroll, .fullsc-scroll');
    if (possiveis.length) return possiveis[0];
    return null;
  }

  function travarScroll() {
    scrollTravado = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollTravado + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    scrollElTravado = acharScrollContainer();
    if (scrollElTravado) {
      scrollElPos = scrollElTravado.scrollTop;
      scrollElTravado.style.overflow = 'hidden';
    }
  }

  function destravarScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollTravado);

    if (scrollElTravado) {
      scrollElTravado.style.overflow = '';
      scrollElTravado.scrollTop = scrollElPos;
      scrollElTravado = null;
    }
  }

  function fecharModal() {
    const modal = document.getElementById('modal-biblia');
    if (modal) modal.style.display = 'none';

    const campo = document.getElementById('modal-biblia-campo');
    if (campo) campo.blur();

    destravarScroll();
    isModalOpen = false;
    setTimeout(unblockTextSelection, 100);
  }
  
  async function abrirModalBibl(referencia, triggerElement = null) {
    if (typeof ABREVIACOES === 'undefined') return;
    
    lastClickedBbl = triggerElement;
    isModalOpen = true;
    blockTextSelection();
    
    ensureModalExists();
    const modal = document.getElementById('modal-biblia');
    const corpo = document.getElementById('modal-biblia-corpo');
    const btnTranscrever = document.getElementById('modal-biblia-transcrever');
    
    // Mostra o botão "T" apenas se estivermos num ambiente de edição (RichText / Fullsc)
    if (btnTranscrever) {
      if (typeof M5_Factory !== 'undefined' && typeof M2_Query !== 'undefined') {
        btnTranscrever.style.display = 'flex';
      } else {
        btnTranscrever.style.display = 'none';
      }
    }
    
    modal.style.display = 'flex';
    travarScroll();
    corpo.innerHTML = '<h3>Carregando...</h3>';
    
    try {
      const resultado = await buscarVersiculo(referencia);
      corpo.innerHTML = `<h3>${resultado.titulo}</h3><div>${resultado.texto}</div>`;
      refAtivaModal = referencia;
      prepararCampoAcrescimo();
    } catch (error) {
      corpo.innerHTML = '<h3>Erro</h3><div>Não foi possível carregar a referência.</div>';
    }
  }

  function partesDaReferencia(ref) {
    const m = ref.match(/^(.+?)\s(\d{1,3}):(.+)$/);
    if (!m) return null;
    return { livro: m[1].trim(), capInicial: parseInt(m[2]), corpo: m[3].trim() };
  }

  function expandirParaVersos(corpoRef, capInicial) {
    const itens = corpoRef.split(',');
    const lista = [];
    itens.forEach((item) => {
      item = item.trim();
      if (!item) return;
      let cap = capInicial;
      let resto = item;
      if (item.indexOf(':') !== -1) {
        const p = item.split(':');
        cap = parseInt(p[0]);
        resto = p[1];
      }
      if (/[-–—]/.test(resto)) {
        const lim = resto.split(/[-–—]/).map((n) => parseInt(n));
        const ini = lim[0];
        const fim = lim[1];
        if (!isNaN(ini) && !isNaN(fim)) {
          for (let v = ini; v <= fim; v++) lista.push({ cap: cap, verso: v });
        }
      } else {
        const v = parseInt(resto);
        if (!isNaN(v)) lista.push({ cap: cap, verso: v });
      }
    });
    return lista;
  }

  function comprimirVersos(lista) {
    const vistos = {};
    const unicos = [];
    lista.forEach((it) => {
      const chave = it.cap + ':' + it.verso;
      if (!vistos[chave]) { vistos[chave] = true; unicos.push(it); }
    });
    unicos.sort((a, b) => (a.cap - b.cap) || (a.verso - b.verso));

    const grupos = {};
    const ordemCap = [];
    unicos.forEach((it) => {
      if (!grupos[it.cap]) { grupos[it.cap] = []; ordemCap.push(it.cap); }
      grupos[it.cap].push(it.verso);
    });

    const partesCap = ordemCap.map((cap) => {
      const versos = grupos[cap];
      const ranges = [];
      let ini = versos[0];
      let prev = versos[0];
      for (let i = 1; i < versos.length; i++) {
        if (versos[i] === prev + 1) {
          prev = versos[i];
        } else {
          ranges.push(ini === prev ? '' + ini : ini + '-' + prev);
          ini = versos[i];
          prev = versos[i];
        }
      }
      ranges.push(ini === prev ? '' + ini : ini + '-' + prev);
      return { cap: cap, texto: ranges.join(', ') };
    });

    return { ordemCap: ordemCap, partesCap: partesCap };
  }

  function montarReferencia(livro, capInicial, lista) {
    const comp = comprimirVersos(lista);
    if (comp.ordemCap.length === 1 && comp.ordemCap[0] === capInicial) {
      return livro + ' ' + capInicial + ':' + comp.partesCap[0].texto;
    }
    const segmentos = comp.partesCap.map((p) => p.cap + ':' + p.texto);
    return livro + ' ' + segmentos.join(', ');
  }

  async function aplicarAcrescimo() {
    const campo = document.getElementById('modal-biblia-campo');
    if (!campo || !refAtivaModal) return;

    const entrada = campo.value.trim();
    if (!entrada) { campo.blur(); atualizarBotaoModo(); return; }

    const partes = partesDaReferencia(refAtivaModal);
    if (!partes) return;

    const atuais = expandirParaVersos(partes.corpo, partes.capInicial);
    const novos = expandirParaVersos(entrada, partes.capInicial);
    if (novos.length === 0) { campo.value = ''; campo.blur(); atualizarBotaoModo(); return; }

    const combinada = atuais.concat(novos);
    await renderRef(montarReferencia(partes.livro, partes.capInicial, combinada));

    campo.value = '';
    campo.blur();
    atualizarBotaoModo();
  }

  function resolverNomeLivro(refLivro) {
    return resolverLivroCanonico(refLivro);
  }

  async function adicionarProximo() {
    if (!refAtivaModal) return;
    const partes = partesDaReferencia(refAtivaModal);
    if (!partes) return;

    const lista = expandirParaVersos(partes.corpo, partes.capInicial);
    if (lista.length === 0) return;
    const ultimo = lista[lista.length - 1];

    let dados;
    try {
      dados = await fetchBookData(resolverNomeLivro(partes.livro));
    } catch (e) { return; }

    const capAtual = dados.capitulos.find((c) => c.capitulo === ultimo.cap);
    if (!capAtual) return;
    const maxVersoCap = capAtual.versiculos.reduce((m, v) => (v.verso > m ? v.verso : m), 0);

    let proximo;
    if (ultimo.verso < maxVersoCap) {
      proximo = { cap: ultimo.cap, verso: ultimo.verso + 1 };
    } else {
      const proxCap = dados.capitulos.find((c) => c.capitulo === ultimo.cap + 1);
      if (!proxCap) return;
      const primeiroVerso = proxCap.versiculos.reduce((m, v) => (v.verso < m ? v.verso : m), proxCap.versiculos[0].verso);
      proximo = { cap: ultimo.cap + 1, verso: primeiroVerso };
    }

    const combinada = lista.concat([proximo]);
    await renderRef(montarReferencia(partes.livro, partes.capInicial, combinada));
  }

  async function removerUltimo() {
    if (!refAtivaModal) return;
    const partes = partesDaReferencia(refAtivaModal);
    if (!partes) return;

    const lista = expandirParaVersos(partes.corpo, partes.capInicial);
    if (lista.length <= 1) return;

    lista.pop();
    await renderRef(montarReferencia(partes.livro, partes.capInicial, lista));
  }

  async function renderRef(novaRef) {
    const corpo = document.getElementById('modal-biblia-corpo');
    if (!corpo) return;
    try {
      const resultado = await buscarVersiculo(novaRef);
      const t = resultado ? resultado.titulo : '';
      const valido = t && t.indexOf('Inválida') === -1 && t.indexOf('não') === -1 && t.indexOf('Não') === -1;
      if (valido) {
        corpo.innerHTML = `<h3>${resultado.titulo}</h3><div>${resultado.texto}</div>`;
        refAtivaModal = novaRef;
        if (lastClickedBbl) lastClickedBbl.textContent = resultado.titulo;
      }
    } catch (e) {}
  }

  function atualizarBotaoModo() {
    const btn = document.getElementById('modal-biblia-transcrever');
    const campo = document.getElementById('modal-biblia-campo');
    if (!btn || !campo) return;
    const noCampo = document.activeElement === campo;
    if (noCampo) {
      btn.textContent = 'V';
      btn.dataset.modo = 'verificar';
      btn.title = 'Adicionar versículos';
    } else {
      btn.textContent = 'T';
      btn.dataset.modo = 'transcrever';
      btn.title = 'Transcrever versículo';
    }
  }

  function toggleCampoAcrescimo() {
    const wrap = document.getElementById('modal-biblia-acrescimo');
    const campo = document.getElementById('modal-biblia-campo');
    const btnAdd = document.getElementById('modal-biblia-add');
    if (!wrap || !campo) return;

    const aberto = wrap.classList.toggle('is-open');
    if (btnAdd) btnAdd.classList.toggle('is-active', aberto);
    if (aberto) {
      setTimeout(() => { campo.focus(); atualizarBotaoModo(); }, 50);
    } else {
      campo.blur();
      campo.value = '';
      atualizarBotaoModo();
    }
  }

  function prepararCampoAcrescimo() {
    const campo = document.getElementById('modal-biblia-campo');
    const wrap = document.getElementById('modal-biblia-acrescimo');
    const btnAdd = document.getElementById('modal-biblia-add');
    if (!campo || !wrap) return;

    const editavel = (typeof M5_Factory !== 'undefined' && typeof M2_Query !== 'undefined');
    if (btnAdd) btnAdd.style.display = editavel ? 'flex' : 'none';

    wrap.classList.remove('is-open');
    if (btnAdd) btnAdd.classList.remove('is-active');
    campo.value = '';
    atualizarBotaoModo();

    if (campo.dataset.bound === 'true') return;
    campo.dataset.bound = 'true';

    campo.addEventListener('input', () => {
      campo.value = campo.value.replace(/[^0-9,:\s\-–—]/g, '');
    });
    campo.addEventListener('focus', atualizarBotaoModo);
    campo.addEventListener('blur', () => { setTimeout(atualizarBotaoModo, 150); });
    campo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        aplicarAcrescimo();
      }
    });
  }

  // --- LÓGICA DE TRANSCRIÇÃO PARA O EDITOR ---
  function transcreverVersiculo() {
    if (!lastClickedBbl || typeof M3_TextModel === 'undefined' || typeof M2_Query === 'undefined') return;

    const campo = document.getElementById('modal-biblia-campo');
    if (campo && document.activeElement === campo) return;

    const corpo = document.getElementById('modal-biblia-corpo');
    const paragrafos = corpo.querySelectorAll('p');

    if (paragrafos.length === 0) return;

    const tituloEl = corpo.querySelector('h3');
    let refCanonica = tituloEl ? tituloEl.textContent.trim() : '';
    if (!refCanonica || /carregando|erro|inv[aá]lid/i.test(refCanonica)) {
      refCanonica = lastClickedBbl.textContent.trim();
    }

    let versosHtml = [];
    paragrafos.forEach(p => versosHtml.push(p.innerHTML.trim()));
    let textoLimpo = versosHtml.join(' ').replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();

    const editable = lastClickedBbl.closest('.editable');
    if (!editable) return;

    if (window.M12_History && window.M12_History.beforeChange) window.M12_History.beforeChange();

    const toggleTitle = lastClickedBbl.closest('.toggle-title');
    let alvoCursor = null;
    let blocoEl = null;

    if (toggleTitle) {
      alvoCursor = transcreverEmToggle(toggleTitle, refCanonica, textoLimpo);
    } else {
      const innerHtml = `<b class="versiculo-ref">${refCanonica}</b> — <i class="versiculo-transc">${textoLimpo}</i>`;
      const blocoExistente = lastClickedBbl.closest('.versiculo-bloco');

      if (blocoExistente) {
          blocoExistente.innerHTML = innerHtml;
          blocoEl = blocoExistente;
      } else {
          const bloco = document.createElement('span');
          bloco.className = 'versiculo-bloco';
          bloco.innerHTML = innerHtml;
          lastClickedBbl.replaceWith(bloco);
          blocoEl = bloco;
      }
      alvoCursor = editable;
    }

    if (typeof M3_TextModel !== 'undefined') {
        M3_TextModel.sync(editable);
        M3_TextModel.syncAll();
    }

    if (window.M12_History && window.M12_History.afterChange) window.M12_History.afterChange(2);

    const editor = document.getElementById('editor');
    if (editor) {
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    fecharModal();

    if (window.LeitorMode && typeof window.LeitorMode.desativar === 'function') {
        window.LeitorMode.desativar();
    }

    const forcarFocoIOS = (el) => {
      if (!el) return;
      try {
        const editorEl = document.getElementById('editor');
        if (editorEl && editorEl.getAttribute('contenteditable') !== 'true') {
          editorEl.setAttribute('contenteditable', 'true');
        }
        el.focus({ preventScroll: true });
      } catch (e) {
        try { el.focus(); } catch (e2) {}
      }
    };

    const colocarCursorNoFim = () => {
      try {
        const editorEl = document.getElementById('editor');
        if (toggleTitle && alvoCursor) {
          forcarFocoIOS(editorEl);
          const range = document.createRange();
          range.selectNodeContents(alvoCursor);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (blocoEl && blocoEl.parentNode) {
          forcarFocoIOS(editorEl);
          const range = document.createRange();
          range.setStartAfter(blocoEl);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        if (window.M4_Caret && M4_Caret.saveR) M4_Caret.saveR();
        if (window.M13_Negrita && window.M13_Negrita.clearTypingState) window.M13_Negrita.clearTypingState();
        if (window.M4_Caret && window.M4_Caret.updateFocus) window.M4_Caret.updateFocus(true);
        if (window.M11_Layout && window.M11_Layout.run) window.M11_Layout.run();
      } catch (e) {}
    };

    colocarCursorNoFim();
    requestAnimationFrame(() => {
      requestAnimationFrame(colocarCursorNoFim);
    });
    setTimeout(colocarCursorNoFim, 80);
  }

  function transcreverEmToggle(toggleTitle, refCanonica, textoLimpo) {
    const toggleNode = toggleTitle.closest('.node-toggle');
    if (!toggleNode) return null;
    if (typeof M5_Factory === 'undefined' || typeof M2_Query === 'undefined') return null;

    const refHTML = `<span class="bbl versiculo-ref-toggle">${refCanonica}</span>`;
    const linkNoTitulo = toggleTitle.querySelector('.bbl') || toggleTitle.querySelector('.versiculo-ref-toggle');
    if (linkNoTitulo) {
      const span = document.createElement('span');
      span.innerHTML = refHTML;
      const novoLink = span.firstChild;
      linkNoTitulo.replaceWith(novoLink);
      if (typeof normalizeBblLinks === 'function') normalizeBblLinks(toggleTitle);
    } else {
      toggleTitle.innerHTML = toggleTitle.innerHTML + ' ' + refHTML;
      if (typeof normalizeBblLinks === 'function') normalizeBblLinks(toggleTitle);
    }
    if (typeof M3_TextModel !== 'undefined') M3_TextModel.sync(toggleTitle);

    const wrap = M2_Query.getChil(toggleNode);
    if (!wrap) return null;
    const lvlFilho = M2_Query.getLvl(toggleNode) + 1;

    const filhoTexto = `<i class="versiculo-transc">${textoLimpo}</i>`;
    let filhoExistente = null;
    const filhos = M2_Query.childs(wrap);
    for (let i = 0; i < filhos.length; i++) {
      if (filhos[i].classList.contains('node-text') && filhos[i].querySelector('.versiculo-filho')) {
        filhoExistente = filhos[i];
        break;
      }
    }

    let contFinal = null;
    if (filhoExistente) {
      const cont = M2_Query.getTxtC(filhoExistente);
      if (cont) {
        cont.innerHTML = `<span class="versiculo-filho">${filhoTexto}</span>`;
        if (typeof M3_TextModel !== 'undefined') M3_TextModel.sync(cont);
        contFinal = cont;
      }
    } else {
      const novo = M5_Factory.text('', lvlFilho);
      const cont = M2_Query.getTxtC(novo);
      if (cont) {
        cont.innerHTML = `<span class="versiculo-filho">${filhoTexto}</span>`;
        if (typeof M3_TextModel !== 'undefined') M3_TextModel.sync(cont);
        contFinal = cont;
      }
      wrap.appendChild(novo);
    }

    if (typeof M6_Tree !== 'undefined' && M6_Tree.setOpen) {
      M6_Tree.setOpen(toggleNode, true, false);
    }

    return contFinal;
  }

  function setupBblLinkListeners(linkEl) {
    linkEl.style.cursor = 'pointer';

    const FEEDBACK_DELAY = 75;
    const LONG_PRESS_MS = 150;
    const SLOP_FEEDBACK = 6;
    const SLOP_OPEN = 12;

    let pressTimer = null;
    let feedbackTimer = null;
    let moveTooMuch = false;
    let startX = 0, startY = 0;

    const clearTimers = () => {
      if (pressTimer) clearTimeout(pressTimer);
      if (feedbackTimer) clearTimeout(feedbackTimer);
      pressTimer = null;
      feedbackTimer = null;
    };

    const cancelGesture = () => {
      moveTooMuch = true;
      clearTimers();
      linkEl.classList.remove('pressionando', 'ref-aberta');
    };

    const touchStartHandler = (e) => {
      if (e.touches.length > 1) return;
      moveTooMuch = false;
      blockTextSelection();

      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;

      feedbackTimer = setTimeout(() => {
        if (!moveTooMuch) linkEl.classList.add('pressionando');
      }, FEEDBACK_DELAY);

      pressTimer = setTimeout(() => {
        if (!moveTooMuch) {
          linkEl.classList.remove('pressionando');
          linkEl.classList.add('ref-aberta');

          if (navigator.vibrate) navigator.vibrate(50);
          
          // Passamos o próprio elemento linkEl como segundo parâmetro
          abrirModalBibl(linkEl.textContent.trim(), linkEl);
          
          setTimeout(() => linkEl.classList.remove('ref-aberta'), 200);
        }
      }, LONG_PRESS_MS);
    };

    const touchMoveHandler = (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);

      if (ay > ax && ay > SLOP_FEEDBACK) {
        cancelGesture();
        return;
      }

      if (ax > SLOP_OPEN || ay > SLOP_OPEN) {
        cancelGesture();
        return;
      }

      if (ax > SLOP_FEEDBACK || ay > SLOP_FEEDBACK) {
        clearTimeout(feedbackTimer);
        feedbackTimer = null;
        linkEl.classList.remove('pressionando');
      }
    };

    const touchEndHandler = () => {
      clearTimers();
      linkEl.classList.remove('pressionando', 'ref-aberta');

      if (!isModalOpen) {
        setTimeout(unblockTextSelection, 50);
      }
    };

    linkEl.addEventListener('touchstart', touchStartHandler, { passive: true });
    linkEl.addEventListener('touchmove', touchMoveHandler, { passive: true });
    linkEl.addEventListener('touchend', touchEndHandler);
    linkEl.addEventListener('touchcancel', touchEndHandler);
    linkEl.addEventListener('contextmenu', e => e.preventDefault());
  }

  async function processarMultiplasReferencias(refString) {
    const referencias = refString.split(';').map(ref => ref.trim()).filter(ref => ref.length > 0);
    
    let resultadosCompletos =[];
    let nomeLivroBase = '';
    let titulosParaMostrar =[];
    
    let ultimoLivro = '';
    let ultimoCapitulo = '';

    for (let i = 0; i < referencias.length; i++) {
        let refAtual = referencias[i].trim();
        
        let matchCompleto = refAtual.match(/^([1-3]?\s?[A-Za-zêÊãÃíÍóÓâÂéÉôÔúÚçÇáÁ.]+)\s+(\d{1,3}):/);
        if (matchCompleto) {
            ultimoLivro = matchCompleto[1].trim();
            const capMatches =[...refAtual.matchAll(/(\d{1,3}):/g)];
            if (capMatches.length > 0) {
                ultimoCapitulo = capMatches[capMatches.length - 1][1];
            }
        } else {
            if (/^(\d{1,3}):/.test(refAtual)) {
                refAtual = ultimoLivro + ' ' + refAtual;
                const capMatches =[...refAtual.matchAll(/(\d{1,3}):/g)];
                if (capMatches.length > 0) {
                    ultimoCapitulo = capMatches[capMatches.length - 1][1];
                }
            } else if (/^[\d,\s-–—]+$/.test(refAtual)) {
                refAtual = ultimoLivro + ' ' + ultimoCapitulo + ':' + refAtual;
            }
        }

        const resultado = await buscarVersiculoCore(refAtual);
        
        if (resultado.titulo !== "Referência Inválida" && resultado.titulo !== "Não Encontrado" && resultado.titulo !== "Livro não encontrado") {
            resultadosCompletos.push(resultado);
            if (nomeLivroBase === '') {
                const livroMatch = resultado.titulo.match(/^([^0-9]+)/);
                if (livroMatch) nomeLivroBase = livroMatch[1].trim();
            }
            titulosParaMostrar.push(resultado.titulo.replace(nomeLivroBase, '').trim());
        }
    }

    if (resultadosCompletos.length === 0) {
      return { titulo: "Referências Inválidas", texto: "Nenhuma das referências pôde ser encontrada." };
    }
    
    const capitulosUnicos = new Set(resultadosCompletos.map(r => r.titulo.match(/(\d+):/)?.[1]).filter(Boolean));
    const temMultiplosCapitulos = capitulosUnicos.size > 1;

    const tituloFinal = nomeLivroBase + ' ' + titulosParaMostrar.join('; ');
    let textoFinal = '';
    let capitulosJaMostrados = new Set();
    
    resultadosCompletos.forEach((resultado, index) => {
        const numeroCapitulo = resultado.titulo.match(/(\d+):/)?.[1];
        
        if (temMultiplosCapitulos && numeroCapitulo && !capitulosJaMostrados.has(numeroCapitulo)) {
            if (index > 0) {
                textoFinal += '<div style="margin: 20px 0 15px 0; border-top: 2px solid #ddd; padding-top: 15px;"></div>';
            }
            textoFinal += `<div style="margin-bottom: 12px;"><strong style="font-style: italic; color: #666; font-size: 1.1em;">Capítulo ${numeroCapitulo}</strong></div>`;
            capitulosJaMostrados.add(numeroCapitulo);
        } else if (index > 0) {
            textoFinal += '<div style="margin-top: 15px;"></div>';
        }
        
        textoFinal += resultado.texto;
    });

    return { titulo: tituloFinal, texto: textoFinal };
  }

  async function buscarVersiculoCore(refString) {
    let multiCapMatch = refString.match(/^([1-3]?\s?[A-Za-zêÊãÃíÍóÓâÂéÉôÔúÚçÇáÁ.]+)\s?(\d{1,3}):(\d{1,3})\s*[-–—]\s*(\d{1,3}):(\d{1,3})$/);
    let singleCapMatch = refString.match(/^([1-3]?\s?[A-Za-zêÊãÃíÍóÓâÂéÉôÔúÚçÇáÁ.]+)\s?(\d{1,3}):([\d,\s-–—]+)/);

    if (!multiCapMatch && !singleCapMatch) {
      return { titulo: "Referência Inválida", texto: "Formato não reconhecido." };
    }
    
    const isMultiCap = !!multiCapMatch;
    const match = isMultiCap ? multiCapMatch : singleCapMatch;
    let nomeAbreviado = match[1].replace(/[\.\s]/g, '').trim();

    const nomeLivro = resolverLivroCanonico(match[1]);

    let dados;
    try {
      dados = await fetchBookData(nomeLivro);
    } catch (e) {
      return { titulo: "Livro não encontrado", texto: `O livro "${nomeLivro}" não foi encontrado.` };
    }

    let textoHtml = "";
    let versosColetados =[];

    if (isMultiCap) {
      let capIni = parseInt(match[2]), versIni = parseInt(match[3]);
      let capFim = parseInt(match[4]), versFim = parseInt(match[5]);

      for (let c = capIni; c <= capFim; c++) {
        const capObj = dados.capitulos.find(chap => chap.capitulo === c);
        if (!capObj) continue;

        let versiculosDoCapitulo =[];
        if (c === capIni && c === capFim) versiculosDoCapitulo = capObj.versiculos.filter(v => v.verso >= versIni && v.verso <= versFim);
        else if (c === capIni) versiculosDoCapitulo = capObj.versiculos.filter(v => v.verso >= versIni);
        else if (c === capFim) versiculosDoCapitulo = capObj.versiculos.filter(v => v.verso <= versFim);
        else versiculosDoCapitulo = capObj.versiculos;
        
        versosColetados.push(...versiculosDoCapitulo.map(v => ({...v, capitulo: c}) ));
      }
    } else {
      const capituloNum = parseInt(match[2]);
      const capObj = dados.capitulos.find(c => c.capitulo === capituloNum);
      if (!capObj) return { titulo: "Não Encontrado", texto: `Capítulo ${capituloNum} não encontrado.` };
      
      match[3].split(',').forEach(item => {
        if (item.includes('-') || item.includes('–') || item.includes('—')) {
          const limites = item.split(/[-–—]/).map(Number);
          const ini = limites[0];
          const fim = limites[1];
          versosColetados.push(...capObj.versiculos.filter(v => v.verso >= ini && v.verso <= fim));
        } else {
          const numStr = item.replace(/\D/g, '');
          if (numStr) {
            const verso = capObj.versiculos.find(v => v.verso === Number(numStr));
            if (verso) versosColetados.push(verso);
          }
        }
      });
    }

    if (versosColetados.length > 0) {
      const temMultiplosCapitulos = new Set(versosColetados.map(v => v.capitulo)).size > 1;
      
      textoHtml = "";
      let capituloAtual = null;
      let paragrafoAtual = "";
      
      versosColetados.forEach((verso) => {
        const numeroCapitulo = verso.capitulo || parseInt(match[2]);
        
        if (temMultiplosCapitulos && numeroCapitulo !== capituloAtual) {
          if (paragrafoAtual) textoHtml += `<p>${paragrafoAtual}</p>`;
          paragrafoAtual = "";
          if (capituloAtual !== null) textoHtml += '<div style="margin: 20px 0 15px 0; border-top: 2px solid #ddd; padding-top: 15px;"></div>';
          textoHtml += `<div style="margin-bottom: 12px;"><strong style="font-style: italic; color: #666; font-size: 1.1em;">Capítulo ${numeroCapitulo}</strong></div>`;
          capituloAtual = numeroCapitulo;
        }
        
        if (verso.novo_paragrafo && paragrafoAtual) {
          textoHtml += `<p>${paragrafoAtual}</p>`;
          paragrafoAtual = `<strong>${verso.verso}</strong> ${verso.texto}`;
        } else {
          paragrafoAtual += (paragrafoAtual ? ` <strong>${verso.verso}</strong> ` : `<strong>${verso.verso}</strong> `) + verso.texto;
        }
      });
      if (paragrafoAtual) textoHtml += `<p>${paragrafoAtual}</p>`;
    }

    const nomeLivroFormatado = dados.nome_do_livro || nomeLivro.charAt(0).toUpperCase() + nomeLivro.slice(1);
    const tituloRef = isMultiCap ? `${nomeLivroFormatado} ${multiCapMatch[2]}:${multiCapMatch[3]}-${multiCapMatch[4]}:${multiCapMatch[5]}` : `${nomeLivroFormatado} ${singleCapMatch[2]}:${singleCapMatch[3]}`;
    
    return {
      titulo: tituloRef,
      texto: textoHtml || "Versículo(s) não encontrado(s)."
    };
  }

  async function buscarVersiculo(refString) {
    if (refString.includes(';')) {
      return await processarMultiplasReferencias(refString);
    }
    return await buscarVersiculoCore(refString);
  }

  async function fetchBookData(nomeArquivo) {
    // CORREÇÃO: Caminhos expandidos para alcançar a pasta correta partindo de qualquer arquivo
    const paths =[
      `../../../sentinela/biblia/data/${nomeArquivo}.json`, // Para fullsc.html
      `../../sentinela/biblia/data/${nomeArquivo}.json`,     
      `../sentinela/biblia/data/${nomeArquivo}.json`,        // Para container.html
      `./sentinela/biblia/data/${nomeArquivo}.json`,
      `sentinela/biblia/data/${nomeArquivo}.json`
    ];
    let lastError = null;
    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        return await response.json();
      } catch (e) { lastError = e; }
    }
    throw lastError || new Error('Arquivo bíblico não encontrado');
  }

  function normalizeBblLinks(root = document) {
    root.querySelectorAll('.bbl').forEach((link) => {
      if (link.dataset.bblBound === 'true') return;
      link.dataset.bblBound = 'true';
      setupBblLinkListeners(link);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureModalExists();
    normalizeBblLinks(document);
  });
  
  window.abrirModalBibl = abrirModalBibl;
  window.setupBblLinkListeners = setupBblLinkListeners;
  window.normalizeBblLinks = normalizeBblLinks;

})();