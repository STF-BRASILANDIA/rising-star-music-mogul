/**
 * Rising Star: Music Mogul - Game Engine
 * Motor principal do jogo, coordena todos os sistemas
 */

import { AISimulation } from './ai-simulation.js';
import { DataManager } from './data-manager.js';
import { CharacterCreator } from '../ui/character-creator.js';
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
            characterCreator: null,
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
            await this.initializeSystems();
            await this.loadGameData();
            this.setupEventListeners();
            this.startGameLoop();
            
            console.log('✅ Jogo inicializado com sucesso');
            
            // Aguardar um pouco para que a animação de loading seja vista
            setTimeout(() => {
                console.log('🎯 Timeout executado - mostrando menu principal');
                this.showMainMenu();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar o jogo:', error);
            this.showError('Erro ao carregar o jogo. Recarregue a página.');
        }
    }
    
    async initializeSystems() {
        // Inicializar gerenciador de dados primeiro
        this.systems.dataManager = new DataManager();
        await this.systems.dataManager.init();
        
        // Inicializar sistema de IA
        this.systems.aiSimulation = new AISimulation(this);
        
        // Inicializar outros sistemas básicos
        this.systems.characterCreator = new CharacterCreator(this);
        console.log('✅ CharacterCreator inicializado');
        
        this.systems.interfaceManager = new InterfaceManager(this);
        console.log('✅ InterfaceManager inicializado');
        
        this.systems.mainMenu = new MainMenu(this);
        console.log('✅ MainMenu inicializado');
        
        // Make main menu globally available
        window.mainMenu = this.systems.mainMenu;
        
        // Outros sistemas serão inicializados conforme necessário
        console.log('✅ Sistemas básicos inicializados');
    }
    
    async loadGameData() {
        // Carregar dados estáticos
        const [artistsData, labelsData] = await Promise.all([
            this.systems.dataManager.loadStaticData('artists'),
            this.systems.dataManager.loadStaticData('labels')
        ]);
        
        this.gameData.artists = artistsData;
        this.gameData.labels = labelsData;
        
        // Tentar carregar save game
        const saveData = await this.systems.dataManager.loadGame();
        if (saveData) {
            this.loadSaveData(saveData);
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
        
        // Atualizar sistemas
        this.systems.aiSimulation.update(deltaTime);
        this.systems.industrySimulation.update(deltaTime);
        this.systems.socialSystem.update(deltaTime);
        this.systems.interfaceManager.update(deltaTime);
        
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
            this.systems.industrySimulation.generateWeeklyCharts();
        }
        
        // Eventos mensais (dia 1)
        if (dayOfMonth === 1) {
            this.systems.aiSimulation.generateMonthlyTrends();
            this.systems.careerManagement.processMonthlyEarnings();
        }
    }
    
    processEvents() {
        while (this.gameData.events.length > 0) {
            const event = this.gameData.events.shift();
            this.handleGameEvent(event);
        }
    }
    
    handleGameEvent(event) {
        switch (event.type) {
            case 'song_released':
                this.systems.industrySimulation.processSongRelease(event.data);
                break;
                
            case 'collaboration_offer':
                this.systems.interfaceManager.showCollaborationOffer(event.data);
                break;
                
            case 'label_interest':
                this.systems.careerManagement.processLabelInterest(event.data);
                break;
                
            case 'media_attention':
                this.systems.socialSystem.processMediaAttention(event.data);
                break;
                
            case 'award_nomination':
                this.systems.interfaceManager.showAwardNomination(event.data);
                break;
                
            default:
                console.log('Evento não reconhecido:', event.type);
        }
    }
    
    showMainMenu() {
        console.log('🎯 showMainMenu() chamado');
        this.gameState = 'main_menu';
        this.hideLoadingScreen();
        
        // Debug: verificar se o sistema existe
        if (!this.systems.mainMenu) {
            console.error('❌ MainMenu não inicializado!');
            return;
        }
        
        console.log('📋 Mostrando menu principal...');
        this.systems.mainMenu.show();
    }
    
    showCharacterCreation() {
        this.gameState = 'character_creation';
        this.systems.mainMenu.hide();
        this.systems.characterCreator.show();
    }
    
    startGame(playerData) {
        this.gameState = 'playing';
        this.gameData.player = playerData;
        
        // Inicializar player no mundo
        this.systems.aiSimulation.initializePlayer(playerData);
        this.systems.careerManagement.initializeCareer(playerData);
        
        // Esconder telas anteriores e mostrar interface principal
        this.systems.mainMenu.hide();
        this.systems.characterCreator.hide();
        this.systems.interfaceManager.showMainInterface();
        
        // Gerar eventos iniciais
        this.systems.aiSimulation.generateInitialEvents();
        
        console.log('🎮 Jogo iniciado para:', playerData.artistName);
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
                aiSimulation: this.systems.aiSimulation.getState(),
                careerManagement: this.systems.careerManagement.getState(),
                socialSystem: this.systems.socialSystem.getState(),
                industrySimulation: this.systems.industrySimulation.getState()
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
            this.systems.dataManager.startAutoSave(2); // Auto-save every 2 minutes
        } else if (!settings.autoSaveEnabled && this.autoSaveInterval) {
            this.systems.dataManager.stopAutoSave();
        }
        
        // Apply difficulty settings
        if (this.systems.aiSimulation) {
            this.systems.aiSimulation.setDifficulty(settings.difficulty);
        }
        
        console.log('⚙️ Configurações aplicadas:', settings);
    }
}
