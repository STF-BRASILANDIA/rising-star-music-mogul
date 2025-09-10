/**
 * Rising Star: Music Mogul - Main Menu Manager
 * Gerenciador do menu principal
 */

export class MainMenu {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.settings = this.loadSettings();
        this.savedGames = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSavedGames();
        this.applySettings();
        this.updateSyncStatus();

        // Aplicar imediatamente offset salvo (defesa extra contra timing)
        if (typeof this.settings.safeAreaOffset === 'number') {
            document.documentElement.style.setProperty('--safe-area-extra-top', this.settings.safeAreaOffset + 'px');
        }
        
        // Update sync status periodically
        setInterval(() => {
            this.updateSyncStatus();
        }, 5000);
    }
    
    show() {
        console.log('🎯 MainMenu.show() chamado');
        const mainMenuElement = document.getElementById('mainMenu');
        console.log('📋 Elemento mainMenu:', mainMenuElement);
        
        if (mainMenuElement) {
            mainMenuElement.style.display = 'block';
            console.log('✅ Menu principal exibido');
            this.updateSavedGamesList();
        } else {
            console.error('❌ Elemento #mainMenu não encontrado no DOM!');
        }
    }
    
    hide() {
        const mainMenuElement = document.getElementById('mainMenu');
        if (mainMenuElement) {
            mainMenuElement.style.display = 'none';
        }
    }
    
    bindEvents() {
        // Main menu buttons - adicionando suporte touch para mobile
        const newGameBtn = document.getElementById('newGameBtn');
        if (newGameBtn) {
            console.log('📱 Binding events to newGameBtn:', newGameBtn);
            
            // Função de clique melhorada para mobile
            const handleNewGame = (e) => {
                console.log('📱 Starting new game...');
                e.preventDefault();
                e.stopPropagation();
                this.startNewGame();
            };
            
            newGameBtn.addEventListener('click', handleNewGame);
            newGameBtn.addEventListener('touchstart', (e) => {
                console.log('📱 newGameBtn touchstart event triggered');
                e.preventDefault();
                e.stopPropagation();
                this.startNewGame();
            });
        } else {
            console.error('❌ newGameBtn element not found!');
        }
        
        const loadGameBtn = document.getElementById('loadGameBtn');
        if (loadGameBtn) {
            loadGameBtn.addEventListener('click', () => this.showLoadGameModal());
            loadGameBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showLoadGameModal();
            });
        }
        
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
            settingsBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showSettings();
            });
        }
        
        const creditsBtn = document.getElementById('creditsBtn');
        if (creditsBtn) {
            creditsBtn.addEventListener('click', () => this.showCredits());
            creditsBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showCredits();
            });
        }
        
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
            helpBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showHelp();
            });
        }
        
        const storageInfoBtn = document.getElementById('storageInfoBtn');
        if (storageInfoBtn) {
            storageInfoBtn.addEventListener('click', () => this.showStorageInfo());
            storageInfoBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showStorageInfo();
            });
        }
        
        // Botão de teste do dashboard
        const testDashboardBtn = document.getElementById('testDashboardBtn');
        if (testDashboardBtn) {
            testDashboardBtn.addEventListener('click', () => this.testDashboard());
            testDashboardBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.testDashboard();
            });
        }
        
        // Load Game modal
        document.getElementById('closeLoadGameBtn')?.addEventListener('click', () => {
            this.hideLoadGameModal();
        });
        
        document.getElementById('closeLoadGameFooterBtn')?.addEventListener('click', () => {
            this.hideLoadGameModal();
        });
        
        document.getElementById('loadGameModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideLoadGameModal();
            }
        });
        
        // Settings modal
        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
            this.hideSettings();
        });
        
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => {
            this.resetSettings();
        });
        
        // Close modal on background click
        document.getElementById('settingsModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideSettings();
            }
        });
        
        // Help Modal Events
        document.getElementById('closeHelpBtn')?.addEventListener('click', () => {
            this.hideHelp();
        });
        
        document.getElementById('closeHelpFooterBtn')?.addEventListener('click', () => {
            this.hideHelp();
        });
        
        document.getElementById('helpModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideHelp();
            }
        });
        
        // Credits Modal Events
        document.getElementById('closeCreditsBtn')?.addEventListener('click', () => {
            this.hideCredits();
        });
        
        document.getElementById('closeCreditsFooterBtn')?.addEventListener('click', () => {
            this.hideCredits();
        });
        
        document.getElementById('creditsModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideCredits();
            }
        });
        
        // Storage Modal Events
        document.getElementById('closeStorageBtn')?.addEventListener('click', () => {
            this.hideStorageInfo();
        });
        
        document.getElementById('closeStorageFooterBtn')?.addEventListener('click', () => {
            this.hideStorageInfo();
        });
        
        document.getElementById('exportDataBtn')?.addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('importDataBtn')?.addEventListener('click', () => {
            this.importData();
        });
        
        document.getElementById('clearDataBtn')?.addEventListener('click', () => {
            this.clearAllData();
        });
        
        document.getElementById('storageModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideStorageInfo();
            }
        });
        
        // Sistema global de fechamento de modais com ESC
        this.setupGlobalKeyboardShortcuts();

        // Live update para safeAreaOffset (mover interface para baixo em dispositivos com notch)
        const safeAreaInput = document.getElementById('safeAreaOffset');
        if (safeAreaInput) {
            safeAreaInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value || '0');
                document.documentElement.style.setProperty('--safe-area-extra-top', val + 'px');
                // Atualizar configuração em memória para salvar depois
                if (typeof this.settings === 'object') {
                    this.settings.safeAreaOffset = val;
                }
                // Persistir imediatamente para não perder ajuste caso usuário feche modal
                try {
                    const current = JSON.parse(localStorage.getItem('risingstar_settings') || '{}');
                    localStorage.setItem('risingstar_settings', JSON.stringify({ ...current, safeAreaOffset: val }));
                } catch (err) {
                    console.warn('Não foi possível salvar safeAreaOffset imediatamente', err);
                }
            });
        }
    }
    
    setupGlobalKeyboardShortcuts() {
        // Remove listener anterior se existir
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        
        // Criar novo handler
        this.keydownHandler = (e) => {
            // ESC - Fechar modais
            if (e.key === 'Escape') {
                this.closeAnyOpenModal();
            }
            
            // Teclas de atalho adicionais (apenas se nenhum modal estiver aberto)
            if (!this.isAnyModalOpen()) {
                switch(e.key) {
                    case 'n':
                    case 'N':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.startNewGame();
                        }
                        break;
                    case 'l':
                    case 'L':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.showSavedGames();
                        }
                        break;
                    case ',':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.showSettings();
                        }
                        break;
                    case 'h':
                    case 'H':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.showHelp();
                        }
                        break;
                    case 'F1':
                        e.preventDefault();
                        this.showHelp();
                        break;
                }
            }
        };
        
        // Adicionar listener
        document.addEventListener('keydown', this.keydownHandler);
    }
    
    isAnyModalOpen() {
        const modals = ['settingsModal', 'helpModal', 'creditsModal', 'storageModal'];
        return modals.some(modalId => {
            const element = document.getElementById(modalId);
            return element && (element.classList.contains('show') || element.style.display === 'flex');
        });
    }
    
    closeAnyOpenModal() {
        // Lista todos os modais do jogo
        const modals = [
            { id: 'settingsModal', closeMethod: () => this.hideSettings() },
            { id: 'helpModal', closeMethod: () => this.hideHelp() },
            { id: 'creditsModal', closeMethod: () => this.hideCredits() },
            { id: 'storageModal', closeMethod: () => this.hideStorageInfo() }
        ];
        
        // Verifica qual modal está aberto e fecha
        for (const modal of modals) {
            const element = document.getElementById(modal.id);
            if (element && (element.classList.contains('show') || element.style.display === 'flex')) {
                console.log(`🎯 Fechando modal: ${modal.id}`);
                modal.closeMethod();
                return; // Fecha apenas um modal por vez
            }
        }
        
        // Verifica se a lista de saves está aberta
        const savedGamesList = document.getElementById('savedGamesList');
        if (savedGamesList && savedGamesList.style.display === 'block') {
            console.log('🎯 Fechando lista de saves');
            this.hideSavedGames();
            return;
        }
        
        console.log('🎯 Nenhum modal aberto para fechar');
    }
    
    startNewGame() {
        console.log('🎵 Iniciando novo jogo - redirecionando para criação de personagem');
        console.log('📋 GameEngine exists:', !!this.gameEngine);
        console.log('📋 showCharacterCreation function exists:', typeof this.gameEngine?.showCharacterCreation);
        
        if (this.gameEngine && typeof this.gameEngine.showCharacterCreation === 'function') {
            try {
                this.gameEngine.showCharacterCreation();
                console.log('✅ Character creation called successfully');
            } catch (error) {
                console.error('❌ Error calling showCharacterCreation:', error);
            }
        } else {
            console.error('❌ GameEngine or showCharacterCreation not available');
        }
    }
    
    showLoadGameModal() {
        const modal = document.getElementById('loadGameModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
            this.updateSavedGamesList();
        }
    }
    
    hideLoadGameModal() {
        const modal = document.getElementById('loadGameModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    showSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
            this.populateSettingsForm();
        }
    }
    
    hideSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    showCredits() {
        const modal = document.getElementById('creditsModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
        }
    }
    
    hideCredits() {
        const modal = document.getElementById('creditsModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    showHelp() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
        }
    }
    
    hideHelp() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    showStorageInfo() {
        const modal = document.getElementById('storageModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
            this.updateStorageInfo();
        }
    }
    
    hideStorageInfo() {
        const modal = document.getElementById('storageModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    async updateStorageInfo() {
        try {
            // Calculate storage usage
            const usedStorage = await this.calculateStorageUsage();
            const availableStorage = await this.getAvailableStorage();
            const totalSaves = this.savedGames.length;
            
            // Update UI elements
            const usedElement = document.getElementById('usedStorage');
            const availableElement = document.getElementById('availableStorage');
            const totalSavesElement = document.getElementById('totalSaves');
            
            if (usedElement) usedElement.textContent = this.formatBytes(usedStorage);
            if (availableElement) availableElement.textContent = this.formatBytes(availableStorage);
            if (totalSavesElement) totalSavesElement.textContent = totalSaves.toString();
            
        } catch (error) {
            console.warn('Erro ao calcular informações de armazenamento:', error);
        }
    }
    
    async calculateStorageUsage() {
        try {
            let totalSize = 0;
            
            // Calculate localStorage size
            const localStorageSize = JSON.stringify(localStorage).length;
            totalSize += localStorageSize;
            
            // Calculate IndexedDB size (approximation)
            if (this.gameEngine?.systems?.dataManager) {
                const saves = await this.gameEngine.systems.dataManager.getSavedGames();
                const savesSize = JSON.stringify(saves).length;
                totalSize += savesSize;
            }
            
            return totalSize;
        } catch (error) {
            console.warn('Erro ao calcular uso de armazenamento:', error);
            return 0;
        }
    }
    
    async getAvailableStorage() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                return estimate.quota - estimate.usage;
            }
            // Fallback estimate
            return 50 * 1024 * 1024; // 50MB
        } catch (error) {
            console.warn('Erro ao calcular armazenamento disponível:', error);
            return 0;
        }
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    exportData() {
        try {
            const data = {
                saves: this.savedGames,
                settings: this.settings,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rising-star-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Dados exportados com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            alert('Erro ao exportar dados. Tente novamente.');
        }
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                if (!file) return;
                
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Validate data structure
                if (!data.saves || !data.settings || !data.version) {
                    throw new Error('Arquivo de backup inválido');
                }
                
                // Confirm import
                if (!confirm('Importar dados irá sobrescrever todos os dados atuais. Continuar?')) {
                    return;
                }
                
                // Import data
                this.savedGames = data.saves;
                this.settings = data.settings;
                
                // Save to storage
                if (this.gameEngine?.systems?.dataManager) {
                    await this.gameEngine.systems.dataManager.importData(data);
                }
                
                // Apply settings
                this.applySettings();
                this.updateSavedGamesList();
                this.updateStorageInfo();
                
                alert('Dados importados com sucesso!');
                this.hideStorageInfo();
                
            } catch (error) {
                console.error('Erro ao importar dados:', error);
                alert('Erro ao importar dados. Verifique se o arquivo é válido.');
            }
        };
        
        input.click();
    }
    
    clearAllData() {
        if (!confirm('⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados salvos permanentemente!\n\nIsso inclui:\n- Todos os jogos salvos\n- Configurações\n- Progresso\n\nEsta ação NÃO pode ser desfeita.\n\nTem certeza que deseja continuar?')) {
            return;
        }
        
        if (!confirm('Última confirmação: Apagar TODOS os dados?')) {
            return;
        }
        
        try {
            // Clear localStorage
            localStorage.clear();
            
            // Clear IndexedDB
            if (this.gameEngine?.systems?.dataManager) {
                this.gameEngine.systems.dataManager.clearAllData();
            }
            
            // Reset local data
            this.savedGames = [];
            this.settings = this.getDefaultSettings();
            
            // Update UI
            this.applySettings();
            this.updateSavedGamesList();
            this.updateStorageInfo();
            
            alert('Todos os dados foram apagados com sucesso.');
            this.hideStorageInfo();
            
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            alert('Erro ao limpar dados. Alguns dados podem não ter sido removidos.');
        }
    }
    
    getDefaultSettings() {
        return {
            masterVolume: 75,
            musicVolume: 60,
            sfxVolume: 80,
            animationsEnabled: true,
            notificationsEnabled: true,
            uiScale: 1.0,
            autoSaveEnabled: true,
            difficulty: 'normal'
        };
    }
    
    async loadSavedGames() {
        try {
            const saves = await this.gameEngine.systems.dataManager.getSavedGames();
            this.savedGames = saves || [];
        } catch (error) {
            console.warn('Erro ao carregar saves:', error);
            this.savedGames = [];
        }
    }
    
    updateSavedGamesList() {
        const container = document.getElementById('savesContainer');
        const emptySaves = document.getElementById('emptySaves');
        if (!container) return;
        
        if (this.savedGames.length === 0) {
            container.style.display = 'none';
            if (emptySaves) emptySaves.style.display = 'block';
            return;
        }
        
        container.style.display = 'grid';
        if (emptySaves) emptySaves.style.display = 'none';
        
        container.innerHTML = this.savedGames.map((save, index) => `
            <div class="save-slot" data-save-id="${save.id}">
                <div class="save-info">
                    <h4>${save.playerName || 'Artista Desconhecido'}</h4>
                    <p>Nível ${save.level || 1} • ${save.genre || 'Gênero'} • ${this.formatDate(save.lastPlayed)}</p>
                    <p style="font-size: 0.85rem; opacity: 0.8;">
                        💰 $${this.formatNumber(save.money || 0)} • 
                        👥 ${this.formatNumber(save.fans || 0)} fãs
                    </p>
                </div>
                <div class="save-actions">
                    <button onclick="mainMenu.loadGame('${save.id}')" title="Carregar Jogo">
                        ▶️ Carregar
                    </button>
                    <button class="delete-btn" onclick="mainMenu.deleteSave('${save.id}')" title="Deletar Save">
                        🗑️ Deletar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    async loadGame(saveId) {
        try {
            const success = await this.gameEngine.loadGame(saveId);
            if (success) {
                this.hideLoadGameModal(); // Fechar o modal
                this.hide(); // Esconder menu principal
                console.log('Jogo carregado com sucesso!');
            } else {
                alert('Erro ao carregar o jogo. O arquivo pode estar corrompido.');
            }
        } catch (error) {
            console.error('Erro ao carregar jogo:', error);
            alert('Erro ao carregar o jogo.');
        }
    }
    
    async deleteSave(saveId) {
        if (confirm('Tem certeza que deseja deletar este save? Esta ação não pode ser desfeita.')) {
            try {
                await this.gameEngine.systems.dataManager.deleteSave(saveId);
                await this.loadSavedGames();
                this.updateSavedGamesList();
                console.log('Save deletado com sucesso');
            } catch (error) {
                console.error('Erro ao deletar save:', error);
                alert('Erro ao deletar o save.');
            }
        }
    }
    
    loadSettings() {
        const defaultSettings = {
            animationsEnabled: true,
            notificationsEnabled: true,
            uiScale: 1.0,
            autoSaveEnabled: true,
            autoSaveInterval: 2, // em minutos
            fastModeEnabled: false,
            cloudSyncEnabled: false,
            analyticsEnabled: true,
            safeAreaOffset: 0
        };
        
        try {
            const saved = localStorage.getItem('risingstar_settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.warn('Erro ao carregar configurações:', error);
            return defaultSettings;
        }
    }
    
    saveSettings() {
        try {
            const settings = {
                animationsEnabled: document.getElementById('animationsEnabled').checked,
                notificationsEnabled: document.getElementById('notificationsEnabled').checked,
                uiScale: parseFloat(document.getElementById('uiScale').value),
                autoSaveEnabled: document.getElementById('autoSaveEnabled').checked,
                autoSaveInterval: parseInt(document.getElementById('autoSaveInterval').value),
                fastModeEnabled: document.getElementById('fastModeEnabled').checked,
                cloudSyncEnabled: document.getElementById('cloudSyncEnabled').checked,
                analyticsEnabled: document.getElementById('analyticsEnabled').checked,
                safeAreaOffset: parseInt(document.getElementById('safeAreaOffset')?.value || '0')
            };
            
            localStorage.setItem('risingstar_settings', JSON.stringify(settings));
            this.settings = settings;
            this.applySettings();
            this.hideSettings();
            
            // Show confirmation
            this.showNotification('Configurações salvas com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            alert('Erro ao salvar configurações.');
        }
    }
    
    resetSettings() {
        if (confirm('Restaurar todas as configurações para os valores padrão?')) {
            this.settings = this.loadSettings();
            this.populateSettingsForm();
            this.showNotification('Configurações restauradas!', 'info');
        }
    }
    
    populateSettingsForm() {
    const animationsEl = document.getElementById('animationsEnabled');
    if (animationsEl) animationsEl.checked = this.settings.animationsEnabled;
    const notifEl = document.getElementById('notificationsEnabled');
    if (notifEl) notifEl.checked = this.settings.notificationsEnabled;
    const scaleEl = document.getElementById('uiScale');
    if (scaleEl) scaleEl.value = this.settings.uiScale;
    const autoSaveEl = document.getElementById('autoSaveEnabled');
    if (autoSaveEl) autoSaveEl.checked = this.settings.autoSaveEnabled;
        
        // Novos campos
        if (document.getElementById('autoSaveInterval')) {
            document.getElementById('autoSaveInterval').value = this.settings.autoSaveInterval || '2';
        }
        if (document.getElementById('fastModeEnabled')) {
            document.getElementById('fastModeEnabled').checked = this.settings.fastModeEnabled || false;
        }
        if (document.getElementById('cloudSyncEnabled')) {
            document.getElementById('cloudSyncEnabled').checked = this.settings.cloudSyncEnabled || false;
        }
        if (document.getElementById('analyticsEnabled')) {
            document.getElementById('analyticsEnabled').checked = this.settings.analyticsEnabled !== false; // true por padrão
        }
        if (document.getElementById('safeAreaOffset')) {
            document.getElementById('safeAreaOffset').value = this.settings.safeAreaOffset || 0;
            const valLabel = document.getElementById('safeAreaValue');
            if (valLabel) valLabel.textContent = (this.settings.safeAreaOffset || 0) + 'px';
        }
    }
    
    applySettings() {
        // Apply UI scale
        document.documentElement.style.fontSize = `${this.settings.uiScale}rem`;
        
        // Apply animations setting
        if (!this.settings.animationsEnabled) {
            document.documentElement.style.setProperty('--transition', 'none');
            document.documentElement.style.setProperty('--transition-fast', 'none');
        } else {
            document.documentElement.style.removeProperty('--transition');
            document.documentElement.style.removeProperty('--transition-fast');
        }
        
        // Notify game engine about settings
        if (this.gameEngine && this.gameEngine.applySettings) {
            this.gameEngine.applySettings(this.settings);
        }

        // Apply safe area offset as CSS variable
        if (typeof this.settings.safeAreaOffset === 'number') {
            document.documentElement.style.setProperty('--safe-area-extra-top', this.settings.safeAreaOffset + 'px');
        }
    }
    
    showNotification(message, type = 'info', duration = 4000) {
        try {
            if (window.game?.systems?.interfaceManager?.showNotification) {
                window.game.systems.interfaceManager.showNotification({ message, type, duration });
                return;
            }
        } catch (e) {
            console.warn('⚠️ Delegação de notificação (main-menu) falhou', e);
        }
        // Fallback mínimo se interfaceManager não existir ainda
        const c = document.getElementById('notificationContainer') || (() => {
            const div = document.createElement('div');
            div.id = 'notificationContainer';
            div.className = 'notification-container';
            document.body.appendChild(div);
            return div;
        })();
        const el = document.createElement('div');
        el.className = `notification notification-${type} show`;
        el.textContent = message;
        c.appendChild(el);
        setTimeout(()=> el.remove(), duration);
    }
    
    formatDate(timestamp) {
        try {
            return new Date(timestamp).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Data inválida';
        }
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    updateSyncStatus() {
        const container = document.getElementById('syncStatus');
        const text = document.getElementById('statusText');
        if (!container || !text) return;

        const status = this.gameEngine.systems.dataManager.getFirebaseStatus();
        container.classList.remove('disconnected','connecting','connected');

        if (status.connected && status.authenticated) {
            container.classList.add('connected');
            text.textContent = 'Online';
        } else if (status.connected && !status.authenticated) {
            container.classList.add('connecting');
            text.textContent = 'Conectando...';
        } else {
            container.classList.add('disconnected');
            text.textContent = 'Offline';
        }
    }
    
    startNewGame() {
        console.log('🎮 Starting new game - opening character creation');
        
        // Esconder o menu principal
        this.hide();
        
        // Mostrar a interface de criação de personagem
        const characterCreation = document.getElementById('characterCreation');
        if (characterCreation) {
            characterCreation.style.display = 'flex';
            console.log('✅ Character creation interface shown');
            
            // Inicializar character creator se não existir
            if (!window.characterCreator) {
                console.log('📝 Initializing character creator...');
                // O CharacterCreator será inicializado pelo script principal
                setTimeout(() => {
                    if (window.characterCreator) {
                        window.characterCreator.showStep(1);
                        console.log('✅ Character creator initialized and step 1 shown');
                    } else {
                        console.error('❌ Character creator not available');
                    }
                }, 100);
            } else {
                window.characterCreator.showStep(1);
                console.log('✅ Character creator step 1 shown');
            }
        } else {
            console.error('❌ Character creation element not found');
        }
    }
    
    testDashboard() {
        console.log('🧪 Testando Dashboard...');
        
        try {
            // Esconder outras telas
            this.hide();
            const characterCreation = document.getElementById('characterCreation');
            if (characterCreation) characterCreation.style.display = 'none';
            
            // Mostrar gameInterface
            const dashboard = document.getElementById('gameInterface');
            if (dashboard) {
                dashboard.style.display = 'block';
                console.log('✅ Dashboard visível');
                
                // Criar dados fake de jogador para teste
                if (!window.game) {
                    window.game = {
                        gameData: {
                            player: {
                                artistName: 'Artista Teste',
                                name: 'João Silva',
                                role: 'Cantor(a)',
                                genre: 'R&B',
                                fame: 15420,
                                monthlyListeners: 89350,
                                money: 25600,
                                creativity: 75,
                                energy: 85,
                                morale: 90,
                                careerLevel: 2,
                                careerXP: 350,
                                careerNextXP: 500
                            }
                        }
                    };
                }
                
                // Inicializar GameHub se disponível
                if (typeof window.initGameHub === 'function') {
                    window.initGameHub();
                    if (window.gameHub) {
                        window.gameHub.show();
                        console.log('✅ GameHub ativado com dados de teste');
                        this.showNotification('Dashboard teste ativado!', 'success');
                    }
                } else {
                    console.log('⚠️ initGameHub não disponível, mostrando apenas HTML');
                    this.showNotification('Dashboard HTML ativo (sem JavaScript)', 'info');
                }
            } else {
                console.error('❌ gameInterface não encontrado');
                this.showNotification('Erro: gameInterface não encontrado', 'error');
            }
        } catch (err) {
            console.error('❌ Erro ao testar dashboard:', err);
            this.showNotification('Erro ao testar dashboard: ' + err.message, 'error');
        }
    }
    
    // Método de limpeza para evitar vazamentos de memória
    destroy() {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        console.log('🧹 MainMenu destruído e event listeners removidos');
    }
}

// Make MainMenu globally available for onclick handlers
window.mainMenu = null;
