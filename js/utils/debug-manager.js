/**
 * Sistema de Debug e Logging para Rising Star
 * Centraliza controle de logs e debugging
 * Integrado com ConfigManager
 */

class DebugManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Aguardar ConfigManager estar disponível
        if (typeof window.configManager === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }
        
        // Backup dos métodos originais do console
        this.originalConsole = {
            log: console.log.bind(console),
            info: console.info.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console),
            debug: console.debug.bind(console),
            trace: console.trace.bind(console)
        };
        
        // Disponibilizar controles globais
        window.debugManager = this;
        window.setDebug = (enabled) => this.setEnabled(enabled);
        window.debugLog = (module, ...args) => this.log(module, ...args);
        
        // Observer para mudanças de configuração
        window.configManager.observe((event, data) => {
            if (event === 'configChanged' && data.path.startsWith('debug.')) {
                this.onConfigChanged(data);
            }
        });
        
        // Log inicial
        if (this.isEnabled()) {
            this.originalConsole.info(
                '%c🔧 Debug Mode Ativo', 
                'color: #4facfe; font-weight: bold;',
                '| Use window.setDebug(false) para desativar'
            );
        }
    }
    
    onConfigChanged(data) {
        if (data.path === 'debug.enabled') {
            this.originalConsole.info(
                `🔧 Debug ${data.newValue ? 'ATIVADO' : 'DESATIVADO'} via ConfigManager`
            );
        }
    }
    
    isEnabled() {
        return window.configManager?.get('debug.enabled') === true;
    }
    
    isModuleEnabled(module) {
        const modules = window.configManager?.get('debug.modules') || [];
        return modules.includes(module);
    }
    
    isPerformanceEnabled() {
        return window.configManager?.get('debug.performance') === true;
    }
    
    setEnabled(enabled) {
        if (window.configManager) {
            window.configManager.set('debug.enabled', enabled);
        }
    }
    
    setModuleDebug(module, enabled) {
        if (!window.configManager) return;
        
        const modules = window.configManager.get('debug.modules') || [];
        const index = modules.indexOf(module);
        
        if (enabled && index === -1) {
            modules.push(module);
        } else if (!enabled && index > -1) {
            modules.splice(index, 1);
        }
        
        window.configManager.set('debug.modules', modules);
        this.originalConsole.info(`🔧 Debug ${module}: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    setPerformanceDebug(enabled) {
        if (window.configManager) {
            window.configManager.set('debug.performance', enabled);
        }
    }
    
    // Método principal de logging
    log(module, level, ...args) {
        if (!this.shouldLog(module, level)) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const moduleTag = module ? `[${module}]` : '';
        const prefix = `${timestamp} ${moduleTag}`;
        
        switch (level) {
            case 'error':
                this.originalConsole.error(prefix, ...args);
                break;
            case 'warn':
                this.originalConsole.warn(prefix, ...args);
                break;
            case 'info':
                this.originalConsole.info(prefix, ...args);
                break;
            case 'debug':
                this.originalConsole.debug(prefix, ...args);
                break;
            case 'trace':
                this.originalConsole.trace(prefix, ...args);
                break;
            default:
                this.originalConsole.log(prefix, ...args);
        }
    }
    
    shouldLog(module, level) {
        // Sempre permitir errors e warnings
        if (level === 'error' || level === 'warn') return true;
        
        // Verificar se debug está globalmente ativo
        if (!this.isEnabled()) return false;
        
        // Verificar se o módulo está ativo (se especificado)
        if (module && !this.isModuleEnabled(module)) {
            return false;
        }
        
        return true;
    }
    
    // Métodos de conveniência
    error(module, ...args) {
        this.log(module, 'error', ...args);
    }
    
    warn(module, ...args) {
        this.log(module, 'warn', ...args);
    }
    
    info(module, ...args) {
        this.log(module, 'info', ...args);
    }
    
    debug(module, ...args) {
        this.log(module, 'debug', ...args);
    }
    
    trace(module, ...args) {
        this.log(module, 'trace', ...args);
    }
    
    // Performance timing
    time(label) {
        if (this.isPerformanceEnabled()) {
            console.time(label);
        }
    }
    
    timeEnd(label) {
        if (this.isPerformanceEnabled()) {
            console.timeEnd(label);
        }
    }
    
    // Utilitários
    logGameState() {
        if (!window.game) {
            this.warn('debug', 'Game não inicializado');
            return;
        }
        
        this.info('debug', 'Estado do Jogo:', {
            state: window.game.gameState,
            player: window.game.gameData?.player?.name || 'N/A',
            money: window.game.gameData?.player?.money || 0,
            systems: Object.keys(window.game.systems || {}).filter(k => window.game.systems[k])
        });
    }
    
    logPerformanceMetrics() {
        if (!this.isPerformanceEnabled()) return;
        
        const metrics = performance.getEntriesByType('navigation')[0];
        this.info('performance', 'Métricas de Performance:', {
            domContentLoaded: `${metrics.domContentLoadedEventEnd - metrics.domContentLoadedEventStart}ms`,
            pageLoad: `${metrics.loadEventEnd - metrics.loadEventStart}ms`,
            total: `${metrics.loadEventEnd - metrics.fetchStart}ms`
        });
    }
    
    // Configurações de debug
    showConfig() {
        if (!this.isEnabled()) return;
        
        const debugConfig = window.configManager?.get('debug') || {};
        this.originalConsole.group('🔧 Configurações de Debug');
        this.originalConsole.table(debugConfig);
        this.originalConsole.groupEnd();
    }
    
    // Lista de módulos disponíveis
    listModules() {
        const availableModules = [
            'gameEngine', 'aiSimulation', 'interface', 
            'notifications', 'storage', 'performance'
        ];
        
        this.originalConsole.group('🔧 Módulos de Debug');
        availableModules.forEach(module => {
            const enabled = this.isModuleEnabled(module);
            this.originalConsole.log(`${module}: ${enabled ? '✅' : '❌'}`);
        });
        this.originalConsole.groupEnd();
    }
}

// Instanciar globalmente
window.debugManager = new DebugManager();

// Aliases para compatibilidade
window.dlog = {
    error: (module, ...args) => window.debugManager.error(module, ...args),
    warn: (module, ...args) => window.debugManager.warn(module, ...args),
    info: (module, ...args) => window.debugManager.info(module, ...args),
    debug: (module, ...args) => window.debugManager.debug(module, ...args),
    trace: (module, ...args) => window.debugManager.trace(module, ...args)
};

console.log('🔧 DebugManager carregado - Integrado com ConfigManager');