/**
 * Sistema de Configuração Centralizado para Rising Star
 * Gerencia todas as configurações do jogo em um local único
 */

class ConfigManager {
    constructor() {
        this.version = '2.0.0';
        
        // Configurações padrão
        this.defaultConfig = {
            // Configurações de debug
            debug: {
                enabled: this.detectDevelopmentMode(),
                performance: false,
                gameState: true,
                aiSimulation: true,
                modules: ['gameEngine', 'interface', 'notifications']
            },
            
            // Configurações da interface
            ui: {
                animations: true,
                transitions: true,
                autoSave: true,
                autoSaveInterval: 30000, // 30 segundos
                theme: 'dark',
                language: 'pt-BR',
                accessibility: {
                    highContrast: false,
                    reduceMotion: false,
                    largeText: false
                }
            },
            
            // Configurações do jogo
            game: {
                difficulty: 'normal', // easy, normal, hard
                autoPlay: false,
                skipIntro: false,
                fastMode: false,
                notifications: {
                    enabled: true,
                    sound: true,
                    position: 'top-right' // top-left, top-right, bottom-left, bottom-right
                }
            },
            
            // Configurações de performance
            performance: {
                maxFPS: 60,
                enableAnimations: true,
                enableParticles: true,
                preloadAssets: true,
                cacheSize: 50 // MB
            },
            
            // Configurações de storage
            storage: {
                maxSaves: 5,
                autoBackup: true,
                compression: true,
                cloudSync: false
            },
            
            // Configurações da IA
            ai: {
                complexity: 'medium', // low, medium, high
                responseTime: 1000,
                adaptiveDifficulty: true,
                personalityVariation: true
            }
        };
        
        this.config = {};
        this.observers = [];
        
        this.init();
    }
    
    detectDevelopmentMode() {
        return (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:' ||
            window.location.search.includes('debug=true')
        );
    }
    
    init() {
        // Carregar configurações salvas
        this.loadConfig();
        
        // Disponibilizar globalmente
        window.configManager = this;
        
        // Log inicial
        if (this.config.debug?.enabled) {
            console.info('⚙️ ConfigManager inicializado', {
                version: this.version,
                debug: this.config.debug.enabled,
                theme: this.config.ui.theme
            });
        }
    }
    
    loadConfig() {
        try {
            const saved = localStorage.getItem('risingstar_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.config = this.mergeConfig(this.defaultConfig, parsed);
            } else {
                this.config = JSON.parse(JSON.stringify(this.defaultConfig));
            }
        } catch (error) {
            console.warn('⚙️ Erro ao carregar configurações, usando padrões:', error);
            this.config = JSON.parse(JSON.stringify(this.defaultConfig));
        }
        
        // Garantir que todas as chaves existam
        this.config = this.mergeConfig(this.defaultConfig, this.config);
    }
    
    saveConfig() {
        try {
            localStorage.setItem('risingstar_config', JSON.stringify(this.config));
            this.notifyObservers('configSaved', this.config);
            
            if (this.config.debug?.enabled) {
                console.info('⚙️ Configurações salvas');
            }
        } catch (error) {
            console.error('⚙️ Erro ao salvar configurações:', error);
        }
    }
    
    mergeConfig(defaultConfig, userConfig) {
        const result = {};
        
        for (const key in defaultConfig) {
            if (typeof defaultConfig[key] === 'object' && !Array.isArray(defaultConfig[key])) {
                result[key] = this.mergeConfig(
                    defaultConfig[key], 
                    userConfig[key] || {}
                );
            } else {
                result[key] = userConfig.hasOwnProperty(key) ? userConfig[key] : defaultConfig[key];
            }
        }
        
        return result;
    }
    
    // Getters para configurações específicas
    get(path) {
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && value.hasOwnProperty(key)) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        
        return value;
    }
    
    set(path, value) {
        const keys = path.split('.');
        let target = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key];
        }
        
        const lastKey = keys[keys.length - 1];
        const oldValue = target[lastKey];
        target[lastKey] = value;
        
        // Salvar automaticamente
        this.saveConfig();
        
        // Notificar mudança
        this.notifyObservers('configChanged', {
            path,
            oldValue,
            newValue: value
        });
        
        if (this.config.debug?.enabled) {
            console.info(`⚙️ Config atualizada: ${path} = ${value}`);
        }
    }
    
    // Sistema de observadores
    observe(callback) {
        this.observers.push(callback);
        return () => {
            const index = this.observers.indexOf(callback);
            if (index > -1) {
                this.observers.splice(index, 1);
            }
        };
    }
    
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('⚙️ Erro em observer:', error);
            }
        });
    }
    
    // Métodos de conveniência
    isDebugEnabled() {
        return this.get('debug.enabled') === true;
    }
    
    isDevelopment() {
        return this.detectDevelopmentMode();
    }
    
    getTheme() {
        return this.get('ui.theme') || 'dark';
    }
    
    setTheme(theme) {
        this.set('ui.theme', theme);
        document.body.setAttribute('data-theme', theme);
    }
    
    getDifficulty() {
        return this.get('game.difficulty') || 'normal';
    }
    
    setDifficulty(difficulty) {
        this.set('game.difficulty', difficulty);
    }
    
    areAnimationsEnabled() {
        return this.get('ui.animations') !== false;
    }
    
    isAutoSaveEnabled() {
        return this.get('ui.autoSave') !== false;
    }
    
    getAutoSaveInterval() {
        return this.get('ui.autoSaveInterval') || 30000;
    }
    
    // Reset para padrões
    resetToDefaults() {
        this.config = JSON.parse(JSON.stringify(this.defaultConfig));
        this.saveConfig();
        
        console.info('⚙️ Configurações resetadas para padrões');
        this.notifyObservers('configReset', this.config);
    }
    
    // Export/Import configurações
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }
    
    importConfig(configString) {
        try {
            const imported = JSON.parse(configString);
            this.config = this.mergeConfig(this.defaultConfig, imported);
            this.saveConfig();
            
            console.info('⚙️ Configurações importadas com sucesso');
            this.notifyObservers('configImported', this.config);
            return true;
        } catch (error) {
            console.error('⚙️ Erro ao importar configurações:', error);
            return false;
        }
    }
    
    // Validação de configurações
    validateConfig() {
        const issues = [];
        
        // Validar valores críticos
        if (!['easy', 'normal', 'hard'].includes(this.get('game.difficulty'))) {
            issues.push('Dificuldade inválida');
            this.set('game.difficulty', 'normal');
        }
        
        if (!['dark', 'light'].includes(this.get('ui.theme'))) {
            issues.push('Tema inválido');
            this.set('ui.theme', 'dark');
        }
        
        const autoSaveInterval = this.get('ui.autoSaveInterval');
        if (typeof autoSaveInterval !== 'number' || autoSaveInterval < 5000) {
            issues.push('Intervalo de auto-save inválido');
            this.set('ui.autoSaveInterval', 30000);
        }
        
        return issues;
    }
    
    // Debug helper
    logCurrentConfig() {
        console.group('⚙️ Configuração Atual');
        console.table(this.config);
        console.groupEnd();
    }
}

// Instanciar globalmente
window.configManager = new ConfigManager();

// Aliases para conveniência
window.config = {
    get: (path) => window.configManager.get(path),
    set: (path, value) => window.configManager.set(path, value),
    save: () => window.configManager.saveConfig(),
    reset: () => window.configManager.resetToDefaults(),
    debug: () => window.configManager.logCurrentConfig()
};

console.log('⚙️ ConfigManager carregado - Use window.config.debug() para ver configurações');