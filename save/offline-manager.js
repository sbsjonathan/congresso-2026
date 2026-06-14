document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btn-offline-toggle');
    const progressContainer = document.getElementById('offline-progress-container');
    const progressFill = document.getElementById('offline-progress-fill');
    const progressText = document.getElementById('offline-progress-text');
    const offlineHint = document.querySelector('.offline-section p');

    if (!btnToggle) return;

    let busy = false;
    let lastStatus = null;
    let flashTimer = null;

    const clearLink = document.createElement('button');
    clearLink.type = 'button';
    clearLink.style.display = 'none';
    clearLink.style.margin = '14px auto 0';
    clearLink.style.background = 'none';
    clearLink.style.border = 'none';
    clearLink.style.padding = '4px 8px';
    clearLink.style.font = 'inherit';
    clearLink.style.fontSize = '0.8rem';
    clearLink.style.color = 'var(--text-subtitle)';
    clearLink.style.textDecoration = 'underline';
    clearLink.style.cursor = 'pointer';
    clearLink.style.display = 'none';
    clearLink.textContent = 'Apagar dados offline';
    clearLink.addEventListener('click', () => { if (!busy) clearCache(); });
    btnToggle.insertAdjacentElement('afterend', clearLink);

    function supported() {
        return 'serviceWorker' in navigator;
    }

    function setHint(text) {
        if (offlineHint) offlineHint.textContent = text;
    }

    function flashHint(text, ms) {
        if (!offlineHint) return;
        if (flashTimer) clearTimeout(flashTimer);
        offlineHint.textContent = text;
        flashTimer = setTimeout(() => { render(lastStatus); }, ms || 3000);
    }

    function showProgress(show) {
        if (progressContainer) progressContainer.style.display = show ? 'block' : 'none';
        if (progressText) progressText.style.display = show ? 'block' : 'none';
    }

    function setProgress(loaded, total) {
        const percent = total ? Math.round((loaded / total) * 100) : 0;
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = 'Baixando ' + percent + '%';
    }

    function showClearLink(show) {
        clearLink.style.display = show ? 'block' : 'none';
    }

    function statusFrase(status) {
        if (!status) {
            return 'Baixe a Bíblia, o App e a Sentinela para ler sem internet.';
        }
        if (status.complete) {
            const artigo = status.articlePresent
                ? 'Bíblia, App e Sentinela prontos para uso offline.'
                : 'Bíblia e App prontos. Sentinela desta semana ainda não baixada.';
            return '✓ ' + artigo;
        }
        if (status.present > 0) {
            return 'Download incompleto. Toque para completar.';
        }
        return 'Baixe a Bíblia, o App e a Sentinela para ler sem internet.';
    }

    function render(status) {
        lastStatus = status;
        if (busy) return;
        if (flashTimer) { clearTimeout(flashTimer); flashTimer = null; }

        btnToggle.disabled = false;
        setHint(statusFrase(status));

        if (status && status.complete) {
            btnToggle.textContent = '✓ Conteúdo baixado';
            btnToggle.classList.add('btn-secondary');
            btnToggle.classList.remove('btn-danger');
            showClearLink(true);
            return;
        }

        if (status && status.present > 0) {
            btnToggle.textContent = '⬇️ Completar download';
            btnToggle.classList.add('btn-secondary');
            btnToggle.classList.remove('btn-danger');
            showClearLink(true);
            return;
        }

        btnToggle.textContent = '⬇️ Baixar para uso offline';
        btnToggle.classList.add('btn-secondary');
        btnToggle.classList.remove('btn-danger');
        showClearLink(false);
    }

    function getActiveWorker() {
        return navigator.serviceWorker.ready.then((reg) => reg.active || navigator.serviceWorker.controller);
    }

    async function ensurePersist() {
        try {
            if (navigator.storage && navigator.storage.persist) {
                await navigator.storage.persist();
            }
        } catch (e) {}
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
            flashHint('Sem internet. Conecte-se para baixar.', 3500);
            return;
        }
        const sw = await getActiveWorker();
        if (!sw) {
            flashHint('Sistema iniciando. Tente de novo em instantes.', 3500);
            return;
        }
        busy = true;
        showProgress(true);
        setProgress(0, 1);
        btnToggle.disabled = true;
        showClearLink(false);
        btnToggle.textContent = 'Baixando...';
        sw.postMessage({ action: 'START_DOWNLOAD' });
    }

    async function clearCache() {
        const sw = await getActiveWorker();
        if (!sw) return;
        if (!confirm('Apagar o conteúdo baixado para uso offline? Suas anotações NÃO serão apagadas.')) return;
        busy = true;
        btnToggle.disabled = true;
        showClearLink(false);
        btnToggle.textContent = 'Apagando...';
        sw.postMessage({ action: 'CLEAR_CACHE' });
    }

    btnToggle.addEventListener('click', async () => {
        if (!supported()) {
            flashHint('Seu navegador não suporta o modo offline.', 3500);
            return;
        }
        if (busy) return;
        const status = lastStatus;
        if (status && status.complete) {
            flashHint('✓ Tudo já está baixado.', 2500);
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
                await ensurePersist();
                const status = await refreshStatus();
                const complete = status ? status.complete : data.ok;
                if (complete) {
                    flashHint('✓ Download concluído. Já dá para usar sem internet.', 4000);
                } else {
                    flashHint('Faltaram alguns arquivos. Toque em "Completar download".', 4500);
                }
            } else if (data.type === 'DOWNLOAD_ERROR') {
                busy = false;
                showProgress(false);
                await refreshStatus();
                flashHint('Erro ao baixar. Verifique a conexão e tente de novo.', 4000);
            } else if (data.type === 'CACHE_CLEARED') {
                busy = false;
                showProgress(false);
                lastStatus = null;
                render(null);
                flashHint('✓ Dados offline apagados.', 3000);
            }
        });
    }

    ensurePersist().then(() => { if (!busy) render(lastStatus); });
    refreshStatus();
});
