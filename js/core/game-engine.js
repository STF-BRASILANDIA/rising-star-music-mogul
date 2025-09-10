/**
 * Rising Star: Music Mogul - Game Engine
 * Motor principal do jogo, coordena todos os sistemas
 */

import { AISimulation } from './ai-simulation.js';
import { DataManager } from './data-manager.js';
import { MusicCreation } from './music-creation.js';
import { InterfaceManager } from '../ui/interface-manager.js';
import { MainMenu } from '../ui/main-menu.js';

export class RisingStarGame {
    constructor() {
        this.version = '1.0.0';
        this.gameState = 'loading';
        this.currentDate = new Date(2024, 0, 1); // Inicia em Janeiro 2024
        this.gameSpeed = 1; // 1 = normal, 2 = 2x, etc.
        this.autosaveInterval = 30000; // 30 segundos
        
        this.systems = {
            dataManager: null,
            aiSimulation: null,
            characterCreator: null, // REATIVADO
            interfaceManager: null,
            mainMenu: null,
            musicCreation: null,
            careerManagement: null,
            socialSystem: null,
            industrySimulation: null
        };
        
        this.gameData = {
            player: null,
            artists: {},
            labels: {},
            songs: {},
            albums: {},
            charts: {},
            events: [],
            news: [],
            trends: {}
        };
        
        this.gameLoop = null;
        this.lastUpdate = Date.now();
        
        this.init();
    }
    
    async init() {
        console.log('🎵 Iniciando Rising Star: Music Mogul v' + this.version);
        
        try {
            // Inicializar sistemas em ordem
            // Helper: promise with timeout to avoid hanging initialization
            const promiseWithTimeout = (p, ms, name) => {
                return new Promise(async (resolve, reject) => {
                    let finished = false;
                    p.then((res) => { finished = true; resolve(res); }).catch(err => { finished = true; reject(err); });
                    setTimeout(() => {
                        if (!finished) {
                            console.warn(`⚠️ ${name} timeout after ${ms}ms`);
                            resolve(null); // resolve so we continue in degraded mode
                        }
                    }, ms);
                });
            };

            await promiseWithTimeout(this.initializeSystems(), 5000, 'initializeSystems');
            await promiseWithTimeout(this.loadGameData(), 5000, 'loadGameData');
            this.setupEventListeners();
            this.startGameLoop();
            
            console.log('✅ Jogo inicializado com sucesso');
            
            // Mostrar menu principal assim que sistemas estejam prontos (delay reduzido)
            setTimeout(() => {
                try {
                    if (this.systems.mainMenu) {
                        console.log('🎯 Exibindo menu principal (init concluído)');
                        this.showMainMenu();
                    } else {
                        console.warn('⚠️ mainMenu ainda não disponível após init');
                    }
                } catch (err) {
                    console.error('❌ Falha ao mostrar menu principal pós-init:', err);
                }
            }, 600); // 600ms para permitir pequena animação de loading
            
        } catch (error) {
            console.error('❌ Erro ao inicializar o jogo:', error);
            this.showError('Erro ao carregar o jogo. Recarregue a página.');
        }
    }
    
