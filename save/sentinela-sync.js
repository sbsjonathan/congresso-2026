class SentinelaSync {
    constructor() {
        this.semanaAtual = null;
        this.estudoId = null;
        this.isLoggedIn = false;
        this.isSyncing = false;
        this.initialLoadComplete = false;
        this.autoSaveTimeout = null;
        this.lastSavedDataJSON = '{}';
        this.SAVE_DELAY = 2500;
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
        this.detectSemanaEEstudo();
        this.checkLoginStatus();
        
        if (this.isLoggedIn) {
            this.loadFromSupabase();
        } else {
            this.initialLoadComplete = true;
        }
        
        this.interceptCacheSalvar();
    }

    detectSemanaEEstudo() {
        const urlParams = new URLSearchParams(window.location.search);
        this.semanaAtual = window.semanaAtual || urlParams.get('semana');
        this.estudoId = window.estudoId || document.body.dataset.estudo;
    }

    checkLoginStatus() {
        this.isLoggedIn = !!localStorage.getItem('supabase_user');
    }

    interceptCacheSalvar() {
        if (!window.CacheAnotacao || typeof window.CacheAnotacao.salvar !== 'function') {
            setTimeout(() => this.interceptCacheSalvar(), 200);
            return;
        }

        const originalSalvar = window.CacheAnotacao.salvar.bind(window.CacheAnotacao);
        
        window.CacheAnotacao.salvar = (id, conteudo) => {
            originalSalvar(id, conteudo);
            this.scheduleAutoSave();
        };
    }

    scheduleAutoSave() {
        if (!this.isLoggedIn) return;
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.executeAutoSave();
        }, this.SAVE_DELAY);
    }

    async executeAutoSave() {
        if (!this.initialLoadComplete) return;

        if (!window.SupabaseSync || typeof window.SupabaseSync.salvarSentinelaAnotacoes !== 'function') {
            this.scheduleAutoSave(); 
            return;
        }

        if (this.isSyncing || !this.isLoggedIn) {
            return;
        }

        this.isSyncing = true;
        
        try {
            const anotacoes = this.collectAnnotationsFromLocalStorage();
            const anotacoesJSON = JSON.stringify(anotacoes);

            if (anotacoesJSON === this.lastSavedDataJSON) {
                this.isSyncing = false;
                return;
            }

            const result = await window.SupabaseSync.salvarSentinelaAnotacoes(
                this.semanaAtual,
                this.estudoId,
                anotacoes
            );

            if (result.success) {
                this.lastSavedDataJSON = anotacoesJSON;
            }
        } catch (error) {
        } finally {
            this.isSyncing = false;
        }
    }

    async loadFromSupabase() {
        if (!window.SupabaseSync || typeof window.SupabaseSync.carregarSentinelaAnotacoes !== 'function') {
            setTimeout(() => this.loadFromSupabase(), 500);
            return;
        }
    
        const loadFlag = `sentinela_loaded_${this.semanaAtual}_${this.estudoId}`;
        if (sessionStorage.getItem(loadFlag)) {
            this.initialLoadComplete = true;
            return;
        }
    
        try {
            const anotacoes = await window.SupabaseSync.carregarSentinelaAnotacoes(this.semanaAtual, this.estudoId);
    
            if (anotacoes && Object.keys(anotacoes).length > 0) {
                let localChangesExist = false;
                for (const [key, value] of Object.entries(anotacoes)) {
                    if (localStorage.getItem(key) !== value) {
                        localStorage.setItem(key, value);
                        localChangesExist = true;
                    }
                }
    
                if (localChangesExist) {
                    sessionStorage.setItem(loadFlag, 'true');
                    this.initialLoadComplete = true;
                    location.reload();
                } else {
                    this.initialLoadComplete = true;
                }
            } else {
                this.initialLoadComplete = true;
            }
        } catch (error) {
            this.initialLoadComplete = true;
        }
    }
    
    collectAnnotationsFromLocalStorage() {
        const anotacoes = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (/^(c-|r-|p-|obj-)|-pg-/.test(key)) {
                anotacoes[key] = localStorage.getItem(key);
            }
        }
        return anotacoes;
    }
}

window.sentinelaSync = new SentinelaSync();