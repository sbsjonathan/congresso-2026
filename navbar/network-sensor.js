(function initNetworkSensor() {
    let pingCheckInProgress = false;

    function getPingUrl() {
        try {
            if (typeof getProjectRootURL === 'function') {
                return getProjectRootURL() + 'assets/icons/favicon-32.png';
            }
        } catch (e) {}
        return '../assets/icons/favicon-32.png';
    }

    async function verifyRealConnection() {
        if (!navigator.onLine) return false;
        
        try {
            const url = getPingUrl() + '?cb=' + Date.now();
            const res = await fetch(url, { 
                method: 'HEAD', 
                cache: 'no-store', 
                mode: 'no-cors' 
            });
            return true;
        } catch (e) {
            return false;
        }
    }

    async function updateNetworkStatus() {
        if (pingCheckInProgress) return;
        pingCheckInProgress = true;

        const isActuallyOnline = await verifyRealConnection();
        
        const iaButtons = document.querySelectorAll('.btn-gerar-ia, .agente-btn--primario');
        iaButtons.forEach(btn => {
            if (!isActuallyOnline) {
                if (btn.dataset.wasDisabled === undefined) {
                    btn.dataset.wasDisabled = btn.disabled;
                }
                btn.disabled = true;
                btn.style.opacity = '0.4';
                btn.style.filter = 'grayscale(100%)';
            } else {
                if (btn.dataset.wasDisabled === 'false' || btn.dataset.wasDisabled === undefined) {
                    btn.disabled = false;
                }
                btn.style.opacity = '1';
                btn.style.filter = 'none';
            }
        });

        if (!isActuallyOnline) {
            document.body.classList.add('is-offline');
            if (window.AutoSaveManager) window.AutoSaveManager.isPaused = true;
        } else {
            document.body.classList.remove('is-offline');
            if (window.AutoSaveManager) {
                window.AutoSaveManager.isPaused = false;
                window.AutoSaveManager.forceAutoSave();
            }
        }
        
        pingCheckInProgress = false;
    }

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            updateNetworkStatus();
        }
    });
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateNetworkStatus);
    } else {
        updateNetworkStatus();
    }
})();