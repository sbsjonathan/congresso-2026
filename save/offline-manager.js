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
            const w = window.getGlobalWeek();
            if (w) return w;
        }
        if (window.semanaAtual) return window.semanaAtual;
        const hoje = new Date();
        const dia = hoje.getDay();
        const diff = dia === 0 ? -6 : 1 - dia;
        const segunda = new Date(hoje);
        segunda.setDate(hoje.getDate() + diff);
        const dd = String(segunda.getDate()).padStart(2, '0');
        const mm = String(segunda.getMonth() + 1).padStart(2, '0');
        return dd + '-' + mm;
    }

    async function ensurePersist() {
        try {
            if (navigator.storage && navigator.storage.persist) {
                await navigator.storage.persist();
            }
        } catch (e) {}
    }

    function showProgress(show) {
        if (progressContainer) progressContainer.style.display = show ? 'block' : 'none';
        if (progressText) progressText.style.display = show ? 'block' : 'none';
    }

    function setProgress(loaded, total) {
        const percent = total ? Math.round((loaded / total) * 100) : 0;
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = 'Baixando... ' + percent + '%';
    }

    function render(status) {
        lastStatus = status;
        if (busy) return;

        const baixado = !!(status && status.total > 0);
        const isReady = !!(status && status.complete);
        const isPartial = baixado && !isReady && status.present > 0;

        btnClear.style.display = baixado ? 'block' : 'none';

        if (isReady) {
            btnToggle.style.display = 'none';
            offlineCard.classList.add('is-ready');
            iconSpan.textContent = '✅';
            titleText.textContent = 'Tudo pronto para o congresso';
            descText.textContent = 'A Bíblia e a Sentinela estão salvas no aparelho. No congresso você abre tudo sem gastar dados móveis.';
            return;
        }

        if (isPartial) {
            btnToggle.disabled = false;
            btnToggle.style.display = 'block';
            btnToggle.textContent = 'Completar download';
            offlineCard.classList.remove('is-ready');
            iconSpan.textContent = '⚠️';
            titleText.textContent = 'Download incompleto';
            descText.textContent = 'O download foi interrompido. Toque para completar e garantir tudo offline.';
            return;
        }

        btnToggle.disabled = false;
        btnToggle.style.display = 'block';
        btnToggle.textContent = 'Baixar para o congresso';
        offlineCard.classList.remove('is-ready');
        iconSpan.textContent = '☁️';
        titleText.textContent = 'Modo Offline';
        descText.textContent = 'Nenhum dado salvo. Baixe a Bíblia e a Sentinela no Wi-Fi para não gastar dados móveis no congresso.';
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
        if (document.body.classList.contains('is-offline') || !navigator.onLine) {
            alert('Você precisa estar conectado à internet para baixar.');
            return;
        }
        const sw = await getActiveWorker();
        if (!sw) {
            alert('O sistema está iniciando. Tente novamente em alguns segundos.');
            return;
        }
        busy = true;
        showProgress(true);
        setProgress(0, 1);
        btnToggle.disabled = true;
        btnClear.style.display = 'none';
        btnToggle.textContent = 'Preparando...';
        offlineCard.classList.remove('is-ready');
        sw.postMessage({ action: 'START_DOWNLOAD', semana: getWeekToDownload() });
    }

    async function clearCache() {
        const sw = await getActiveWorker();
        if (!sw) return;
        if (!confirm('Isso vai apagar a Bíblia, o App e a Sentinela salvos no aparelho.\n\nSuas anotações NÃO serão perdidas.\n\nDeseja continuar?')) return;
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
                await ensurePersist();
                const status = await refreshStatus();
                if (!status || !status.complete) {
                    alert('Alguns arquivos não foram salvos. Toque em "Completar download" para tentar de novo.');
                }
            } else if (data.type === 'DOWNLOAD_ERROR') {
                busy = false;
                showProgress(false);
                await refreshStatus();
                alert('Erro ao baixar. Verifique a conexão e tente novamente.');
            } else if (data.type === 'CACHE_CLEARED') {
                busy = false;
                showProgress(false);
                lastStatus = null;
                await refreshStatus();
            }
        });
    }

    ensurePersist().then(() => refreshStatus());
});
