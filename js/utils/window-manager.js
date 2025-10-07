/**
 * 🌐 WINDOW MANAGER
 * Sistema centralizado para gerenciar referências window.* globais
 * Evita dependências circulares e references quebradas
 */

class WindowManager {
    constructor() {
        this.refs = {};
        this.initialized = false;
        this.initPromise = null;
        
        console.log('🌐 WindowManager: Inicializando sistema centralizado de referências');
    }
    
    /**
     * Inicialização assíncrona do sistema
     */
    async init() {
        if (this.initPromise) return this.initPromise;
        
        this.initPromise = new Promise((resolve) => {
            // Aguardar DOM e sistemas básicos
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this._doInit(resolve));
            } else {
                this._doInit(resolve);
            }
        });
        
        return this.initPromise;
    }
    
    _doInit(resolve) {
        console.log('🌐 WindowManager: Configurando proxies para referências globais');
        
        // Configurar proxies seguros para cada referência global
        this._setupGameProxy();
        this._setupGameHubProxy();
        this._setupNotificationModalsProxy();
        this._setupCharacterCreatorProxy();
        this._setupMainMenuProxy();
        
        this.initialized = true;
        console.log('✅ WindowManager: Sistema inicializado com sucesso');
        resolve();
    }
    
    /**
     * Proxy seguro para window.game
     */
    _setupGameProxy() {
        const self = this;
        
        Object.defineProperty(window, 'game', {
            get() {
                return self.refs.game || null;
            },
            set(value) {
                if (value) {
                    console.log('🌐 WindowManager: window.game registrado');
                    self.refs.game = value;
                    self._notifyGameReady();
                }
            },
            configurable: true
        });
    }
    
    /**
     * Proxy seguro para window.gameHub
     */
    _setupGameHubProxy() {
        const self = this;
        
        Object.defineProperty(window, 'gameHub', {
            get() {
                return self.refs.gameHub || null;
            },
            set(value) {
                if (value) {
                    console.log('🌐 WindowManager: window.gameHub registrado');
                    self.refs.gameHub = value;
                }
            },
            configurable: true
        });
    }
    
    /**
     * Proxy seguro para window.notificationModals
     */
    _setupNotificationModalsProxy() {
        const self = this;
        
        Object.defineProperty(window, 'notificationModals', {
            get() {
                return self.refs.notificationModals || null;
            },
            set(value) {
                if (value) {
                    console.log('🌐 WindowManager: window.notificationModals registrado');
                    self.refs.notificationModals = value;
                }
            },
            configurable: true
        });
    }
    
    /**
     * Proxy seguro para window.characterCreator
     */
    _setupCharacterCreatorProxy() {
        const self = this;
        
        Object.defineProperty(window, 'characterCreator', {
            get() {
                return self.refs.characterCreator || null;
            },
            set(value) {
                if (value) {
                    console.log('🌐 WindowManager: window.characterCreator registrado');
                    self.refs.characterCreator = value;
                }
            },
            configurable: true
        });
    }
    
    /**
     * Proxy seguro para window.mainMenu
     */
    _setupMainMenuProxy() {
        const self = this;
        
        Object.defineProperty(window, 'mainMenu', {
            get() {
                return self.refs.mainMenu || null;
            },
            set(value) {
                if (value) {
                    console.log('🌐 WindowManager: window.mainMenu registrado');
                    self.refs.mainMenu = value;
                }
            },
            configurable: true
        });
    }
    
    /**
     * Notificar quando window.game estiver pronto
     */
    _notifyGameReady() {
        // Disparar evento personalizado para outros sistemas
        const event = new CustomEvent('gameReady', { 
            detail: { game: this.refs.game } 
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Obter referência segura
     */
    getRef(name) {
        return this.refs[name] || null;
    }
    
    /**
     * Verificar se uma referência está disponível
     */
    hasRef(name) {
        return !!(this.refs[name]);
    }
    
    /**
     * Aguardar uma referência ficar disponível
     */
    async waitForRef(name, timeout = 5000) {
        if (this.refs[name]) return this.refs[name];
        
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (this.refs[name]) {
                    clearInterval(checkInterval);
                    clearTimeout(timeoutHandle);
                    resolve(this.refs[name]);
                }
            }, 100);
            
            const timeoutHandle = setTimeout(() => {
                clearInterval(checkInterval);
                reject(new Error(`Timeout aguardando referência: ${name}`));
            }, timeout);
        });
    }
    
    /**
     * Executar código quando game estiver disponível
     */
    onGameReady(callback) {
        if (this.refs.game) {
            callback(this.refs.game);
        } else {
            window.addEventListener('gameReady', (e) => {
                callback(e.detail.game);
            }, { once: true });
        }
    }
}

// Instância global única
window.windowManager = new WindowManager();

// Auto-inicializar
window.windowManager.init().catch(console.error);

export default window.windowManager;