    async initializeSystems() {
        console.log('🔧 initializeSystems: starting');

        // Inicializar gerenciador de dados primeiro
        try {
            console.log('🔧 initializeSystems: initializing DataManager');
            this.systems.dataManager = new DataManager();
            await this.systems.dataManager.init();
            console.log('✅ DataManager initialized');
        } catch (err) {
            console.error('❌ initializeSystems: DataManager failed:', err);
            this.systems.dataManager = null;
        }

        // Inicializar sistema de IA
        try {
            console.log('🔧 initializeSystems: initializing AISimulation');
            this.systems.aiSimulation = new AISimulation(this);
            console.log('✅ AISimulation initialized');
        } catch (err) {
            console.error('❌ initializeSystems: AISimulation failed:', err);
            this.systems.aiSimulation = null;
        }

        // Inicializar sistema de criação musical
        try {
            console.log('🔧 initializeSystems: initializing MusicCreation');
            this.systems.musicCreation = new MusicCreation(this);
            console.log('✅ MusicCreation initialized');
        } catch (err) {
            console.error('❌ initializeSystems: MusicCreation failed:', err);
            this.systems.musicCreation = null;
        }

        // Importar e inicializar sistema de criação de personagem
        try {
            console.log('🔧 initializeSystems: importing CharacterCreator module');
            const module = await import('../ui/character-creator.js');
            const { CharacterCreator } = module;
            console.log('🔧 initializeSystems: instantiating CharacterCreator');
            this.systems.characterCreator = new CharacterCreator(this);
            window.characterCreator = this.systems.characterCreator;
            console.log('✅ CharacterCreator initialized');
        } catch (err) {
            console.error('❌ initializeSystems: CharacterCreator failed to load/init:', err);
            this.systems.characterCreator = null;
        }

        // InterfaceManager
        try {
            console.log('🔧 initializeSystems: initializing InterfaceManager');
            this.systems.interfaceManager = new InterfaceManager(this);
            console.log('✅ InterfaceManager initialized');
        } catch (err) {
            console.error('❌ initializeSystems: InterfaceManager failed:', err);
            this.systems.interfaceManager = null;
        }

        // MainMenu
        try {
            console.log('🔧 initializeSystems: initializing MainMenu');
            this.systems.mainMenu = new MainMenu(this);
            window.mainMenu = this.systems.mainMenu;
            console.log('✅ MainMenu initialized');
        } catch (err) {
            console.error('❌ initializeSystems: MainMenu failed:', err);
            this.systems.mainMenu = null;
        }

        // GameHub (Dashboard)
        try {
            console.log('🔧 initializeSystems: importing GameHub module');
            if (typeof window.GameHub !== 'undefined') {
                console.log('🔧 initializeSystems: instantiating GameHub');
                this.systems.gameHub = new window.GameHub(this);
                window.gameHub = this.systems.gameHub;
                console.log('✅ GameHub initialized');
            } else {
                console.warn('⚠️ initializeSystems: GameHub class not available');
                this.systems.gameHub = null;
            }
        } catch (err) {
            console.error('❌ initializeSystems: GameHub failed:', err);
            this.systems.gameHub = null;
        }

        console.log('✅ initializeSystems: finished (some systems may be null if failed)');
    }
    
    async loadGameData() {
        console.log('🔄 loadGameData: starting');
        try {
            if (!this.systems.dataManager) {
                console.warn('⚠️ loadGameData: DataManager not available, skipping static data load');
                return;
            }

            console.log('🔄 loadGameData: loading static artists and labels');
            try {
                const [artistsData, labelsData] = await Promise.all([
                    this.systems.dataManager.loadStaticData('artists'),
                    this.systems.dataManager.loadStaticData('labels')
                ]);
                this.gameData.artists = artistsData || {};
                this.gameData.labels = labelsData || {};
                console.log('✅ loadGameData: static data loaded');
            } catch (err) {
                console.error('❌ loadGameData: failed to load static data:', err);
            }

            // Tentar carregar save game
            try {
                console.log('🔄 loadGameData: attempting to load saved game');
                const saveData = await this.systems.dataManager.loadGame();
                if (saveData) {
                    console.log('✅ loadGameData: save found - loading save data');
                    this.loadSaveData(saveData);
                } else {
                    console.log('ℹ️ loadGameData: no save found');
                }
            } catch (err) {
                console.error('❌ loadGameData: failed to load save data:', err);
            }
        } catch (err) {
            console.error('❌ loadGameData: unexpected error:', err);
        }
    }
    
