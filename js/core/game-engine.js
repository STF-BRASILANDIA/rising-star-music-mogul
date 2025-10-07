/**
 * Rising Star: Music Mogul - Game Engine
 * Motor principal do jogo, coordena todos os sistemas
 */

import { AISimulation } from './ai-simulation.js';
import { DataManager } from './data-manager.js';
import { MusicCreation } from './music-creation.js';
import { StudioManager } from './studio-manager.js';
import { InterfaceManager } from '../ui/interface-manager.js';
import { MainMenu } from '../ui/main-menu.js';

export class RisingStarGame {
    constructor() {
        this.version = '1.0.0';
        this.gameState = 'loading';
    // Inicia em 1º de janeiro do ano atual para novos jogos
    this.currentDate = new Date(new Date().getFullYear(), 0, 1);
    this.gameSpeed = 1; // 1 = normal, 2 = 2x, etc.
    // Modo de atualizações semanais:
    // 'manual' = só processa ao acionar passWeek(); 'auto' = detecta no loop
    this.weeklyUpdatesMode = 'manual';
        this.autoSaveOnEvents = true; // Save baseado em eventos, não em tempo
        this.lastSaveHash = null; // Hash do último save para verificar integridade
        this.pendingActions = []; // Ações que precisam ser salvas
        
        this.systems = {
            dataManager: null,
            aiSimulation: null,
            characterCreator: null, // REATIVADO
            interfaceManager: null,
            mainMenu: null,
            musicCreation: null,
            studioManager: null,
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
            // Expor globalmente para módulos de UI desacoplados (ex.: menu-modals)
            try { window.dataManager = this.systems.dataManager; } catch (_) { /* ignore */ }
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

        // StudioManager
        try {
            console.log('🔧 initializeSystems: initializing StudioManager');
            this.systems.studioManager = new StudioManager(this);
            window.studioManager = this.systems.studioManager;
            window.StudioManager = this.systems.studioManager;
            console.log('✅ StudioManager initialized');
        } catch (err) {
            console.error('❌ initializeSystems: StudioManager failed:', err);
            this.systems.studioManager = null;
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
                this.systems.interfaceManager?.togglePauseMenu();
            }
        });
        
        // Save antes de fechar a página (delegando para onBeforeUnload consolidado)
        window.addEventListener('beforeunload', async () => {
            try { await this.onBeforeUnload(); } catch (error) { console.error('❌ Erro no save antes de fechar:', error); }
        });
        
