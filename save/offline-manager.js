document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btn-offline-toggle');
    const btnClear = document.getElementById('btn-offline-clear');
    const progressContainer = document.getElementById('offline-progress-container');
    const progressFill = document.getElementById('offline-progress-fill');
    const progressText = document.getElementById('offline-progress-text');
    const descText = document.getElementById('offline-desc');
    const titleText = document.getElementById('offline-title');
    const iconSpan = document.getElementById('offline-icon');

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
        if (progressText) progressText.textContent = `Baixando... ${percent}% (${loaded}/${total})`;
    }

    function render(status) {
        lastStatus = status;
        if (busy) return;

        const partial = !!(status && !status.complete && status.present > 0);
        btnClear.style.display = partial || (status && status.complete) ? 'block' : 'none';

        if (!status) {
            btnToggle.disabled = false;
            btnToggle.textContent = 'Baixar App Inteiro';
            btnToggle.classList.remove('is-ready');
            iconSpan.textContent = '🌐';
            titleText.textContent = 'Modo Offline';
            descText.textContent = 'A Bíblia e a Sentinela estarão com você, mesmo sem internet.';
            return;
        }

        btnToggle.disabled = false;

        if (status.complete) {
            btnToggle.textContent = 'App Atualizado e Pronto';
            btnToggle.classList.add('is-ready');
            iconSpan.textContent = '✅';
            titleText.textContent = 'Disponível Offline';
            descText.textContent = status.articlePresent 
                ? `A Bíblia e A Sentinela (${status.semana}) estão salvas no aparelho.`
                : `A Bíblia está salva. A Sentinela da semana ${status.semana} ainda não foi baixada.`;
            return;
        }

        if (status.present > 0) {
            btnToggle.textContent = 'Completar Download';
            btnToggle.classList.remove('is-ready');
            iconSpan.textContent = '⚠️';
            titleText.textContent = 'Download Incompleto';
            descText.textContent = `Faltam baixar arquivos essenciais para o funcionamento sem internet.`;
            return;
        }

        btnToggle.textContent = 'Baixar App Inteiro';
        btnToggle.classList.remove('is-ready');
        iconSpan.textContent = '🌐';
        titleText.textContent = 'Modo Offline';
        descText.textContent = 'A Bíblia e a Sentinela estarão com você, mesmo sem internet.';
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
        if (!status) status = await requestCacheStatus();
        render(status);
        return status;
    }

    async function startDownload() {
        if (document.body.classList.contains('is-offline')) {
            alert('Você precisa de internet para baixar os arquivos.');
            return;
        }
        const sw = await getActiveWorker();
        if (!sw) {
            alert('Sistema offline iniciando... Tente novamente em alguns segundos.');
            return;
        }
        busy = true;
        showProgress(true);
        setProgress(0, 1);
        btnToggle.disabled = true;
        btnClear.style.display = 'none';
        btnToggle.textContent = 'Preparando...';
        btnToggle.classList.remove('is-ready');
        
        sw.postMessage({ 
            action: 'START_DOWNLOAD',
            semana: getWeekToDownload()
        });
    }

    async function clearCache() {
        const sw = await getActiveWorker();
        if (!sw) return;
        if (!confirm('Isso vai apagar a Bíblia e o app do armazenamento offline. Suas anotações NÃO serão perdidas. Continuar?')) return;
        
        busy = true;
        btnToggle.disabled = true;
        btnClear.style.display = 'none';
        btnToggle.textContent = 'Apagando...';
        btnToggle.classList.remove('is-ready');
        sw.postMessage({ action: 'CLEAR_CACHE' });
    }

    btnToggle.addEventListener('click', async () => {
        if (!supported()) {
            alert('Seu navegador não suporta o modo offline.');
            return;
        }
        if (busy) return;
        const status = lastStatus;
        if (status && status.complete && status.articlePresent) {
            alert('O aplicativo já está totalmente atualizado e pronto para uso offline.');
        } else {
            startDownload();
        }
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
                if (status && status.complete) {
                    // Feedback visual sutil
                } else {
                    alert('Alguns arquivos falharam. Toque em "Completar Download" para tentar novamente.');
                }
            } else if (data.type === 'DOWNLOAD_ERROR') {
                busy = false;
                showProgress(false);
                await refreshStatus();
                alert('Erro ao baixar. Verifique sua conexão e tente novamente.');
            } else if (data.type === 'CACHE_CLEARED') {
                busy = false;
                showProgress(false);
                await refreshStatus();
            }
        });
    }

    refreshStatus();
});