    setupEventListeners() {
        // Eventos de interface
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.systems.interfaceManager.togglePauseMenu();
            }
        });
        
        // Auto-save
        setInterval(() => {
            if (this.gameState === 'playing') {
                this.autoSave();
            }
        }, this.autosaveInterval);
        
        // Visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseGame();
            } else {
                this.resumeGame();
            }
        });
    }
    
    startGameLoop() {
        const gameLoop = (timestamp) => {
            if (this.gameState === 'playing') {
                const deltaTime = timestamp - this.lastUpdate;
                this.update(deltaTime);
            }
            this.lastUpdate = timestamp;
            this.gameLoop = requestAnimationFrame(gameLoop);
        };
        
        this.gameLoop = requestAnimationFrame(gameLoop);
    }
    
    update(deltaTime) {
        // Atualizar tempo do jogo (1 segundo real = 1 dia no jogo por padrão)
        const gameTimeElapsed = (deltaTime * this.gameSpeed) / 1000;
        this.advanceGameTime(gameTimeElapsed);
        
        // Atualizar sistemas (apenas os que existem)
        if (this.systems.aiSimulation) {
            this.systems.aiSimulation.update(deltaTime);
        }
        
        if (this.systems.musicCreation) {
            this.systems.musicCreation.update(deltaTime);
        }
        
        if (this.systems.interfaceManager) {
            this.systems.interfaceManager.update(deltaTime);
        }
        
        // TODO: Implementar estes sistemas
        // this.systems.industrySimulation.update(deltaTime);
        // this.systems.socialSystem.update(deltaTime);
        
        // Processar eventos pendentes
        this.processEvents();
    }
    
    advanceGameTime(seconds) {
        const msToAdd = seconds * 1000 * 86400; // Converter para dias
        this.currentDate = new Date(this.currentDate.getTime() + msToAdd);
        
        // Trigger eventos baseados em tempo
        this.checkTimeBasedEvents();
    }
    
    checkTimeBasedEvents() {
        const dayOfWeek = this.currentDate.getDay();
        const dayOfMonth = this.currentDate.getDate();
        
        // Eventos semanais (toda sexta-feira)
        if (dayOfWeek === 5) {
            // TODO: Implementar sistema de charts
            console.log('📊 Gerando charts semanais...');
            // this.systems.industrySimulation.generateWeeklyCharts();
        }
        
        // Eventos mensais (dia 1)
        if (dayOfMonth === 1) {
            // TODO: Implementar sistemas mensais
            console.log('📅 Processando eventos mensais...');
            // this.systems.aiSimulation.generateMonthlyTrends();
            // this.systems.careerManagement.processMonthlyEarnings();
        }
    }
    
    processEvents() {
        while (this.gameData.events.length > 0) {
            const event = this.gameData.events.shift();
            this.handleGameEvent(event);
        }
    }
    
    handleGameEvent(event) {
        console.log('🎮 Processando evento:', event.type);
        
        switch (event.type) {
            case 'song_released':
                // TODO: Implementar processamento de lançamento
                console.log('🎵 Música lançada:', event.data?.title || 'Sem título');
                // this.systems.industrySimulation.processSongRelease(event.data);
                break;
                
            case 'collaboration_offer':
                if (this.systems.interfaceManager && this.systems.interfaceManager.showNotification) {
                    this.systems.interfaceManager.showNotification({
                        type: 'collaboration',
                        title: 'Oferta de Colaboração!',
                        message: `${event.data?.artist || 'Artista'} quer colaborar com você!`,
                        data: event.data
                    });
                } else {
                    console.log('🤝 Oferta de colaboração de:', event.data?.artist);
                }
                break;
                
            case 'label_interest':
                console.log('🏢 Interesse de gravadora:', event.data?.labelName || 'Gravadora');
                // TODO: Implementar sistema de gravadoras
                // this.systems.careerManagement.processLabelInterest(event.data);
                break;
                
            case 'media_attention':
                console.log('📺 Atenção da mídia:', event.data?.outlet || 'Mídia');
                // TODO: Implementar sistema social
                // this.systems.socialSystem.processMediaAttention(event.data);
                break;
                
            case 'award_nomination':
                if (this.systems.interfaceManager && this.systems.interfaceManager.showNotification) {
                    this.systems.interfaceManager.showNotification({
                        type: 'award',
                        title: 'Indicação para Prêmio!',
                        message: `Você foi indicado para ${event.data?.award || 'um prêmio'}!`,
                        data: event.data
                    });
                } else {
                    console.log('🏆 Indicação para prêmio:', event.data?.award);
                }
                break;
                
            default:
                console.log('Evento não reconhecido:', event.type);
        }
    }
    
    showMainMenu() {
        console.log('🎯 showMainMenu() chamado');
        if (this._mainMenuShown) {
            console.log('ℹ️ showMainMenu ignorado (já exibido)');
            return;
        }
        this.gameState = 'main_menu';
        this._mainMenuShown = true;
        // Chamar função global de hideLoadingScreen se disponível (definida em js/main.js)
        try {
            if (typeof hideLoadingScreen === 'function') {
                hideLoadingScreen();
            } else if (typeof window !== 'undefined' && typeof window.hideLoadingScreen === 'function') {
                window.hideLoadingScreen();
            }
        } catch (err) {
            console.warn('⚠️ hideLoadingScreen não pôde ser chamada:', err);
        }
        
        // Debug: verificar se o sistema existe
        if (!this.systems.mainMenu) {
            console.error('❌ MainMenu não inicializado!');
            return;
        }
        
        console.log('📋 Mostrando menu principal...');
        this.systems.mainMenu.show();
    }
    
    showCharacterCreation() {
        console.log('🎭 Mostrando criação de personagem...');
        
        if (!this.systems.characterCreator) {
            console.error('❌ CharacterCreator não inicializado!');
            return;
        }
        
        // Esconder menu principal
        if (this.systems.mainMenu) {
            this.systems.mainMenu.hide();
        }
        
        // Mostrar criação de personagem
        this.systems.characterCreator.show();
    }
    
    startGame(playerData) {
        console.log('🎮 Iniciando jogo para:', playerData.name || playerData.artistName);
        this.gameState = 'playing';
        
        // Adicionar dados padrão ao player
        this.gameData.player = {
            ...playerData,
            money: playerData.money || 10000, // $10k inicial
            energy: playerData.energy || 100,
            creativity: playerData.creativity || 100,
            mood: playerData.mood || 75,
            skills: playerData.skills || { // Use skills from character creation
                // Artist traits
                vocals: 1,
                songWriting: 1,
                rhythm: 1,
                charisma: 1,
                virality: 1,
                videoDirecting: 1,
                
                // Business traits
                leadership: 2,
                marketing: 2,
                negotiation: 2,
                recruiting: 2,
                sales: 2
            },
            stats: {
                totalSongs: 0,
                totalStreams: 0,
                totalRevenue: 0,
                fans: 100 // Começar com 100 fãs
            },
            discography: [],
            studioEquipment: 'basic',
            achievements: []
        };
        
        // Inicializar player no mundo (apenas sistemas que existem)
        if (this.systems.aiSimulation && this.systems.aiSimulation.initializePlayer) {
            this.systems.aiSimulation.initializePlayer(this.gameData.player);
        }
        
        // TODO: Implementar sistema de carreira
        // this.systems.careerManagement.initializeCareer(playerData);
        
        // Esconder telas anteriores e mostrar interface principal
        if (this.systems.mainMenu) {
            this.systems.mainMenu.hide();
        }
        
        if (this.systems.characterCreator) {
            this.systems.characterCreator.hide();
        }
        if (this.systems.interfaceManager) {
            this.systems.interfaceManager.showMainInterface();
        }
        
        // Gerar eventos iniciais
        if (this.systems.aiSimulation && this.systems.aiSimulation.generateInitialEvents) {
            this.systems.aiSimulation.generateInitialEvents();
        }
        
        console.log('✅ Jogo iniciado com sucesso!');
        console.log('💰 Dinheiro inicial:', this.gameData.player.money);
    console.log('� Habilidades:', this.gameData.player.skills);
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            console.log('⏸️ Jogo pausado');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            console.log('▶️ Jogo retomado');
        }
    }
    
    async saveGame() {
        const saveData = {
            version: this.version,
            timestamp: Date.now(),
            currentDate: this.currentDate.toISOString(),
            gameSpeed: this.gameSpeed,
            player: this.gameData.player,
            songs: this.gameData.songs,
            albums: this.gameData.albums,
            charts: this.gameData.charts,
            events: this.gameData.events,
            news: this.gameData.news,
            trends: this.gameData.trends,
            systemStates: {
                aiSimulation: this.systems.aiSimulation?.getState ? this.systems.aiSimulation.getState() : null,
                musicCreation: this.systems.musicCreation?.getState ? this.systems.musicCreation.getState() : null,
                // TODO: Implementar estes sistemas
                careerManagement: null, // this.systems.careerManagement.getState(),
                socialSystem: null, // this.systems.socialSystem.getState(),
                industrySimulation: null // this.systems.industrySimulation.getState()
            }
        };
        
        await this.systems.dataManager.saveGame(saveData);
        console.log('💾 Jogo salvo com sucesso');
        
        return saveData;
    }
    
    async autoSave() {
        try {
            await this.saveGame();
            this.systems.interfaceManager.showNotification('Jogo salvo automaticamente', 'success');
        } catch (error) {
            console.error('Erro no auto-save:', error);
        }
    }
    
    loadSaveData(saveData) {
        if (saveData.version !== this.version) {
            console.warn('⚠️ Versão do save diferente da atual');
        }
        
        this.currentDate = new Date(saveData.currentDate);
        this.gameSpeed = saveData.gameSpeed || 1;
        this.gameData.player = saveData.player;
        this.gameData.songs = saveData.songs || {};
        this.gameData.albums = saveData.albums || {};
        this.gameData.charts = saveData.charts || {};
        this.gameData.events = saveData.events || [];
        this.gameData.news = saveData.news || [];
        this.gameData.trends = saveData.trends || {};
        
        // Restaurar estados dos sistemas
        if (saveData.systemStates) {
            Object.keys(saveData.systemStates).forEach(systemName => {
                if (this.systems[systemName] && this.systems[systemName].setState) {
                    this.systems[systemName].setState(saveData.systemStates[systemName]);
                }
            });
        }
        
        console.log('📁 Save carregado com sucesso');
    }
    
    async loadGame(saveId) {
        try {
            // Get save data from DataManager
            const saveData = await this.systems.dataManager.loadSpecificSave(saveId);
            if (!saveData) {
                console.error('Save não encontrado:', saveId);
                return false;
            }
            
            // Load the save data
            this.loadSaveData(saveData.gameData);
            
            // Update game state and show main interface
            this.gameState = 'playing';
            this.systems.mainMenu.hide();
            this.systems.interfaceManager.showMainInterface();
            
            console.log('✅ Jogo carregado com sucesso:', saveId);
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao carregar jogo:', error);
            return false;
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h2>Erro</h2>
                <p>${message}</p>
                <button onclick="location.reload()">Recarregar</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }
    
    // ===== MÉTODOS DE MÚSICA =====
    
    // Criar nova música
    createSong(songData) {
        if (!this.systems.musicCreation) {
            console.error('Sistema de música não inicializado');
            return null;
        }
        return this.systems.musicCreation.createSong(songData);
    }
    
    // Obter música atual em produção
    getCurrentSong() {
        if (!this.systems.musicCreation) return null;
        return this.systems.musicCreation.getCurrentSong();
    }
    
    // Obter todas as músicas do player
    getPlayerSongs() {
        if (!this.systems.musicCreation) return [];
        return this.systems.musicCreation.getPlayerSongs();
    }
    
    // Lançar música
    releaseSong(songId) {
        if (!this.systems.musicCreation) return false;
        return this.systems.musicCreation.releaseSong(songId);
    }
    
    // Verificar se player tem dinheiro suficiente
    canAfford(amount) {
        return this.gameData.player && this.gameData.player.money >= amount;
    }
    
    // Gastar dinheiro
    spendMoney(amount, reason = '') {
        if (!this.gameData.player || this.gameData.player.money < amount) {
            console.warn('Dinheiro insuficiente:', amount);
            return false;
        }
        
        this.gameData.player.money -= amount;
        console.log(`💸 Gastou $${amount}${reason ? ' em ' + reason : ''}`);
        return true;
    }
    
    // Ganhar dinheiro
    earnMoney(amount, source = '') {
        if (!this.gameData.player) return false;
        
        this.gameData.player.money += amount;
        console.log(`💰 Ganhou $${amount}${source ? ' de ' + source : ''}`);
        return true;
    }
    
    // ===== FIM MÉTODOS DE MÚSICA =====
    
    // Métodos utilitários
    getFormattedDate() {
        return this.currentDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    addGameEvent(type, data, delay = 0) {
        const event = {
            id: this.generateId(),
            type,
            data,
            timestamp: Date.now() + delay
        };
        
        this.gameData.events.push(event);
        return event.id;
    }
    
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    // Getters
    getPlayer() {
        return this.gameData.player;
    }
    
    getArtists() {
        return this.gameData.artists;
    }
    
    getLabels() {
        return this.gameData.labels;
    }
    
    getCurrentDate() {
        return this.currentDate;
    }
    
    getGameSpeed() {
        return this.gameSpeed;
    }
    
    setGameSpeed(speed) {
        this.gameSpeed = Math.max(0.5, Math.min(5, speed));
    }
    
    isPlaying() {
        return this.gameState === 'playing';
    }
    
    isPaused() {
        return this.gameState === 'paused';
    }
    
    applySettings(settings) {
        // Apply game-related settings
        this.settings = settings;
        
        // Update auto-save based on settings
        if (settings.autoSaveEnabled && !this.autoSaveInterval) {
            const interval = settings.autoSaveInterval || 2; // Default 2 minutes
            this.systems.dataManager.startAutoSave(interval);
        } else if (!settings.autoSaveEnabled && this.autoSaveInterval) {
            this.systems.dataManager.stopAutoSave();
        }
        
        // Apply game speed if fast mode is enabled
        if (settings.fastModeEnabled) {
            this.gameSpeed = 2.0; // 2x speed
        } else {
            this.gameSpeed = 1.0; // Normal speed
        }
        
        // Difficulty is always normal (removed difficulty setting)
        if (this.systems.aiSimulation) {
            this.systems.aiSimulation.setDifficulty('normal');
        }
        
        console.log('⚙️ Configurações aplicadas:', settings);
    }

    // ================= SETTINGS / STATS STUBS =================
    getSettings() {
        return this.settings || {};
    }

    saveSettings(settings) {
        this.applySettings(settings);
        try {
            // Persist basic settings via DataManager if available
            if (this.systems.dataManager?.saveSetting) {
                Object.entries(settings).forEach(([k,v]) => {
                    this.systems.dataManager.saveSetting(k, v);
                });
            } else {
                localStorage.setItem('risingstar_game_settings', JSON.stringify(settings));
            }
            console.log('💾 Configurações de jogo salvas');
        } catch (err) {
            console.warn('Falha ao salvar configurações:', err);
        }
    }

    // Recent activities placeholder (to be replaced with real event log later)
    getRecentActivities(limit = 5) {
        if (!this._activityLog) this._activityLog = [];
        return this._activityLog.slice(-limit).reverse();
    }

    // Quick stats placeholder (derived later from real systems)
    getQuickStats() {
        return {
            todayEarnings: 0,
            weeklyStreams: 0,
            newFans: 0,
            currentTrend: 'N/A'
        };
    }
}
