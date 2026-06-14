class AssembleiaSync {
    constructor() {
        this.ano = null;
        this.isLoggedIn = false;
        this.isSyncing = false;
        this.initialLoadComplete = false;
        this.autoSaveTimeout = null;
        this.lastSavedDataJSON = '{}';
        this.SAVE_DELAY = 2500;
        this.loadAttempts = 0;
        this.MAX_LOAD_ATTEMPTS = 4;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            setTimeout(() => this.setup(), 200);
        }
    }

    setup() {
        this.detectAno();
        this.checkLoginStatus();

        if (this.isLoggedIn) {
            this.loadFromSupabase();
        } else {
            this.initialLoadComplete = true;
        }

        window.addEventListener('assembleia:recordchange', () => {
            this.scheduleAutoSave();
        });

        document.addEventListener('input', (e) => {
            if (e.target.closest('.clickable-asmb') || e.target.closest('.editor') || e.target.closest('.assistencia-input')) {
                this.scheduleAutoSave();
            }
        });

        document.addEventListener('focusout', (e) => {
            if (e.target.closest('.clickable-asmb') || e.target.closest('.editor') || e.target.closest('.assistencia-input')) {
                this.scheduleAutoSave();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') this.flushPendingSave();
        });

        window.addEventListener('pagehide', () => this.flushPendingSave());
    }

    detectAno() {
        this.ano = document.documentElement.dataset.programYear || '2026';
    }

    checkLoginStatus() {
        this.isLoggedIn = !!localStorage.getItem('supabase_user');
    }

    scheduleAutoSave() {
        if (!this.isLoggedIn || !this.initialLoadComplete) return;
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.executeAutoSave();
        }, this.SAVE_DELAY);
    }

    flushPendingSave() {
        if (!this.isLoggedIn || !this.initialLoadComplete) return;
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = null;
            this.executeAutoSave();
        }
    }

    collectAnnotationsFromLocalStorage() {
        const anotacoes = {};
        const prefixo = `${this.ano}-`;
        const prefs = ['tema-interface', 'tamanho-fonte-global', 'editor-performance-mode', 'cor-sex', 'cor-sab', 'cor-dom'];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefixo) || prefs.includes(key)) {
                anotacoes[key] = localStorage.getItem(key);
            }
        }
        return anotacoes;
    }

    async executeAutoSave() {
        if (!this.initialLoadComplete) return;

        if (!window.SupabaseSync || typeof window.SupabaseSync.salvarAssembleiaAnotacoes !== 'function') {
            this.scheduleAutoSave();
            return;
        }

        if (this.isSyncing || !this.isLoggedIn) return;

        this.isSyncing = true;

        try {
            const anotacoes = this.collectAnnotationsFromLocalStorage();
            const anotacoesJSON = JSON.stringify(anotacoes);

            if (anotacoesJSON === this.lastSavedDataJSON) {
                this.isSyncing = false;
                return;
            }

            if (Object.keys(anotacoes).length === 0 && this.lastSavedDataJSON !== '{}') {
                this.isSyncing = false;
                return;
            }

            const result = await window.SupabaseSync.salvarAssembleiaAnotacoes(this.ano, anotacoes);

            if (result && result.success) {
                this.lastSavedDataJSON = anotacoesJSON;
            }
        } catch (error) {
        } finally {
            this.isSyncing = false;
        }
    }

    async loadFromSupabase(force = false) {
        if (!window.SupabaseSync || typeof window.SupabaseSync.carregarAssembleiaAnotacoes !== 'function') {
            setTimeout(() => this.loadFromSupabase(force), 500);
            return;
        }

        const loadFlag = `asmb_loaded_${this.ano}`;
        if (!force && sessionStorage.getItem(loadFlag)) {
            this.initialLoadComplete = true;
            return;
        }

        try {
            const anotacoes = await window.SupabaseSync.carregarAssembleiaAnotacoes(this.ano);

            if (anotacoes && Object.keys(anotacoes).length > 0) {
                let localChangesExist = false;
                let prefsChanged = false;
                const prefs = ['tema-interface', 'tamanho-fonte-global', 'editor-performance-mode', 'cor-sex', 'cor-sab', 'cor-dom'];

                for (const [key, value] of Object.entries(anotacoes)) {
                    if (localStorage.getItem(key) !== value) {
                        localStorage.setItem(key, value);
                        localChangesExist = true;
                        if (prefs.includes(key)) prefsChanged = true;
                    }
                }

                this.lastSavedDataJSON = JSON.stringify(anotacoes);
                this.initialLoadComplete = true;
                sessionStorage.setItem(loadFlag, 'true');

                if (localChangesExist || force) {
                    if (prefsChanged) {
                        location.reload();
                        return;
                    }
                    if (window.AssembleiaClickables && typeof window.AssembleiaClickables.refresh === 'function') {
                        window.AssembleiaClickables.refresh();
                    } else {
                        location.reload();
                        return;
                    }
                }
            } else {
                this.initialLoadComplete = true;
                sessionStorage.setItem(loadFlag, 'true');
                if (force && window.AssembleiaClickables && typeof window.AssembleiaClickables.refresh === 'function') {
                    window.AssembleiaClickables.refresh();
                }
            }
        } catch (error) {
            this.loadAttempts++;
            if (this.loadAttempts < this.MAX_LOAD_ATTEMPTS) {
                setTimeout(() => this.loadFromSupabase(force), 2000);
            } else {
                this.initialLoadComplete = true;
            }
        }
    }

    notReady() {
        if (!window.SupabaseSync) return true;
        if (typeof window.SupabaseSync.salvarAssembleiaAnotacoes !== 'function') return true;
        if (typeof window.SupabaseSync.carregarAssembleiaAnotacoes !== 'function') return true;
        return false;
    }

    async pushOverwrite() {
        if (this.notReady()) return { success: false, error: 'Nuvem indisponível' };
        const local = this.collectAnnotationsFromLocalStorage();
        const result = await window.SupabaseSync.salvarAssembleiaAnotacoes(this.ano, local);
        if (result && result.success) this.lastSavedDataJSON = JSON.stringify(local);
        return result;
    }

    async pushMerge() {
        if (this.notReady()) return { success: false, error: 'Nuvem indisponível' };
        const local = this.collectAnnotationsFromLocalStorage();
        let remoto = null;
        try { remoto = await window.SupabaseSync.carregarAssembleiaAnotacoes(this.ano); } catch (e) { remoto = null; }
        const merge = {};
        if (remoto && typeof remoto === 'object') {
            for (const k of Object.keys(remoto)) merge[k] = remoto[k];
        }
        for (const k of Object.keys(local)) merge[k] = local[k];
        const result = await window.SupabaseSync.salvarAssembleiaAnotacoes(this.ano, merge);
        if (result && result.success) this.lastSavedDataJSON = JSON.stringify(merge);
        return result;
    }

    async pushDay(dia) {
        if (this.notReady()) return { success: false, error: 'Nuvem indisponível' };
        let remoto = null;
        try { remoto = await window.SupabaseSync.carregarAssembleiaAnotacoes(this.ano); } catch (e) { remoto = null; }
        const merge = {};
        if (remoto && typeof remoto === 'object') {
            for (const k of Object.keys(remoto)) merge[k] = remoto[k];
        }
        const prefixoDia = `${this.ano}-${dia}-`;
        const prefs = ['tema-interface', 'tamanho-fonte-global', 'editor-performance-mode', 'cor-sex', 'cor-sab', 'cor-dom'];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefixoDia) || prefs.includes(key)) {
                merge[key] = localStorage.getItem(key);
            }
        }
        const result = await window.SupabaseSync.salvarAssembleiaAnotacoes(this.ano, merge);
        if (result && result.success) this.lastSavedDataJSON = JSON.stringify(merge);
        return result;
    }

    async pullOverwrite() {
        if (this.notReady()) return { success: false, error: 'Nuvem indisponível' };
        let remoto = null;
        try { remoto = await window.SupabaseSync.carregarAssembleiaAnotacoes(this.ano); } catch (e) {
            return { success: false, error: 'Falha ao buscar a nuvem' };
        }
        const prefixo = `${this.ano}-`;
        const prefs = ['tema-interface', 'tamanho-fonte-global', 'editor-performance-mode', 'cor-sex', 'cor-sab', 'cor-dom'];
        const remover = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefixo) || prefs.includes(key)) remover.push(key);
        }
        for (const k of remover) localStorage.removeItem(k);

        if (remoto && typeof remoto === 'object') {
            for (const k of Object.keys(remoto)) localStorage.setItem(k, remoto[k]);
            this.lastSavedDataJSON = JSON.stringify(remoto);
        } else {
            this.lastSavedDataJSON = '{}';
        }
        sessionStorage.setItem(`asmb_loaded_${this.ano}`, 'true');
        return { success: true };
    }
}

window.assembleiaSync = new AssembleiaSync();