        // Visibilidade da página - pausar/resumir e save quando necessário
        document.addEventListener('visibilitychange', async () => {
            if (document.hidden) {
                this.pauseGame();
                // Save quando página fica inativa (mobile/alt+tab)
                if (this.gameData.player) {
                    try {
                        await this.saveOnEvent('page_hidden');
                    } catch (error) {
                        console.error('❌ Erro no save ao esconder página:', error);
                    }
                }
            } else {
                this.resumeGame();
            }
        });
    }
    
    // Removido manipulador legado que escrevia direto no localStorage.
    
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
        // Atualizar tempo do jogo apenas no modo automático
        let oldDate = new Date(this.currentDate);
        if (this.weeklyUpdatesMode === 'auto') {
            const gameTimeElapsed = (deltaTime * this.gameSpeed) / 1000; // 1s real = 1 dia por padrão
            oldDate = new Date(this.currentDate);
            this.advanceGameTime(gameTimeElapsed);
        }
        
        // Verificar se passou uma semana/turno (somente no modo 'auto')
        if (this.weeklyUpdatesMode === 'auto') {
            const weekChanged = this.hasWeekChanged(oldDate, this.currentDate);
            if (weekChanged) {
                this.onTurnPassed('auto');
            }
        }
        
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

    /**
     * Verifica se uma semana passou (um "turno" do jogo)
     */
    hasWeekChanged(oldDate, newDate) {
        const oldWeek = Math.floor(oldDate.getTime() / (7 * 24 * 60 * 60 * 1000));
        const newWeek = Math.floor(newDate.getTime() / (7 * 24 * 60 * 60 * 1000));
        return oldWeek !== newWeek;
    }

    /**
     * Chamado quando um turno (semana) passa - trigger para auto-save
     */
    async onTurnPassed(trigger = 'auto') {
        console.log('📅 Turno passou - semana:', Math.floor(this.currentDate.getTime() / (7 * 24 * 60 * 60 * 1000)));
        
        // Adicionar evento de passagem de turno
        this.addGameEvent({
            type: 'turn_passed',
            week: Math.floor(this.currentDate.getTime() / (7 * 24 * 60 * 60 * 1000)),
            gameDate: this.currentDate.toISOString(),
            trigger
        });
        
        // Processos semanais centralizados executam aqui
        try {
            // Regeneração de energia, etc.
            this.weeklyProgressHandler();
            // Charts/streams semanais (stub)
            console.log('📊 (Semanal) Processando charts/streams...');
        } catch (e) {
            console.warn('⚠️ Erro em processos semanais:', e);
        }
        
        // Save automático a cada turno
        await this.saveOnEvent('turn_passed');
        
        // Atualizar UI (indicadores, recursos)
        try {
            if (window.gameHub) {
                window.gameHub.updateTimeInfo?.();
                window.gameHub.updateResources?.();
                window.gameHub.updateMetrics?.();
            }
        } catch (e) {
            console.warn('⚠️ UI pós-semana falhou:', e);
        }
    }

    /**
     * Avança manualmente uma semana e executa progressos semanais
     */
    async passWeek() {
        console.log('🕰️ === INICIANDO PASSAR SEMANA ===');
        try {
            // 1) Mostrar modal de carregamento glassmorphism (se disponível)
            let closeFn = null;
            try {
                if (window.notificationModals?.showWeeklyLoading) {
                    console.log('🔄 Mostrando modal de carregamento...');
                    closeFn = window.notificationModals.showWeeklyLoading();
                }
            } catch(_) { /* opcional */ }

            const prevEnergy = this.systems?.dataManager?.getEnergyState()?.current ?? (this.gameData?.player?.energy ?? 100);
            const prevDate = new Date(this.currentDate);

            // 2) Avançar data em 7 dias
            const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
            this.currentDate = new Date(this.currentDate.getTime() + ONE_WEEK_MS);

            // 3) Processar rotinas semanais
            await this.onTurnPassed('manual');

            // 3.5) Studio Manager weekly update
            try {
                if (this.systems.studioManager && this.systems.studioManager.weeklyUpdate) {
                    console.log('🎵 Executando atualização semanal do StudioManager...');
                    this.systems.studioManager.weeklyUpdate();
                }
            } catch (err) {
                console.error('❌ Erro na atualização semanal do Studio:', err);
            }

            // 4) Atualizar UI de tempo explicitamente
            try { window.gameHub?.updateTimeInfo?.(); } catch(_) {}

            // 5) Fechar loading e abrir resumo semanal
            try {
                const energyInfo = this.systems?.dataManager?.getEnergyState?.() || { current: this.gameData?.player?.energy ?? 100, max: 100 };
                const deltaEnergy = Math.max(0, energyInfo.current - prevEnergy);
                if (closeFn) closeFn();
                if (window.notificationModals?.showWeeklySummary) {
                    window.notificationModals.showWeeklySummary({
                        dateFrom: prevDate,
                        dateTo: new Date(this.currentDate),
                        energyRegenerated: deltaEnergy,
                        energyNow: energyInfo.current,
                        energyMax: energyInfo.max
                    });
                }
            } catch(_) { /* opcional */ }

            // 6) Garantir atualização explícita da UI (energia, métricas)
            try { this.updatePlayerUI?.(); } catch(_) {}
            try { window.gameHub?.updateResources?.(); } catch(_) {}
            try { window.gameHub?.updateTimeInfo?.(); } catch(_) {}
            
            // 7) CRÍTICO: Força sincronização COMPLETA entre DataManager e Engine
            try {
                if (this.systems?.dataManager) {
                    const gameData = this.systems.dataManager.loadGameData();
                    if (gameData.player && this.gameData.player) {
                        // Sincronizar TODOS os dados críticos
                        this.gameData.player.energy = gameData.player.energy || gameData.energy?.current || 100;
                        this.gameData.player.money = gameData.player.money || 0;
                        
                        // 🎯 SINCRONIZAR SKILLS TAMBÉM (CRÍTICO)
                        if (gameData.player.skills) {
                            if (!this.gameData.player.skills) this.gameData.player.skills = {};
                            Object.assign(this.gameData.player.skills, gameData.player.skills);
                            console.log(`🎯 Skills sincronizadas:`, this.gameData.player.skills);
                        }
                        
                        console.log(`🔄 Pós-semana SINCRONIZADO: Energia=${this.gameData.player.energy}, Dinheiro=$${this.gameData.player.money}`);
                        
                        // Forçar nova atualização da UI com dados sincronizados
                        setTimeout(() => {
                            this.updatePlayerUI?.();
                            window.gameHub?.updateMetrics?.();
                            window.gameHub?.updateResources?.();
                            console.log('✅ UI atualizada após sincronização pós-semana');
                        }, 200);
                    }
                }
            } catch (syncErr) {
                console.error('❌ Erro na sincronização pós-semana:', syncErr);
            }

            if (this.systems.interfaceManager?.showNotification) {
                this.systems.interfaceManager.showNotification('Semana avançada', 'success', 3000);
            }
        } catch (e) {
            console.error('❌ Erro ao avançar semana:', e);
        }
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
        
        // Eventos semanais/mensais somente no modo automático
        if (this.weeklyUpdatesMode === 'auto') {
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
        console.log('📊 Skills recebidas do character creator:', playerData.skills);
        
        // 🧹 LIMPEZA CONDICIONAL: Só limpar se não houver skills customizadas
        try {
            const hasCustomSkills = playerData.skills && Object.values(playerData.skills).some(level => level > 1);
            if (!hasCustomSkills) {
                const keys = Object.keys(localStorage);
                const gameKeys = keys.filter(key => key.startsWith('risingstar_'));
                if (gameKeys.length > 0) {
                    console.log('🧹 Limpando saves antigos (sem skills customizadas):', gameKeys);
                    gameKeys.forEach(key => localStorage.removeItem(key));
                }
            } else {
                console.log('🎯 Preservando localStorage - skills customizadas detectadas');
            }
        } catch (error) {
            console.warn('⚠️ Erro ao verificar saves antigos:', error);
        }
        
        this.gameState = 'playing';
        
        // Adicionar dados padrão ao player
        this.gameData.player = {
            ...playerData,
            // Garantir um profileId único por perfil
            profileId: (playerData.profileId && typeof playerData.profileId === 'string')
                ? playerData.profileId
                : `profile_${(playerData.name||playerData.artistName||'player').toLowerCase().replace(/[^a-z0-9]/g,'_')}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`,
            money: playerData.money || 10000, // $10k inicial
            energy: playerData.energy || 100,
            creativity: playerData.creativity || 100,
            mood: playerData.mood || 75,
            skills: { 
                // VALORES PADRÃO para todas as skills
                vocals: 1,
                songWriting: 1,
                rhythm: 1,
                livePerformance: 1,
                production: 1,
                charisma: 1,
                virality: 1,
                videoDirecting: 1,
                marketing: 0,
                business: 0,
                networking: 0,
                management: 0,
                // SOBRESCREVER com valores do character creator se existirem
                ...(playerData.skills || {})
            },
            stats: {
                totalSongs: 0,
                totalStreams: 0,
                totalRevenue: 0,
                fans: 100 // Começar com 100 fãs
            },
            discography: [],
            studioEquipment: 'basic',
            achievements: [],
            createdAt: Date.now(),
            profileCreated: new Date().toISOString()
        };
        
        // 🎯 SINCRONIZAR PLAYER COMPLETO NO DATA MANAGER
        try {
            console.log('🔄 INICIO: Sincronizando TODOS os dados do player...');
            console.log('� Player completo:', this.gameData.player);
            
            // Garantir que o DataManager esteja inicializado
            if (!this.systems.dataManager) {
                console.error('❌ DataManager não inicializado!');
                return;
            }

            // ✅ Desbloquear saves para perfis recriados com o mesmo nome
            try {
                const profileId = this.systems.dataManager.getProfileSaveId({ player: this.gameData.player });
                if (this.systems.dataManager.unmarkProfileAsDeleted) {
                    this.systems.dataManager.unmarkProfileAsDeleted(profileId);
                }
            } catch (_) { /* ignore */ }
            
            // 💾 SALVAR DADOS COMPLETOS DO PLAYER
            const playerSaved = this.systems.dataManager.savePlayerData(this.gameData.player);
            console.log(`👤 Player data salvamento: ${playerSaved ? 'SUCESSO' : 'FALHA'}`);
            
            // ✅ SALVAR SKILLS INDIVIDUALMENTE (para compatibilidade)
            Object.entries(this.gameData.player.skills).forEach(([skillKey, level]) => {
                const success = this.systems.dataManager.setSkillState(skillKey, level);
                console.log(`📝 Skill ${skillKey}: ${level} (${success ? 'OK' : 'ERRO'})`);
            });
            
            console.log('✅ SINCRONIZAÇÃO COMPLETA DO PLAYER REALIZADA');
            
            // � GARANTIR ENERGIA CHEIA PARA NOVOS JOGADORES
            if (this.systems.dataManager) {
                const energyState = this.systems.dataManager.getEnergyState();
                console.log('🔋 Estado atual da energia:', energyState);
                
                // Se a energia estiver zerada, definir como cheia
                if (energyState.current === 0 || energyState.current < 50) {
                    console.log('🔋 CORRIGINDO: Energia baixa detectada, definindo como cheia');
                    this.systems.dataManager.setEnergyState(100, 100);
                    
                    // Atualizar também no player do engine
                    this.gameData.player.energy = 100;
                }
            }
            
            // �🔍 VERIFICAÇÃO FINAL: ler dados de volta
            console.log('🔍 VERIFICAÇÃO: Testando carregamento...');
            const loadedPlayer = this.systems.dataManager.loadPlayerData();
            if (loadedPlayer) {
                console.log('👤 Player carregado com sucesso:', loadedPlayer.firstName, loadedPlayer.lastName);
                console.log('💰 Dinheiro:', loadedPlayer.money);
                console.log('🎯 Skills verificadas:');
                Object.entries(loadedPlayer.skills).forEach(([skill, level]) => {
                    console.log(`   ${skill}: ${level}`);
                });
            } else {
                console.error('❌ FALHA: Player não foi salvo corretamente!');
            }
            
        } catch (error) {
            console.error('❌ ERRO CRÍTICO ao sincronizar player:', error);
        }
        
        // 🎨 ATUALIZAR UI COM DADOS DO PLAYER
        this.updatePlayerUI();
        
        // 🔄 GARANTIR ATUALIZAÇÃO DA UI COM RETRY (caso elementos ainda não existam)
        setTimeout(() => {
            console.log('🔄 Retry: Atualizando UI novamente após delay...');
            this.updatePlayerUI();
        }, 500);
        
        setTimeout(() => {
            console.log('🔄 Retry final: Atualizando UI após delay maior...');
            this.updatePlayerUI();
        }, 1500);
        
        // Auto-save imediato para garantir que o perfil seja salvo
        setTimeout(async () => {
            try {
                console.log('💾 Tentando salvar perfil inicial...');
                await this.forceSave();
                console.log('✅ Perfil salvo automaticamente após criação');
                
                // Verificar se realmente foi salvo
                if (this.systems.dataManager) {
                    const saved = this.systems.dataManager.loadPlayerData();
                    if (saved && saved.firstName) {
                        console.log('✅ Confirmação: Save encontrado para', saved.firstName);
                    } else {
                        console.error('❌ Save não foi criado corretamente!');
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao salvar perfil inicial:', error);
            }
        }, 1000);
        
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

        // Garantir atualização imediata de métricas (dinheiro abreviado ou valor integral < 1000)
        if (window.gameHub && typeof window.gameHub.updateMetrics === 'function') {
            try { window.gameHub.updateMetrics(); } catch(e) { console.warn('⚠️ Falha updateMetrics inicial:', e); }
        }
        
        // Gerar eventos iniciais
        if (this.systems.aiSimulation && this.systems.aiSimulation.generateInitialEvents) {
            this.systems.aiSimulation.generateInitialEvents();
        }
        
        console.log('✅ Jogo iniciado com sucesso!');
        console.log('💰 Dinheiro inicial:', this.gameData.player.money);
        console.log('🎯 Habilidades:', this.gameData.player.skills);
        console.log('🔄 Auto-save ativado a cada 15 segundos');
    }
    
    /**
     * Atualiza a UI com os dados atuais do player
     */
    updatePlayerUI() {
        try {
            console.log('🎨 Atualizando UI com dados do player...');
            
            const player = this.gameData.player;
            if (!player) {
                console.warn('⚠️ Nenhum dado de player para atualizar UI');
                return;
            }
            
            // Atualizar elementos de dinheiro (somente nós de valor, nunca containers)
            const moneyElements = document.querySelectorAll('#statMoney, #statMoneyInline, .money-display, .stat-cash .val');
            console.log(`💰 Encontrados ${moneyElements.length} elementos de dinheiro:`, Array.from(moneyElements).map(el => el.id || el.className));
            moneyElements.forEach(element => {
                if (element) {
                    const formattedMoney = this.formatMoney(player.money || 0);
                    element.textContent = formattedMoney;
                    console.log(`💰 UI atualizada (${element.id || element.className}): ${formattedMoney}`);
                }
            });
            
            // Atualizar elementos de energia (priorizar DataManager; exibir MAX/CURRENT)
            const energyElements = document.querySelectorAll('#statEnergy, #statEnergyInline, .energy-display, .stat-energy .val');
            console.log(`⚡ Encontrados ${energyElements.length} elementos de energia:`, Array.from(energyElements).map(el => el.id || el.className));
            let energyDisplay = '';
            try {
                let currentEnergy = typeof player.energy === 'number' ? player.energy : 100;
                let maxEnergy = 100;
                if (this.systems?.dataManager) {
                    const energyState = this.systems.dataManager.getEnergyState();
                    currentEnergy = energyState.current;
                    maxEnergy = energyState.max;
                    console.log(`⚡ Energia do DataManager: ${currentEnergy}/${maxEnergy}`);
                }
                if (typeof currentEnergy !== 'number' || currentEnergy < 0) currentEnergy = 100;
                if (typeof maxEnergy !== 'number' || maxEnergy <= 0) maxEnergy = 100;
                energyDisplay = `${maxEnergy}/${currentEnergy}`;
            } catch(e) {
                console.warn('⚠️ Erro ao montar display de energia:', e);
                energyDisplay = '100/100';
            }
            energyElements.forEach(element => {
                if (element) {
                    element.textContent = energyDisplay;
                    console.log(`⚡ Energia atualizada (${element.id || element.className}): ${energyDisplay}`);
                }
            });
            
            // Atualizar nome do artista
            const nameElements = document.querySelectorAll('#artistStageName, #artistStageNameInline, .player-name, .artist-name');
            console.log(`👤 Encontrados ${nameElements.length} elementos de nome:`, Array.from(nameElements).map(el => el.id || el.className));
            nameElements.forEach(element => {
                if (element) {
                    const artistName = `${player.firstName || ''} ${player.lastName || ''}`.trim() || player.artistName || 'Artista';
                    element.textContent = artistName;
                    console.log(`👤 Nome atualizado (${element.id || element.className}): ${artistName}`);
                }
            });
            
            console.log('✅ UI atualizada com dados do player');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar UI:', error);
        }
    }
    
    /**
     * Formata valores de dinheiro
     */
    formatMoney(amount) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}K`;
        } else {
            return `$${amount.toLocaleString()}`;
        }
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
        // Usar o novo sistema de save com backup
        await this.saveGameWithBackup();
        return this.prepareSaveData();
    }

    /**
     * Sistema de save baseado em eventos específicos
     */
    async saveOnEvent(eventType, eventData = null) {
        if (!this.autoSaveOnEvents || !this.gameData.player) {
            return;
        }

        try {
            const DEBUG_SAVE = (localStorage.getItem('DEBUG_SAVE') === '1');
            if (DEBUG_SAVE) console.log(`💾 [DEBUG_SAVE] Auto-save triggered by event: ${eventType}`);
            
            // Registrar a ação que causou o save
            this.addPendingAction({
                type: eventType,
                timestamp: Date.now(),
                data: eventData
            });
            
            // Realizar save com backup redundante
            // Debounce/coalescência: evitar salvar muitas vezes em sequência
            clearTimeout(this._saveDebounceTimer);
            this._saveDebounceTimer = setTimeout(async () => {
                try {
                    await this.saveGameWithBackup();
                    if (DEBUG_SAVE) console.log(`✅ [DEBUG_SAVE] Save realizado com sucesso para evento: ${eventType}`);
                } catch (err) {
                    console.error(`❌ Erro no save debounced (${eventType}):`, err);
                    await this.tryRecoverFromBackup();
                }
            }, 350);
            
        } catch (error) {
            console.error(`❌ Erro no save para evento ${eventType}:`, error);
            
            // Tentar recuperar de backup se save falhou
            await this.tryRecoverFromBackup();
        }
    }

    /**
     * Adiciona ação pendente que precisa ser salva
     */
    addPendingAction(action) {
        this.pendingActions.push(action);
        
        // Limitar histórico de ações a 50 para não consumir muita memória
        if (this.pendingActions.length > 50) {
            this.pendingActions = this.pendingActions.slice(-50);
        }
    }

    /**
     * Save com sistema de backup redundante
     */
    async saveGameWithBackup() {
        const saveData = this.prepareSaveData();
        
        // Calcular hash para verificar integridade
        const saveHash = this.calculateSaveHash(saveData);
        const DEBUG_SAVE = (localStorage.getItem('DEBUG_SAVE') === '1');
        if (DEBUG_SAVE) {
            try {
                const size = JSON.stringify(saveData).length;
                console.log(`💾 [DEBUG_SAVE] Iniciando save (size=${size} bytes, hash=${saveHash})`);
            } catch(_) {}
        }
        // Garantir um profileId válido para verificações e operações relacionadas
        let profileIdForVerify;
        try {
            if (this.systems?.dataManager?.getProfileSaveId) {
                profileIdForVerify = this.systems.dataManager.getProfileSaveId(saveData);
            }
        } catch (_) { /* ignore */ }
        
        // Tentar salvar 3 vezes com backups diferentes
        let saveSuccess = false;
        let lastError = null;
        
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                try {
                    await this.systems.dataManager.saveGame(saveData);
                } catch (e) {
                    // Tentar identificar QuotaExceededError
                    const msg = e?.message || '';
                    if (/quota|storage|exceeded/i.test(msg)) {
                        console.warn('⚠️ Possível QuotaExceeded durante save. Tentando liberar espaço de backups antigos...');
                        try {
                            const profileId = this.systems.dataManager.getProfileSaveId(saveData);
                            await this.systems.dataManager.cleanupProfileBackups(profileId);
                        } catch(_) {}
                    }
                    throw e;
                }
                
                // Verificar se save foi corrompido
                const verification = await this.verifySaveIntegrity(profileIdForVerify);
                if (verification.isValid) {
                    this.lastSaveHash = saveHash;
                    if (DEBUG_SAVE) console.log('✅ [DEBUG_SAVE] Save verificado com sucesso');
                    saveSuccess = true;
                    break;
                } else {
                    throw new Error('Save corrompido após salvamento');
                }
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Tentativa de save ${attempt + 1} falhou:`, error);
                
                // Esperar um pouco antes da próxima tentativa
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        if (!saveSuccess) {
            throw new Error(`Falha em todas as tentativas de save: ${lastError?.message}`);
        }
        
        // Limpar ações pendentes após save bem-sucedido
        this.pendingActions = [];
    }

    /**
     * Prepara dados para salvamento
     */
    prepareSaveData() {
        return {
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
            pendingActions: this.pendingActions, // Incluir ações pendentes
            systemStates: {
                aiSimulation: this.systems.aiSimulation?.getState ? this.systems.aiSimulation.getState() : null,
                musicCreation: this.systems.musicCreation?.getState ? this.systems.musicCreation.getState() : null,
                // TODO: Implementar estes sistemas
                careerManagement: null,
                socialSystem: null,
                industrySimulation: null
            }
        };
    }

    /**
     * Calcula hash do save para verificar integridade
     */
    calculateSaveHash(saveData) {
        // Simples hash baseado em JSON stringify
        const jsonStr = JSON.stringify(saveData);
        let hash = 0;
        for (let i = 0; i < jsonStr.length; i++) {
            const char = jsonStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    /**
     * Verifica integridade do save
     */
    async verifySaveIntegrity(profileId) {
        try {
            const saveData = await this.systems.dataManager.getData(this.systems.dataManager.stores.gameData, profileId);
            
            if (!saveData) {
                return { isValid: false, error: 'Save not found' };
            }
            
            // Verificações básicas de integridade
            if (!saveData.player || !saveData.version || !saveData.timestamp) {
                return { isValid: false, error: 'Missing critical save data' };
            }
            
            // Verificar se dados essenciais existem
            if (typeof saveData.player.money !== 'number' || !saveData.player.firstName) {
                return { isValid: false, error: 'Corrupted player data' };
            }
            
            return { isValid: true };
            
        } catch (error) {
            return { isValid: false, error: error.message };
        }
    }

    /**
     * Tenta recuperar de backup em caso de corrupção
     */
    async tryRecoverFromBackup() {
        try {
            console.log('🔄 Tentando recuperar de backup...');
            
            if (!this.gameData.player?.profileId) {
                throw new Error('Não foi possível identificar perfil para recuperação');
            }
            
            const profileId = this.systems.dataManager.getProfileSaveId(this.gameData);
            const allData = await this.systems.dataManager.getAllData(this.systems.dataManager.stores.gameData);
            
            // Buscar backups do perfil atual
            const profileBackups = allData
                .filter(item => item.id.startsWith(`${profileId}_backup_`))
                .sort((a, b) => b.timestamp - a.timestamp);
            
            if (profileBackups.length === 0) {
                throw new Error('Nenhum backup encontrado');
            }
            
            // Tentar carregar o backup mais recente
            for (const backup of profileBackups) {
                try {
                    const verification = await this.verifySaveIntegrity(backup.id);
                    if (verification.isValid) {
                        // Restaurar do backup
                        await this.systems.dataManager.putData(
                            this.systems.dataManager.stores.gameData, 
                            { ...backup, id: profileId }
                        );
                        
                        console.log(`✅ Recuperado de backup: ${backup.id}`);
                        return true;
                    }
                } catch (e) {
                    console.warn(`⚠️ Backup ${backup.id} também corrompido:`, e);
                }
            }
            
            throw new Error('Todos os backups estão corrompidos');
            
        } catch (error) {
            console.error('❌ Falha na recuperação de backup:', error);
            
            // Notificar usuário sobre problema crítico
            if (window.notificationSystem) {
                window.notificationSystem.show({
                    type: 'error',
                    title: 'Erro Crítico de Save',
                    message: 'Não foi possível salvar ou recuperar dados. Recomendamos exportar dados manualmente.',
                    duration: 10000
                });
            }
            
            return false;
        }
    }

    /**
     * Atualiza dados do jogador e salva automaticamente
     */
    async updatePlayerData(newPlayerData) {
        if (this.gameData.player) {
            Object.assign(this.gameData.player, newPlayerData);
        } else {
            this.gameData.player = { ...newPlayerData };
        }
        
        console.log('👤 Dados do jogador atualizados');
        await this.saveOnEvent('player_updated', newPlayerData);
    }

    /**
     * Adiciona nova música e salva automaticamente
     */
    async addSong(songData) {
        const songId = songData.id || `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.gameData.songs[songId] = {
            ...songData,
            id: songId,
            createdAt: Date.now()
        };
        
        console.log(`🎵 Nova música adicionada: ${songData.title || songId}`);
        await this.saveOnEvent('song_created', { songId, title: songData.title });
        return songId;
    }

    /**
     * Adiciona novo álbum e salva automaticamente
     */
    async addAlbum(albumData) {
        const albumId = albumData.id || `album_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.gameData.albums[albumId] = {
            ...albumData,
            id: albumId,
            createdAt: Date.now()
        };
        
        console.log(`💿 Novo álbum adicionado: ${albumData.title || albumId}`);
        await this.saveOnEvent('album_created', { albumId, title: albumData.title });
        return albumId;
    }

    /**
     * Adiciona evento e salva automaticamente
     */
    async addGameEvent(eventData) {
        const event = {
            ...eventData,
            id: eventData.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            gameDate: this.currentDate.toISOString()
        };
        this.gameData.events.push(event);
        
        console.log(`📅 Novo evento adicionado: ${event.type || event.id}`);
        await this.saveOnEvent('event_added', { eventId: event.id, eventType: event.type });
        return event.id;
    }

    /**
     * Atualiza estatísticas do jogador e salva automaticamente
     */
    async updatePlayerStats(statUpdates) {
        if (!this.gameData.player.stats) {
            this.gameData.player.stats = {};
        }
        
        Object.assign(this.gameData.player.stats, statUpdates);
        
        console.log('📊 Estatísticas do jogador atualizadas');
        await this.saveOnEvent('stats_updated', statUpdates);
    }

    /**
     * Métodos para ações críticas que precisam de save imediato
     */
    async onCriticalAction(actionType, actionData) {
        console.log(`⚡ Ação crítica: ${actionType}`);
        await this.saveOnEvent('critical_action', { actionType, actionData });
    }

    /**
     * Chamado antes de fechar o jogo ou mudar tela
     */
    async onBeforeUnload() {
        console.log('🚪 Salvando antes de sair...');
        try {
            // Cancelar debounce pendente e salvar imediatamente
            if (this._saveDebounceTimer) {
                clearTimeout(this._saveDebounceTimer);
                this._saveDebounceTimer = null;
            }
            await this.saveGameWithBackup();
        } catch (e) {
            console.error('❌ Erro ao salvar no onBeforeUnload:', e);
        }
    }

    /**
     * Save forçado (mantido para compatibilidade)
     */
    async forceSave() {
        try {
            await this.saveGameWithBackup();
            console.log('💾 Save forçado realizado com sucesso');
        } catch (error) {
            console.error('❌ Erro no save forçado:', error);
            throw error;
        }
    }
    
    loadSaveData(saveData) {
        console.log('📁 Carregando dados do save...');
        
        if (saveData.version && saveData.version !== this.version) {
            console.warn(`⚠️ Versão do save (${saveData.version}) diferente da atual (${this.version})`);
        }
        
        // Carregar dados básicos do jogo
    // Carregar data do jogo com precisão: priorizar currentDate do save; caso ausente,
    // usar o último `gameDate` de eventos; se ainda ausente, usar `timestamp` do save;
    // por fim, manter a data que já está no engine (evitar reset para 1º jan do ano atual).
    if (saveData.currentDate) {
        this.currentDate = new Date(saveData.currentDate);
    } else {
        let derivedDate = null;
        try {
            if (Array.isArray(saveData.events) && saveData.events.length > 0) {
                const withDates = saveData.events.filter(e => e.gameDate);
                if (withDates.length > 0) {
                    withDates.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));
                    derivedDate = new Date(withDates[0].gameDate);
                }
            }
        } catch (_) { /* ignore */ }
        if (!derivedDate && saveData.timestamp) {
            derivedDate = new Date(saveData.timestamp);
        }
        if (derivedDate) {
            this.currentDate = derivedDate;
        } // else: mantém this.currentDate como estava
    }
        this.gameSpeed = saveData.gameSpeed || 1;
        
        // Carregar dados do jogador
        this.gameData.player = saveData.player || null;
        this.gameData.songs = saveData.songs || {};
        this.gameData.albums = saveData.albums || {};
        this.gameData.charts = saveData.charts || {};
        this.gameData.events = saveData.events || [];
        this.gameData.news = saveData.news || [];
        this.gameData.trends = saveData.trends || {};
        
        // Restaurar estados dos sistemas se disponíveis
        if (saveData.systemStates) {
            Object.keys(saveData.systemStates).forEach(systemName => {
                if (this.systems[systemName] && this.systems[systemName].setState && saveData.systemStates[systemName]) {
                    try {
                        this.systems[systemName].setState(saveData.systemStates[systemName]);
                    } catch (error) {
                        console.warn(`⚠️ Erro ao restaurar estado do sistema ${systemName}:`, error);
                    }
                }
            });
        }
        
        // Carregar ações pendentes se disponíveis
        this.pendingActions = saveData.pendingActions || [];
        
        // Resetar sistema de save (dados estão sincronizados)
        this.lastSaveHash = this.calculateSaveHash(saveData);
        this.gameState = 'playing';
        
        // Atualizar interface se disponível
        if (window.gameHub && typeof window.gameHub.updateMetrics === 'function') {
            try { 
                window.gameHub.updateMetrics(); 
                console.log('� Interface atualizada com dados do save');
            } catch(e) { 
                console.warn('⚠️ Falha ao atualizar interface:', e); 
            }
        }
        
        console.log('✅ Save carregado com sucesso');
        console.log(`👤 Jogador: ${this.gameData.player?.firstName || 'Desconhecido'}`);
        console.log(`💰 Dinheiro: $${this.gameData.player?.money || 0}`);
        console.log(`🎵 Músicas: ${Object.keys(this.gameData.songs).length}`);
    }
    
    async loadGame(saveId) {
        try {
            // 1) Tentar carregar como save explícito (risingstar_save_*)
            let saveData = await this.systems.dataManager.loadSpecificSave(saveId);
            let gameData = null;
            if (saveData && saveData.gameData) {
                gameData = saveData.gameData;
            }

            // 2) Fallback: tentar carregar como perfil salvo no store gameData (profile_*)
            if (!gameData) {
                const profileSave = await this.systems.dataManager.getData(
                    this.systems.dataManager.stores.gameData,
                    saveId
                );
                if (profileSave) {
                    gameData = profileSave; // já é o objeto completo do jogo
                }
            }

            if (!gameData) {
                console.error('Save não encontrado:', saveId);
                return false;
            }

            // Carregar os dados do save
            this.loadSaveData(gameData);
            
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
        try { if (window.gameHub?.updateMetrics) window.gameHub.updateMetrics(); } catch(e) { /* ignore */ }
        return true;
    }
    
    // Ganhar dinheiro
    earnMoney(amount, source = '') {
        if (!this.gameData.player) return false;
        
        this.gameData.player.money += amount;
        console.log(`💰 Ganhou $${amount}${source ? ' de ' + source : ''}`);
        try { if (window.gameHub?.updateMetrics) window.gameHub.updateMetrics(); } catch(e) { /* ignore */ }
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

    // ========================================
    // 🎵 SISTEMA DE TREINAMENTO DE SKILLS
    // ========================================

    /**
     * Handler para treinamento de skills
     */
    trainSkill(skillKey) {
        if (!this.systems.dataManager) {
            console.error('❌ DataManager não disponível para treinamento');
            return { success: false, reason: 'Sistema não disponível' };
        }

        console.log(`🎯 Iniciando treinamento da skill: ${skillKey}`);
        
        // Delegar para o DataManager
        const result = this.systems.dataManager.trainSkill(skillKey);
        
        if (result.success) {
            // Adicionar à atividade recente
            this.addActivity(`Treinou ${this.getSkillDisplayName(skillKey)} (Nível ${result.newLevel})`);
            
            // Trigger auto-save
            if (this.autoSaveOnEvents) {
                this.triggerAutoSave();
            }
            
            console.log(`✅ Treinamento concluído: ${skillKey} → Nível ${result.newLevel}`);
        } else {
            console.log(`❌ Treinamento falhou: ${result.reason}`);
        }
        
        return result;
    }

    /**
     * Obtém informações de uma skill específica
     */
    getSkillInfo(skillKey) {
        if (!this.systems.dataManager) {
            return { level: 0, maxLevel: 100 };
        }
        return this.systems.dataManager.getSkillState(skillKey);
    }

    /**
     * Obtém todas as skills do jogador
     */
    getAllSkills() {
        if (!this.systems.dataManager) {
            return {};
        }
        return this.systems.dataManager.getAllSkills();
    }

    /**
     * Obtém estado da energia
     */
    getEnergyInfo() {
        if (!this.systems.dataManager) {
            return { current: 100, max: 100 };
        }
        return this.systems.dataManager.getEnergyState();
    }

    /**
     * Handler para progressão semanal (regeneração de energia)
     */
    weeklyProgressHandler() {
        if (!this.systems.dataManager) {
            console.warn('⚠️ DataManager não disponível para progressão semanal');
            return;
        }

        console.log('📅 Executando progressão semanal...');
        
        // Regenerar energia
        const energyResult = this.systems.dataManager.weeklyRollover();
        
        if (energyResult) {
            this.addActivity(`Energia regenerada: ${energyResult.regenerated} pontos`);
            
            // Mostrar notificação se o sistema de interface estiver disponível
            if (this.systems.interfaceManager) {
                this.systems.interfaceManager.showNotification({
                    message: `🔋 Energia regenerada! +${energyResult.regenerated} pontos`,
                    type: 'success',
                    duration: 4000
                });
            }
        }

        // Trigger auto-save
        if (this.autoSaveOnEvents) {
            this.triggerAutoSave();
        }

        console.log('✅ Progressão semanal concluída');
    }

    /**
     * Converte skill key em nome para exibição
     */
    getSkillDisplayName(skillKey) {
        const skillNames = {
            vocals: 'Vocal',
            songWriting: 'Composição',
            rhythm: 'Ritmo',
            livePerformance: 'Performance ao Vivo',
            production: 'Produção',
            charisma: 'Carisma',
            virality: 'Viralização',
            videoDirecting: 'Direção de Vídeo'
        };
        return skillNames[skillKey] || skillKey;
    }

    /**
     * Adiciona atividade ao log
     */
    addActivity(description) {
        if (!this._activityLog) this._activityLog = [];
        
        const activity = {
            description,
            timestamp: new Date(),
            date: new Date().toLocaleDateString('pt-BR')
        };
        
        this._activityLog.push(activity);
        
        // Manter apenas as últimas 50 atividades
        if (this._activityLog.length > 50) {
            this._activityLog.shift();
        }
        
        console.log(`📝 Atividade adicionada: ${description}`);
    }

    /**
     * Trigger auto-save baseado em eventos
     */
    triggerAutoSave() {
        if (!this.autoSaveOnEvents) return;
        
        // Debounce para evitar saves excessivos
        if (this._saveTimeout) {
            clearTimeout(this._saveTimeout);
        }
        
        this._saveTimeout = setTimeout(() => {
            console.log('💾 Auto-save executado por evento');
            // Auto-save será implementado quando tivermos o sistema completo
        }, 2000); // Delay de 2 segundos
    }
}
