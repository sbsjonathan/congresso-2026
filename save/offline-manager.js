document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btn-offline-toggle');
    const btnClear = document.getElementById('btn-offline-clear');
    const progressContainer = document.getElementById('offline-progress-container');
    const progressFill = document.getElementById('offline-progress-fill');
    const progressText = document.getElementById('offline-progress-text');
    const descText = document.getElementById('offline-desc');
    const titleText = document.getElementById('offline-title');
    const iconSpan = document.getElementById('offline-icon');
    const offlineCard = document.getElementById('offline-card');

    if (!btnToggle) return;

    let busy = false;
    let lastStatus = null;

    function supported() {
        return 'serviceWorker' in navigator;
    }

    function getWeekToDownload() {
        if (typeof window.getGlobalWeek === 'function') {
            return window.getGlobalWeek();
        }
        return window.semanaAtual || '';
    }

    function showProgress(show) {
        if (progressContainer) progressContainer.style.display = show ? 'block' : 'none';
        if (progressText) progressText.style.display = show ? 'block' : 'none';
    }

    function setProgress(loaded, total) {
        const percent = total ? Math.round((loaded / total) * 100) : 0;
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = `Baixando arquivos... ${percent}%`;
    }

    function render(status) {
        lastStatus = status;
        if (busy) return;

        const isPartial = !!(status && !status.complete && status.present > 0);
        const isReady = !!(status && status.complete);

        // O botão de apagar só aparece se houver ALGUMA coisa baixada
        btnClear.style.display = isPartial || isReady ? 'block' : 'none';

        // ESTADO 1: Zerado (Nada baixado)
        if (!status || (status.present === 0)) {
            btnToggle.disabled = false;
            btnToggle.textContent = 'Baixar App para Offline';
            btnToggle.style.display = 'block';
            offlineCard.classList.remove('is-ready');
            iconSpan.textContent = '☁️';
            titleText.textContent = 'Modo Offline';
            descText.textContent = 'A Bíblia e a Sentinela estarão com você, mesmo sem internet.';
            return;
        }

        // ESTADO 3: Completo (Tudo baixado)
        if (status.complete) {
            btnToggle.style.display = 'none'; // Some o botão de baixar
            offlineCard.classList.add('is-ready');
            iconSpan.textContent = '✅';
            titleText.textContent = 'App Pronto Offline';
            descText.textContent = status.articlePresent 
                ? `A Bíblia, o App e A Sentinela da semana ${status.semana} estão salvos no aparelho.`
                : `A Bíblia e o App estão salvos. (A Sentinela desta semana não foi encontrada).`;
            return;
        }

        // ESTADO 2: Incompleto / Faltando pedaços
        if (isPartial) {
            btnToggle.disabled = false;
            btnToggle.textContent = 'Completar Download';
            btnToggle.style.display = 'block';
            offlineCard.classList.remove('is-ready');
            iconSpan.textContent = '⚠️';
            titleText.textContent = 'Download Incompleto';
            descText.textContent = `O download foi interrompido. Faltam ${status.total - status.present} arquivos.`;
            return;
        }
    }

    function getActiveWorker() {
        return navigator.serviceWorker.ready.then((reg) => reg.active || navigator.serviceWorker.controller);
    }

    function requestCacheStatus() {
        return new Promise((resolve) => {
            if (!supported()) { resolve(null); return; }
            getActiveWorker().then((sw) => {
                if (!sw) { resolve(null); return; }
                let settled = false;
                const finish = (val) => { if (!settled) { settled = true; resolve(val); } };
                const timer = setTimeout(() => finish(null), 4000);
                const channel = new MessageChannel();
                channel.port1.onmessage = (event) => {
                    clearTimeout(timer);
                    finish(event.data && event.data.type === 'CACHE_STATUS' ? event.data : null);
                };
                try {
                    sw.postMessage({ action: 'CACHE_STATUS', semana: getWeekToDownload() }, [channel.port2]);
                } catch (e) {
                    clearTimeout(timer);
                    finish(null);
                }
            }).catch(() => resolve(null));
        });
    }

    async function refreshStatus() {
        let status = await requestCacheStatus();
        render(status);
        return status;
    }

    async function startDownload() {
        if (document.body.classList.contains('is-offline')) {
            alert('Você precisa estar conectado à internet para baixar os arquivos.');
            return;
        }
        const sw = await getActiveWorker();
        if (!sw) {
            alert('O sistema está iniciando... Tente novamente em alguns segundos.');
            return;
        }
        
        busy = true;
        showProgress(true);
        setProgress(0, 1);
        btnToggle.disabled = true;
        btnClear.style.display = 'none';
        btnToggle.textContent = 'Preparando...';
        offlineCard.classList.remove('is-ready');
        
        sw.postMessage({ 
            action: 'START_DOWNLOAD',
            semana: getWeekToDownload()
        });
    }

    async function clearCache() {
        const sw = await getActiveWorker();
        if (!sw) return;
        
        // Alerta amigável e direto
        if (!confirm('Isso vai apagar a Bíblia e a Sentinela do armazenamento offline do aparelho.\n\nFique tranquilo, suas anotações NÃO serão perdidas.\n\nDeseja continuar?')) return;
        
        busy = true;
        btnToggle.style.display = 'block';
        btnToggle.disabled = true;
        btnClear.style.display = 'none';
        btnToggle.textContent = 'Apagando...';
        offlineCard.classList.remove('is-ready');
        
        sw.postMessage({ action: 'CLEAR_CACHE' });
    }

    btnToggle.addEventListener('click', () => {
        if (!supported()) {
            alert('Seu navegador não suporta o modo offline.');
            return;
        }
        if (!busy) startDownload();
    });
    
    btnClear.addEventListener('click', () => {
        if (!busy) clearCache();
    });

    if (supported()) {
        navigator.serviceWorker.addEventListener('message', async (event) => {
            const data = event.data;
            if (!data) return;

            if (data.type === 'DOWNLOAD_PROGRESS') {
                setProgress(data.loaded || 0, data.total || 1);
            } else if (data.type === 'DOWNLOAD_COMPLETE') {
                busy = false;
                showProgress(false);
                const status = await refreshStatus();
                if (!status || !status.complete) {
                    alert('Atenção: A internet falhou ou alguns arquivos não foram salvos. Toque em "Completar Download" para tentar novamente.');
                }
            } else if (data.type === 'DOWNLOAD_ERROR') {
                busy = false;
                showProgress(false);
                await refreshStatus();
                alert('Erro ao baixar. Verifique sua conexão com a internet e tente novamente.');
            } else if (data.type === 'CACHE_CLEARED') {
                busy = false;
                showProgress(false);
                await refreshStatus();
            }
        });
    }

    // Inicialização silenciosa
    refreshStatus();
});