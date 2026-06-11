document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btn-offline-toggle');
    const progressContainer = document.getElementById('offline-progress-container');
    const progressFill = document.getElementById('offline-progress-fill');
    const progressText = document.getElementById('offline-progress-text');
    const offlineHint = document.querySelector('.offline-section p');

    if (!btnToggle) return;

    let busy = false;
    let lastStatus = null;

    function supported() {
        return 'serviceWorker' in navigator;
    }

    function setHint(text) {
        if (offlineHint) offlineHint.textContent = text;
    }

    function showProgress(show) {
        if (progressContainer) progressContainer.style.display = show ? 'block' : 'none';
        if (progressText) progressText.style.display = show ? 'block' : 'none';
    }

    function setProgress(loaded, total) {
        const percent = total ? Math.round((loaded / total) * 100) : 0;
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = percent + '% (' + loaded + '/' + total + ')';
    }

    function articleLine(status) {
        if (!status) return '';
        return status.articlePresent
            ? ' Sentinela desta semana incluída.'
            : ' Sentinela desta semana ainda não baixada.';
    }

    function render(status) {
        lastStatus = status;

        if (busy) return;

        if (!status) {
            btnToggle.disabled = false;
            btnToggle.innerHTML = '⬇️ Baixar para uso offline';
            btnToggle.classList.add('btn-secondary');
            btnToggle.classList.remove('btn-danger');
            setHint('Baixe a Bíblia e a Sentinela para ler sem internet.');
            return;
        }

        btnToggle.disabled = false;

        if (status.complete) {
            btnToggle.innerHTML = '🗑️ Apagar dados offline';
            btnToggle.classList.remove('btn-secondary');
            btnToggle.classList.add('btn-danger');
            setHint('✓ Disponível offline.' + articleLine(status));
            return;
        }

        if (status.present > 0) {
            const faltam = status.total - status.present;
            btnToggle.innerHTML = '⬇️ Completar download';
            btnToggle.classList.add('btn-secondary');
            btnToggle.classList.remove('btn-danger');
            setHint('Baixado parcialmente: ' + status.present + ' de ' + status.total + ' itens (faltam ' + faltam + '). Toque para completar.');
            return;
        }

        btnToggle.innerHTML = '⬇️ Baixar para uso offline';
        btnToggle.classList.add('btn-secondary');
        btnToggle.classList.remove('btn-danger');
        setHint('Baixe a Bíblia e a Sentinela para ler sem internet.');
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
                    const data = event.data;
                    finish(data && data.type === 'CACHE_STATUS' ? data : null);
                };
                try {
                    sw.postMessage({ action: 'CACHE_STATUS' }, [channel.port2]);
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
        if (!navigator.onLine) {
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
        btnToggle.innerHTML = 'Baixando...';
        sw.postMessage({ action: 'START_DOWNLOAD' });
    }

    async function clearCache() {
        const sw = await getActiveWorker();
        if (!sw) return;
        if (!confirm('Apagar os arquivos offline para liberar espaço? (Suas anotações locais não serão perdidas.)')) return;
        busy = true;
        btnToggle.disabled = true;
        btnToggle.innerHTML = 'Apagando...';
        sw.postMessage({ action: 'CLEAR_CACHE' });
    }

    btnToggle.addEventListener('click', async () => {
        if (!supported()) {
            alert('Seu navegador não suporta o modo offline.');
            return;
        }
        if (busy) return;

        const status = lastStatus;
        if (status && status.complete) {
            clearCache();
        } else {
            startDownload();
        }
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
                const complete = status ? status.complete : data.ok;
                if (complete) {
                    alert('Download concluído. Agora você pode abrir a Bíblia e a Sentinela sem internet.');
                } else {
                    const faltam = status ? (status.total - status.present) : (data.missing || 0);
                    alert('Faltaram ' + faltam + ' itens. Toque em "Completar download" para tentar de novo quando tiver uma conexão melhor.');
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
