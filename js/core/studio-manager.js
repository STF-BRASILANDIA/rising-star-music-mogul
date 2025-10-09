/**
 * Rising Star: Music Mogul - Studio Manager
 * Gerencia todas as funcionalidades do estúdio musical
 */

export class StudioManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentProjects = [];
        this.equipment = {
            microphones: 1,
            instruments: 2,
            mixingBoard: 1,
            computers: 1,
            quality: 0.6
        };
        this.charts = null;
        this.labels = [];
        this.init();
    }

    init() {
        console.log('🎵 Inicializando Studio Manager...');
        this.setupEventListeners();
        this.initializeCharts();
        this.initializeLabels();
        this.loadProjects();
    }

    // === Persistência do estado (para salvar/carregar via GameEngine) ===
    getState() {
        // Serializa Maps para objetos simples
        const chartsObj = { regions: this.charts?.regions || [] };
        if (this.charts) {
            chartsObj.current = {};
            chartsObj.trends = {};
            (this.charts.regions || []).forEach(region => {
                const regionChart = this.charts.current?.get ? this.charts.current.get(region) : (this.charts.current?.[region] || []);
                chartsObj.current[region] = Array.isArray(regionChart) ? regionChart : [];
                const regionTrends = this.charts.trends?.get ? this.charts.trends.get(region) : (this.charts.trends?.[region] || []);
                chartsObj.trends[region] = Array.isArray(regionTrends) ? regionTrends : [];
            });
        }

        return {
            equipment: this.equipment,
            currentProjects: this.currentProjects,
            labels: this.labels,
            charts: chartsObj,
            // Composições podem existir se o compositor estiver em uso
            compositions: this.compositions || []
        };
    }

    setState(state) {
        try {
            if (!state) return;
            this.equipment = state.equipment || this.equipment;
            this.currentProjects = Array.isArray(state.currentProjects) ? state.currentProjects : this.currentProjects;
            this.labels = Array.isArray(state.labels) ? state.labels : this.labels;

            // Reconstruir estrutura de charts com Maps internos para uso interno
            if (state.charts && state.charts.regions) {
                this.charts = {
                    regions: state.charts.regions,
                    current: new Map(),
                    trends: new Map()
                };
                this.charts.regions.forEach(region => {
                    const regionChart = state.charts.current?.[region] || [];
                    const regionTrends = state.charts.trends?.[region] || [];
                    this.charts.current.set(region, Array.isArray(regionChart) ? regionChart : []);
                    this.charts.trends.set(region, Array.isArray(regionTrends) ? regionTrends : []);
                });
            }

            // Composições
            if (Array.isArray(state.compositions)) {
                this.compositions = state.compositions;
            }
        } catch (err) {
            console.warn('⚠️ Falha ao restaurar estado do StudioManager:', err);
        }
    }

    setupEventListeners() {
        // Event listeners para todos os botões do estúdio usando data-studio-action
        document.addEventListener('click', (e) => {
            // Se clicou dentro do modal content, impedir propagação
            if (e.target.closest('.song-composer-modal')) {
                e.stopPropagation();
            }

            const action = e.target.closest('[data-studio-action]')?.dataset.studioAction;
            if (!action) {
                // Verificar se clicou no backdrop do modal para fechar
                if (e.target.id === 'songComposerModal') {
                    console.log('🔴 Clicou no backdrop - fechando modal');
                    this.closeSongComposer();
                    e.preventDefault();
                    e.stopPropagation();
                }
                return;
            }

            console.log('🎵 Studio action triggered:', action);

            switch (action) {
                case 'compose-song':
                    this.openSongComposer();
                    break;
                case 'record-song':
                    this.showRecordingInterface();
                    break;
                case 'marketing-song':
                    this.openMarketingInterface();
                    break;
                case 'studio-collab':
                    this.openCollabInbox();
                    break;
                case 'studio-analytics':
                    this.openAnalytics();
                    break;
                case 'studio-equipment':
                    this.openTeamInterface();
                    break;
                case 'studio-charts':
                    this.openAnalytics('charts');
                    break;
                case 'studio-labels':
                    this.openAnalytics('labels');
                    break;
                case 'close-composer':
                case 'cancel-composition':
                    console.log('🔴 Fechar compositor acionado via:', action);
                    this.closeSongComposer();
                    break;
                case 'random-title':
                    this.generateRandomTitle();
                    break;
                case 'last-theme':
                    this.useLastTheme();
                    break;
                case 'random-theme':
                    this.randomTheme();
                    break;
                case 'confirm-composition':
                    this.confirmSongComposition();
                    break;
                default:
                    console.log('❓ Studio action not handled:', action);
            }
        });

        // Event listener para fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('songComposerModal');
                if (modal && modal.style.display === 'flex') {
                    console.log('🔴 ESC pressionado - fechando modal');
                    this.closeSongComposer();
                }
            }
        });
    }

    initializeCharts() {
        // Simula sistema de charts regionais como no Music Wars
        this.charts = {
            regions: ['Brazil', 'USA', 'UK', 'Germany', 'Japan', 'Australia'],
            current: new Map(),
            trends: new Map()
        };

        // Inicializa charts vazios para cada região
        this.charts.regions.forEach(region => {
            this.charts.current.set(region, []);
            this.charts.trends.set(region, this.generateTrendData());
        });
    }

    initializeLabels() {
        // Sistema de gravadoras baseado no Music Wars
        this.labels = [
            {
                id: 'indie_start',
                name: 'Indie Records',
                reputation: 0.3,
                royaltyRate: 0.15,
                advance: 5000,
                requirements: { songs: 1, quality: 0.5 }
            },
            {
                id: 'mid_tier',
                name: 'Rising Star Music',
                reputation: 0.6,
                royaltyRate: 0.25,
                advance: 25000,
                requirements: { songs: 3, quality: 0.7, chartPosition: 50 }
            },
            {
                id: 'major_label',
                name: 'Global Music Corp',
                reputation: 0.9,
                royaltyRate: 0.4,
                advance: 100000,
                requirements: { songs: 5, quality: 0.8, chartPosition: 10 }
            }
        ];
    }

    generateTrendData() {
        const genres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Folk', 'Jazz'];
        return genres.map(genre => ({
            genre,
            popularity: Math.random(),
            trending: Math.random() > 0.7
        }));
    }

    handleStudioAction(action, card) {
        console.log(`🎵 Studio Action: ${action}`);
        
        switch(action) {
            case 'Iniciar Gravação':
                this.showRecordingInterface();
                break;
            case 'Acessar Estúdio':
                this.showVocalStudio();
                break;
            case 'Abrir Mixer':
                this.showMixingInterface();
                break;
            case 'Buscar Parceiros':
                this.showCollaborationInterface();
                break;
            case 'Ver Equipamentos':
                this.showEquipmentInterface();
                break;
            case 'Ver Relatórios':
                this.showAnalyticsInterface();
                break;
            default:
                console.warn('Ação não reconhecida:', action);
        }
    }

    showRecordingInterface() {
        // Verificar se há composições para gravar
        if (!this.compositions || this.compositions.length === 0) {
            this.showNotification('🎵 Você precisa compor algumas músicas primeiro!', 'warning');
            return;
        }

        // Usar a nova interface profissional
        if (window.StudioRecordingPro) {
            const recordingPro = new window.StudioRecordingPro(this);
            const modal = window.modernModalSystem.createModal({
                id: 'recording-modal',
                title: '🎛️ Estúdio Profissional',
                content: recordingPro.getRecordingHTML(),
                type: 'studio',
                size: 'large'
            });
            window.modernModalSystem.openModal(modal);
            this.setupRecordingEventsPro(modal, recordingPro);
        } else {
            // Fallback para interface básica
            const modal = window.modernModalSystem.createModal({
                id: 'recording-modal',
                title: '🎤 Gravar no Estúdio',
                content: this.getRecordingHTML(),
                type: 'studio'
            });
            window.modernModalSystem.openModal(modal);
            this.setupRecordingEvents(modal);
        }
    }

    getRecordingHTML() {
        // Lista de composições prontas para gravar
        const compositions = this.compositions || [];
        
        // Produtores disponíveis (da equipe contratada + freelancers)
        const teamProducers = (this.team || []).filter(m => m.role === 'Produtor');
        const freelanceProducers = [
            { name: 'Carlos Silva', skill: 0.7, cost: 2000, specialty: 'Pop/Rock' },
            { name: 'Marina Santos', skill: 0.8, cost: 3500, specialty: 'Hip-Hop/R&B' },
            { name: 'João Beats', skill: 0.9, cost: 5000, specialty: 'Electronic' }
        ];
        
        // Artistas para feat (simulado)
        const featArtists = [
            { name: 'MC Flow', genre: 'Hip-Hop', cost: 8000, popularity: 0.8 },
            { name: 'Ana Melodia', genre: 'Pop', cost: 12000, popularity: 0.9 },
            { name: 'Rocking Pete', genre: 'Rock', cost: 6000, popularity: 0.7 }
        ];
        
        return `
            <div class="recording-interface">
                <div class="recording-header">
                    <h3>� Gravar no Estúdio</h3>
                    <p>Selecione uma composição e configure a produção profissional</p>
                </div>
                
                <div class="recording-form">
                    <!-- Seleção de Composição -->
                    <div class="form-group">
                        <label><i class="fas fa-music"></i> Selecionar Composição</label>
                        <select id="selectedComposition">
                            <option value="">Escolha uma música para gravar...</option>
                            ${compositions.map(comp => {
                                const quality = Math.round(comp.quality * 100);
                                return `<option value="${comp.id}" data-quality="${comp.quality}" data-genre="${comp.genre}">
                                    "${comp.title}" (${comp.genre}) - ${quality}% qualidade
                                </option>`;
                            }).join('')}
                        </select>
                    </div>

                    <!-- Equipamentos do Estúdio -->
                    <div class="inline-equipments" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <div style="display:flex; align-items:center; justify-content: space-between; gap: 12px;">
                            <div class="eq-left" style="display:flex; align-items:center; gap: 8px;">
                                <i class="fas fa-cogs"></i>
                                <div>
                                    <div style="font-weight:600">Equipamentos do Estúdio</div>
                                    <div style="opacity:.8; font-size:12px">Nível atual: <span id="eqTierLabel">${this.equipment?.tier || 'basic'}</span></div>
                                </div>
                            </div>
                            <button id="manageEquipBtn" class="btn-secondary" style="padding:8px 12px;">Gerenciar</button>
                        </div>
                    </div>

                    <!-- Seleção de Produtor -->
                    <div class="form-group">
                        <label><i class="fas fa-user-tie"></i> Selecionar Produtor</label>
                        <select id="selectedProducer">
                            <option value="">Produção própria (gratuita)</option>
                            ${teamProducers.map(prod => 
                                `<option value="team_${prod.role}" data-skill="${prod.bonus}" data-cost="0">
                                    ${prod.role} (Equipe) - Bônus: +${Math.round(prod.bonus * 100)}%
                                </option>`
                            ).join('')}
                            ${freelanceProducers.map(prod => 
                                `<option value="freelance_${prod.name}" data-skill="${prod.skill}" data-cost="${prod.cost}">
                                    ${prod.name} (Freelance) - ${prod.specialty} - $${prod.cost.toLocaleString()}
                                </option>`
                            ).join('')}
                        </select>
                    </div>

                    <!-- Colaboração/Feat -->
                    <div class="form-group">
                        <label><i class="fas fa-microphone-alt"></i> Colaboração (Opcional)</label>
                        <select id="selectedFeat">
                            <option value="">Sem colaboração</option>
                            ${featArtists.map(artist => 
                                `<option value="${artist.name}" data-cost="${artist.cost}" data-popularity="${artist.popularity}">
                                    ${artist.name} (${artist.genre}) - $${artist.cost.toLocaleString()} - ${Math.round(artist.popularity * 100)}% popularidade
                                </option>`
                            ).join('')}
                        </select>
                    </div>

                    <!-- Resumo de Custos -->
                    <div class="cost-summary" id="costSummary" style="background: rgba(255,255,255,0.08); padding: 12px; border-radius: 8px; margin: 12px 0;">
                        <h4 style="margin: 0 0 8px 0;"><i class="fas fa-calculator"></i> Resumo de Custos</h4>
                        <div id="costBreakdown">
                            <div>Gravação básica: $500</div>
                            <div id="producerCost" style="display: none;">Produtor: $0</div>
                            <div id="featCost" style="display: none;">Feat: $0</div>
                            <hr style="margin: 8px 0; border: 1px solid rgba(255,255,255,0.2);">
                            <div style="font-weight: bold;">Total: <span id="totalCost">$500</span></div>
                        </div>
                    </div>

                    <div class="recording-options">
                        <h4><i class="fas fa-sliders-h"></i> Qualidade da Gravação</h4>
                        <div class="option-grid">
                            <label class="option-card">
                                <input type="radio" name="recordingQuality" value="basic" checked>
                                <div class="option-content">
                                    <strong>Básica (+$0)</strong>
                                    <span>Qualidade padrão</span>
                                </div>
                            </label>
                            <label class="option-card">
                                <input type="radio" name="recordingQuality" value="professional">
                                <div class="option-content">
                                    <strong>Profissional (+$1,500)</strong>
                                    <span>Alta qualidade de áudio</span>
                                </div>
                            </label>
                            <label class="option-card">
                                <input type="radio" name="recordingQuality" value="premium">
                                <div class="option-content">
                                    <strong>Premium (+$4,500)</strong>
                                    <span>Qualidade excepcional</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <div class="trends-info">
                        <h4>📊 Tendências Atuais</h4>
                        <div class="trends-grid" id="trendsDisplay">
                            ${this.getTrendsHTML()}
                        </div>
                    </div>
                </div>
                
                <div class="recording-actions">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                    <button class="btn-primary" id="startRecordingBtn">Iniciar Gravação 🎵</button>
                </div>
            </div>
        `;
    }

    getTrendForGenre(genre) {
        // Simula tendências baseado em dados regionais como no Music Wars
        const trends = {
            'Pop': 0.8,
            'Hip-Hop': 0.9,
            'Electronic': 0.7,
            'Rock': 0.5,
            'Folk': 0.3,
            'Jazz': 0.2,
            'Country': 0.4,
            'R&B': 0.6
        };
        return trends[genre] || 0.5;
    }

    getTrendsHTML() {
        const regions = ['Brazil', 'USA', 'UK'];
        return regions.map(region => {
            const trends = this.charts.trends.get(region) || [];
            const topTrend = trends.find(t => t.trending) || trends[0] || { genre: 'Pop', popularity: 0.5, trending: false };
            
            return `
                <div class="trend-item">
                    <div class="trend-region">${region}</div>
                    <div class="trend-genre">${topTrend.genre} ${topTrend.trending ? '🔥' : '📈'}</div>
                    <div class="trend-popularity">${Math.round(topTrend.popularity * 100)}%</div>
                </div>
            `;
        }).join('');
    }

    setupRecordingEvents(modal) {
        const startBtn = modal.querySelector('#startRecordingBtn');
        const manageEquip = modal.querySelector('#manageEquipBtn');
        const compositionSelect = modal.querySelector('#selectedComposition');
        const producerSelect = modal.querySelector('#selectedProducer');
        const featSelect = modal.querySelector('#selectedFeat');
        const qualityRadios = modal.querySelectorAll('input[name="recordingQuality"]');
        
        // Função para atualizar custos
        const updateCosts = () => {
            const baseCost = 500;
            const qualityValue = modal.querySelector('input[name="recordingQuality"]:checked')?.value || 'basic';
            const qualityCosts = { basic: 0, professional: 1500, premium: 4500 };
            
            let producerCost = 0;
            if (producerSelect.value && producerSelect.value.startsWith('freelance_')) {
                const producerOption = producerSelect.querySelector('option:checked');
                producerCost = parseInt(producerOption?.dataset.cost || 0);
            }
            
            let featCost = 0;
            if (featSelect.value) {
                const featOption = featSelect.querySelector('option:checked');
                featCost = parseInt(featOption?.dataset.cost || 0);
            }
            
            const totalCost = baseCost + qualityCosts[qualityValue] + producerCost + featCost;
            
            // Atualizar display
            const producerCostEl = modal.querySelector('#producerCost');
            const featCostEl = modal.querySelector('#featCost');
            const totalCostEl = modal.querySelector('#totalCost');
            
            if (producerCost > 0) {
                producerCostEl.textContent = `Produtor: $${producerCost.toLocaleString()}`;
                producerCostEl.style.display = 'block';
            } else {
                producerCostEl.style.display = 'none';
            }
            
            if (featCost > 0) {
                featCostEl.textContent = `Feat: $${featCost.toLocaleString()}`;
                featCostEl.style.display = 'block';
            } else {
                featCostEl.style.display = 'none';
            }
            
            totalCostEl.textContent = `$${totalCost.toLocaleString()}`;
            
            // Verificar se o usuário tem dinheiro suficiente
            const playerMoney = this.getPlayerMoney();
            if (totalCost > playerMoney) {
                startBtn.disabled = true;
                startBtn.textContent = '💸 Dinheiro Insuficiente';
            } else {
                startBtn.disabled = false;
                startBtn.textContent = 'Iniciar Gravação 🎵';
            }
        };
        
        // Event listeners para atualizar custos
        producerSelect.addEventListener('change', updateCosts);
        featSelect.addEventListener('change', updateCosts);
        qualityRadios.forEach(radio => radio.addEventListener('change', updateCosts));
        
        this.addPressHandler(startBtn, () => this.processRecording(modal));
        this.addPressHandler(manageEquip, () => this.openEquipmentInline(modal));
        
        // Atualizar custos iniciais
        updateCosts();
    }

    updateTrendDisplay(modal, selectedGenre) {
        try {
            const container = modal.querySelector('#trendsDisplay');
            if (!container) return;

            // Atualiza apenas o ícone de tendência do gênero selecionado
            const trend = this.getTrendForGenre(selectedGenre);
            const trendIcon = trend > 0.7 ? '🔥' : trend > 0.4 ? '📈' : '📉';
            // Pequeno banner acima da grade
            const bannerId = 'studio-trend-banner';
            let banner = modal.querySelector(`#${bannerId}`);
            if (!banner) {
                banner = document.createElement('div');
                banner.id = bannerId;
                banner.style.cssText = 'margin: 8px 0 12px; font-size: 14px; opacity: .9;';
                container.parentElement.insertBefore(banner, container);
            }
            banner.textContent = `Tendência para ${selectedGenre}: ${Math.round(trend*100)}% ${trendIcon}`;
        } catch (_) { /* noop */ }
    }

    processRecording(modal) {
        const compositionId = modal.querySelector('#selectedComposition').value;
        const recordingQuality = modal.querySelector('input[name="recordingQuality"]:checked').value;
        const producerOption = modal.querySelector('#selectedProducer').value;
        const featOption = modal.querySelector('#selectedFeat').value;
        
        if (!compositionId) {
            this.showNotification('⚠️ Selecione uma composição para gravar', 'warning');
            return;
        }
        
        // Encontrar a composição
        const composition = this.compositions.find(c => c.id == compositionId);
        if (!composition) {
            this.showNotification('❌ Composição não encontrada', 'error');
            return;
        }
        
        // Calcular custos
        const baseCost = 500;
        const qualityCosts = { basic: 0, professional: 1500, premium: 4500 };
        const recordingCost = qualityCosts[recordingQuality];
        
        let producerCost = 0;
        let featCost = 0;
        
        if (producerOption && producerOption.startsWith('freelance_')) {
            const producerEl = modal.querySelector('#selectedProducer option:checked');
            producerCost = parseInt(producerEl?.dataset.cost || 0);
        }
        
        if (featOption) {
            const featEl = modal.querySelector('#selectedFeat option:checked');
            featCost = parseInt(featEl?.dataset.cost || 0);
        }
        
        const totalCost = baseCost + recordingCost + producerCost + featCost;
        
        if (this.getPlayerMoney() < totalCost) {
            this.showNotification(`💸 Dinheiro insuficiente. Precisa de $${totalCost.toLocaleString()}`, 'error');
            return;
        }
        
        // Processa a gravação com os dados da composição
        this.executeRecording({
            composition: composition,
            recordingQuality: recordingQuality,
            producer: producerOption,
            featArtist: featOption,
            totalCost: totalCost
        });
        
        modal.remove();
    }

    executeRecording(recordingData) {
        console.log('🎵 Executando gravação:', recordingData);
        
        const { composition, recordingQuality, producer, featArtist, totalCost } = recordingData;
        
        // Deduz o custo total
        this.gameEngine.gameData.player.money -= totalCost;
        
        // Calcula qualidade final baseada na composição + melhorias
        let finalQuality = composition.quality; // Começa com a qualidade da composição
        
        // Bônus do equipamento do estúdio
        const equipmentMultipliers = { basic: 1.0, professional: 1.2, premium: 1.4, worldClass: 1.6 };
        const equipmentBonus = (equipmentMultipliers[this.equipment?.tier || 'basic'] - 1.0) * 0.3;
        
        // Bônus da qualidade de gravação escolhida
        const recordingBonuses = { basic: 0, professional: 0.1, premium: 0.2 };
        const recordingBonus = recordingBonuses[recordingQuality];
        
        // Bônus do produtor
        let producerBonus = 0;
        if (producer && producer.startsWith('team_')) {
            producerBonus = 0.05; // Produtor da equipe dá 5% de bônus
        } else if (producer && producer.startsWith('freelance_')) {
            producerBonus = 0.15; // Produtor freelance dá 15% de bônus
        }
        
        // Bônus do feat
        let featBonus = 0;
        if (featArtist) {
            featBonus = 0.1; // Feat dá 10% de bônus
        }
        
        // Aplicar todos os bônus
        finalQuality = Math.min(1.0, finalQuality + equipmentBonus + recordingBonus + producerBonus + featBonus);
        
        // Criar a música gravada
        const song = {
            id: Date.now().toString(),
            name: composition.title,
            genre: composition.genre,
            theme: composition.theme,
            topic: composition.topic,
            quality: finalQuality,
            createdAt: new Date(),
            streams: 0,
            revenue: 0,
            recordingQuality: recordingQuality,
            producer: producer,
            featArtist: featArtist,
            // Use objeto simples para persistir corretamente em JSON
            chartPositions: {}
        };
        
        // Adiciona às músicas do jogador
        if (!this.gameEngine.gameData.player.songs) {
            this.gameEngine.gameData.player.songs = [];
        }
        this.gameEngine.gameData.player.songs.push(song);
        
        // Remove a composição da lista de pendentes
        this.compositions = this.compositions.filter(c => c.id !== composition.id);
        
        // Simula colocação inicial nos charts
    this.addSongToCharts(song);
        
        // Verifica ofertas de gravadoras
        this.checkLabelOffers();
        
        // Notificação detalhada sobre a gravação
        const qualityPercent = Math.round(finalQuality * 100);
        const improvementPercent = Math.round((finalQuality - composition.quality) * 100);
        const improvements = [];
        
        if (equipmentBonus > 0) improvements.push('Equipamentos');
        if (recordingBonus > 0) improvements.push('Gravação Pro');
        if (producerBonus > 0) improvements.push('Produtor');
        if (featBonus > 0) improvements.push('Feat');
        
        const improvementText = improvements.length > 0 ? ` (+${improvementPercent}% por ${improvements.join(', ')})` : '';
        
        this.showNotification(
            `� "${song.name}" gravada!<br>` +
            `<small>Qualidade final: ${qualityPercent}%${improvementText}<br>` +
            `💰 Custo total: $${totalCost.toLocaleString()}</small>`, 
            'success', 
            6000
        );
        
        this.updateStudioStats();
        
        // Salva o progresso
        if (this.gameEngine.systems.dataManager) {
            this.gameEngine.systems.dataManager.saveGame();
        }
    }

    addSongToCharts(song) {
        // Adiciona a música aos charts regionais baseado na qualidade e tendências
        this.charts.regions.forEach(region => {
            const regionTrends = this.charts.trends.get(region) || [];
            const genreTrend = regionTrends.find(t => t.genre === song.genre);
            const trendMultiplier = genreTrend ? genreTrend.popularity : 0.5;
            
            // Posição inicial baseada na qualidade e tendências
            const basePosition = Math.round((1 - song.quality) * 100);
            const trendAdjustment = Math.round((1 - trendMultiplier) * 30);
            const randomVariance = Math.round(Math.random() * 20 - 10);
            
            const initialPosition = Math.max(1, Math.min(100, basePosition + trendAdjustment + randomVariance));
            
            // Persistir como objeto
            song.chartPositions[region] = {
                position: initialPosition,
                lastWeekPosition: null,
                weeksOnChart: 1,
                peakPosition: initialPosition
            };
            
            // Adiciona aos charts da região
            const regionChart = this.charts.current.get(region);
            regionChart.push({
                songId: song.id,
                position: initialPosition,
                artist: this.gameEngine.gameData.player.name,
                title: song.name,
                genre: song.genre
            });
            
            // Ordena por posição
            regionChart.sort((a, b) => a.position - b.position);
            
            // Mantém apenas top 100
            if (regionChart.length > 100) {
                regionChart.splice(100);
            }
        });
    }

    checkLabelOffers() {
        const player = this.gameEngine.gameData.player;
        const songs = player.songs || [];
        
        // Verifica se o jogador atende aos requisitos de alguma gravadora
        this.labels.forEach(label => {
            if (this.meetsLabelRequirements(player, songs, label) && !player.currentLabel) {
                this.offerLabelContract(label);
            }
        });
    }

    meetsLabelRequirements(player, songs, label) {
        const req = label.requirements;
        
        // Verifica número de músicas
        if (songs.length < req.songs) return false;
        
        // Verifica qualidade média
        const avgQuality = songs.reduce((sum, song) => sum + song.quality, 0) / songs.length;
        if (avgQuality < req.quality) return false;
        
        // Verifica posição nos charts (se requerido)
        if (req.chartPosition) {
            const bestPosition = this.getBestChartPosition(songs);
            if (!bestPosition || bestPosition > req.chartPosition) return false;
        }
        
        return true;
    }

    // Helper para iterar posições de charts (compatível com Map antigo e objeto novo)
    forEachChartPosition(song, cb) {
        const cp = song.chartPositions;
        if (!cp) return;
        if (cp instanceof Map) {
            cp.forEach((data, region) => cb(region, data, 'map'));
        } else if (typeof cp === 'object') {
            Object.entries(cp).forEach(([region, data]) => cb(region, data, 'object'));
        }
    }

    getBestChartPosition(songs) {
        let bestPosition = null;
        songs.forEach(song => {
            this.forEachChartPosition(song, (_region, chartData) => {
                if (!bestPosition || chartData.peakPosition < bestPosition) {
                    bestPosition = chartData.peakPosition;
                }
            });
        });
        return bestPosition;
    }

    offerLabelContract(label) {
        const modal = window.modernModalSystem.createModal({
            id: 'label-offer-modal',
            title: '🏢 Oferta de Contrato',
            content: this.getLabelOfferHTML(label),
            type: 'standard'
        });
        window.modernModalSystem.openModal(modal);
        this.setupLabelOfferEvents(modal, label);
    }

    getLabelOfferHTML(label) {
        return `
            <div class="label-offer">
                <div class="offer-header">
                    <h3>🏢 ${label.name}</h3>
                    <p>Tem interesse em assinar um contrato com você!</p>
                </div>
                
                <div class="offer-details">
                    <div class="offer-item">
                        <strong>💰 Adiantamento:</strong>
                        <span>$${label.advance.toLocaleString()}</span>
                    </div>
                    <div class="offer-item">
                        <strong>💿 Taxa de Royalties:</strong>
                        <span>${Math.round(label.royaltyRate * 100)}%</span>
                    </div>
                    <div class="offer-item">
                        <strong>⭐ Reputação:</strong>
                        <span>${Math.round(label.reputation * 100)}%</span>
                    </div>
                </div>
                
                <div class="offer-benefits">
                    <h4>Benefícios do Contrato:</h4>
                    <ul>
                        <li>🎯 Maior exposição nas rádios</li>
                        <li>📈 Melhor posicionamento nos charts</li>
                        <li>💼 Suporte para marketing e promoção</li>
                        <li>🌍 Distribuição internacional</li>
                    </ul>
                </div>
                
                <div class="offer-actions">
                    <button class="btn-secondary" id="rejectOfferBtn">Recusar</button>
                    <button class="btn-primary" id="acceptOfferBtn">Aceitar Contrato 🤝</button>
                </div>
            </div>
        `;
    }

    setupLabelOfferEvents(modal, label) {
        const acceptBtn = modal.querySelector('#acceptOfferBtn');
        const rejectBtn = modal.querySelector('#rejectOfferBtn');
        
        acceptBtn.addEventListener('click', () => {
            this.acceptLabelContract(label);
            modal.remove();
        });
        
        rejectBtn.addEventListener('click', () => {
            this.showNotification(`Você recusou a oferta da ${label.name}`, 'info');
            modal.remove();
        });
    }

    acceptLabelContract(label) {
        const player = this.gameEngine.gameData.player;
        
        // Adiciona o adiantamento
        player.money += label.advance;
        
        // Define a gravadora atual
        player.currentLabel = {
            ...label,
            signedAt: new Date(),
            contractLength: 24 // 24 semanas (6 meses)
        };
        
        this.showNotification(`🤝 Contrato assinado com ${label.name}! Você recebeu $${label.advance.toLocaleString()} de adiantamento.`, 'success');
        this.updateStudioStats();
        
        // Salva o progresso
        if (this.gameEngine.systems.dataManager) {
            this.gameEngine.systems.dataManager.saveGame();
        }
    }

    showAnalyticsInterface() {
        const modal = window.modernModalSystem.createModal({
            id: 'analytics-modal',
            title: '📊 Analytics & Charts',
            content: this.getAnalyticsHTML(),
            type: 'analytics'
        });
        window.modernModalSystem.openModal(modal);
        this.setupAnalyticsEvents(modal);
    }

    getAnalyticsHTML() {
        const player = this.gameEngine.gameData.player;
        const songs = player.songs || [];
        
        return `
            <div class="analytics-interface">
                <div class="analytics-header">
                    <h3>📊 Suas Estatísticas Musicais</h3>
                </div>
                
                <div class="analytics-tabs">
                    <button class="tab-btn active" data-tab="charts">Charts Regionais</button>
                    <button class="tab-btn" data-tab="songs">Suas Músicas</button>
                    <button class="tab-btn" data-tab="revenue">Receita</button>
                </div>
                
                <div class="tab-content active" id="charts-tab">
                    ${this.getChartsHTML()}
                </div>
                
                <div class="tab-content" id="songs-tab">
                    ${this.getSongsHTML(songs)}
                </div>
                
                <div class="tab-content" id="revenue-tab">
                    ${this.getRevenueHTML(songs)}
                </div>
            </div>
        `;
    }

    getChartsHTML() {
        const chartsHTML = this.charts.regions.map(region => {
            const regionChart = this.charts.current.get(region) || [];
            const playerSongs = regionChart.filter(entry => entry.artist === this.gameEngine.gameData.player.name);
            
            return `
                <div class="chart-region">
                    <h4>🌍 ${region} Top 100</h4>
                    ${playerSongs.length > 0 ? `
                        <div class="player-chart-entries">
                            ${playerSongs.slice(0, 5).map(entry => `
                                <div class="chart-entry">
                                    <span class="position">#${entry.position}</span>
                                    <span class="song-info">${entry.title}</span>
                                    <span class="genre">${entry.genre}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="no-entries">Nenhuma música nos charts desta região</p>'}
                </div>
            `;
        }).join('');
        
        return chartsHTML || '<p>Charts em atualização...</p>';
    }

    getSongsHTML(songs) {
        if (songs.length === 0) {
            return '<p class="no-data">Você ainda não gravou nenhuma música. Vá ao estúdio e comece a criar!</p>';
        }
        
        return `
            <div class="songs-list">
                ${songs.map(song => `
                    <div class="song-item">
                        <div class="song-info">
                            <h4>${song.name}</h4>
                            <span class="song-genre">${song.genre} • ${song.mood}</span>
                        </div>
                        <div class="song-stats">
                            <div class="stat">
                                <span class="stat-label">Qualidade</span>
                                <span class="stat-value">${Math.round(song.quality * 100)}%</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Streams</span>
                                <span class="stat-value">${song.streams.toLocaleString()}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Receita</span>
                                <span class="stat-value">$${song.revenue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getRevenueHTML(songs) {
        const totalRevenue = songs.reduce((sum, song) => sum + song.revenue, 0);
        const totalStreams = songs.reduce((sum, song) => sum + song.streams, 0);
        const avgRevenuePerSong = songs.length > 0 ? totalRevenue / songs.length : 0;
        
        return `
            <div class="revenue-stats">
                <div class="revenue-overview">
                    <div class="revenue-item">
                        <h4>💰 Receita Total</h4>
                        <span class="revenue-value">$${totalRevenue.toLocaleString()}</span>
                    </div>
                    <div class="revenue-item">
                        <h4>🎵 Total de Streams</h4>
                        <span class="revenue-value">${totalStreams.toLocaleString()}</span>
                    </div>
                    <div class="revenue-item">
                        <h4>📊 Receita Média por Música</h4>
                        <span class="revenue-value">$${Math.round(avgRevenuePerSong).toLocaleString()}</span>
                    </div>
                </div>
                
                ${this.gameEngine.gameData.player.currentLabel ? `
                    <div class="label-info">
                        <h4>🏢 Contrato Atual</h4>
                        <div class="contract-details">
                            <p><strong>${this.gameEngine.gameData.player.currentLabel.name}</strong></p>
                            <p>Taxa de Royalties: ${Math.round(this.gameEngine.gameData.player.currentLabel.royaltyRate * 100)}%</p>
                            <p>Reputação: ${Math.round(this.gameEngine.gameData.player.currentLabel.reputation * 100)}%</p>
                        </div>
                    </div>
                ` : '<div class="no-label"><p>💼 Você é um artista independente</p></div>'}
            </div>
        `;
    }

    setupAnalyticsEvents(modal) {
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const tabContents = modal.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Remove active class from all tabs
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                btn.classList.add('active');
                const targetContent = modal.querySelector(`#${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Métodos auxiliares que precisam ser implementados
    showVocalStudio() {
        this.showNotification('🎤 Estúdio vocal em desenvolvimento', 'info');
    }

    showMixingInterface() {
        this.showNotification('🎛️ Interface de mixagem em desenvolvimento', 'info');
    }

    showCollaborationInterface() {
        this.openCollabInbox();
    }

    // Inbox de colaborações recebidas (pedidos de feat)
    openCollabInbox() {
        const items = this.collabInbox && this.collabInbox.length ? this.collabInbox : [
            { id:'c1', artist:'Nova Artista', message:'Feat em single Pop', genre:'Pop' },
            { id:'c2', artist:'MC Flow', message:'Verso em faixa Hip-Hop', genre:'Hip-Hop' }
        ];
        const html = `
            <div class="collab-inbox">
                ${items.map(it => `
                    <div class="collab-item" data-id="${it.id}">
                        <div class="ci-main">
                            <strong>${it.artist}</strong> • ${it.genre}
                            <div class="ci-msg">${it.message}</div>
                        </div>
                        <div class="ci-actions">
                            <button class="btn-secondary" data-act="reject">Recusar</button>
                            <button class="btn-primary" data-act="accept">Aceitar</button>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        const modal = window.modernModalSystem.createModal({ id:'collab-inbox', title:'👥 Colaborações Recebidas', content: html, size:'medium' });
        window.modernModalSystem.openModal(modal);
        modal.querySelectorAll('.collab-item .btn-primary').forEach(btn => {
            this.addPressHandler(btn, (e) => {
                const id = e.currentTarget.closest('.collab-item')?.dataset.id;
                this.acceptCollab(id);
                modal.remove();
            });
        });
        modal.querySelectorAll('.collab-item .btn-secondary').forEach(btn => {
            this.addPressHandler(btn, (e) => {
                const id = e.currentTarget.closest('.collab-item')?.dataset.id;
                this.rejectCollab(id);
                e.currentTarget.closest('.collab-item')?.remove();
            });
        });
    }

    acceptCollab(id) {
        this.showNotification('🤝 Colaboração aceita! Bônus aplicado na próxima gravação.', 'success');
        if (!this._acceptedCollabs) this._acceptedCollabs = new Set();
        this._acceptedCollabs.add(id);
    }
    rejectCollab(id) {
        this.showNotification('❌ Colaboração recusada.', 'info');
    }

    // Gestão de equipe (compositores, produtores etc.)
    openTeamInterface() {
        const members = this.team || [];
        const candidates = [
            { id:'t1', role:'Compositor', bonus:'+5% qualidade', cost:1500 },
            { id:'t2', role:'Produtor', bonus:'+5% eficiência', cost:2000 },
            { id:'t3', role:'Engenheiro de Áudio', bonus:'+5% masterização', cost:1800 }
        ];
        const html = `
            <div class="team-screen">
                <h4>Equipe Atual</h4>
                <div class="team-list">${members.length? members.map(m=>`<div>• ${m.role}</div>`).join('') : '<em>Ninguém na equipe ainda</em>'}</div>
                <h4 style="margin-top:12px;">Candidatos</h4>
                <div class="team-candidates">
                    ${candidates.map(c=>`<div class="cand" data-id="${c.id}">${c.role} — ${c.bonus} • $${c.cost.toLocaleString()} <button class="btn-primary" data-hire="${c.id}">Contratar</button></div>`).join('')}
                </div>
            </div>`;
        const modal = window.modernModalSystem.createModal({ id:'studio-team', title:'👥 Equipe do Estúdio', content: html, size:'medium' });
        window.modernModalSystem.openModal(modal);
        modal.querySelectorAll('[data-hire]').forEach(btn => {
            this.addPressHandler(btn, (e) => {
                const id = e.currentTarget.getAttribute('data-hire');
                const pick = candidates.find(c=>c.id===id);
                if (!pick) return;
                if (this.getPlayerMoney() < pick.cost) {
                    this.showNotification('Dinheiro insuficiente para contratar', 'error');
                    return;
                }
                this.gameEngine.gameData.player.money -= pick.cost;
                if (!this.team) this.team = [];
                this.team.push({ role: pick.role, bonus: pick.bonus });
                this.showNotification(`✅ ${pick.role} contratado(a)!`, 'success');
                modal.remove();
                this.updateStudioStats();
                this.gameEngine.systems?.dataManager?.saveGame?.();
            });
        });
    }

    // Gestão de equipamentos embutida na UI de gravação
    openEquipmentInline(modal) {
        const tiers = [
            { id:'basic', label:'Básico', mult:1.0, cost:0 },
            { id:'professional', label:'Profissional', mult:1.3, cost:15000 },
            { id:'premium', label:'Premium', mult:1.6, cost:50000 },
            { id:'worldClass', label:'World Class', mult:2.0, cost:150000 }
        ];
        const current = this.equipment?.tier || 'basic';
        const html = `
            <div class="equip-tier-list">
                ${tiers.map(t=>`<label class="tier-item">
                    <input type="radio" name="eqTier" value="${t.id}" ${t.id===current?'checked':''}>
                    <div class="tier-content"><strong>${t.label}</strong><span>Qualidade x${t.mult} • $${t.cost.toLocaleString()}</span></div>
                </label>`).join('')}
            </div>
            <div style="text-align:right; margin-top:12px;">
                <button class="btn-primary" id="saveEqTier">Salvar</button>
            </div>`;
        const m = window.modernModalSystem.createModal({ id:'equipments-inline', title:'🎛️ Equipamentos do Estúdio', content: html, size:'small' });
        window.modernModalSystem.openModal(m);
        const saveBtn = m.querySelector('#saveEqTier');
        this.addPressHandler(saveBtn, () => {
            const sel = m.querySelector('input[name="eqTier"]:checked')?.value;
            if (!sel) return;
            this.equipment.tier = sel;
            // Atualiza rótulo do modal de gravação
            try { modal.querySelector('#eqTierLabel').textContent = sel; } catch(_){ }
            this.showNotification('💽 Equipamento atualizado!', 'success');
            m.remove();
            this.updateStudioStats();
            this.gameEngine.systems?.dataManager?.saveGame?.();
        });
    }


    updateStudioStats() {
        // Atualiza as estatísticas do estúdio na interface (dashboard + cards)
        const player = this.gameEngine.gameData.player;
        const songsArr = Array.isArray(player.songs) ? player.songs : [];
        const songs = songsArr;

        // Dashboard do Estúdio
        const elSongs = document.getElementById('studioSongsCount');
        const elQuality = document.getElementById('studioAvgQuality');
        const elStreams = document.getElementById('studioTotalStreams');
        const elRevenue = document.getElementById('studioRevenue');

        if (elSongs) elSongs.textContent = String(songs.length);
        if (songs.length > 0) {
            const avgQ = songs.reduce((s, x) => s + (x.quality || 0), 0) / songs.length;
            if (elQuality) elQuality.textContent = `${Math.round((avgQ <= 1 ? avgQ*100 : avgQ) )}%`;
            const totalStreams = songs.reduce((s, x) => s + (x.streams || 0), 0);
            const totalRevenue = songs.reduce((s, x) => s + (x.revenue || 0), 0);
            if (elStreams) elStreams.textContent = totalStreams.toLocaleString();
            if (elRevenue) elRevenue.textContent = `$${Math.round(totalRevenue).toLocaleString()}`;
        } else {
            if (elQuality) elQuality.textContent = '0%';
            if (elStreams) elStreams.textContent = '0';
            if (elRevenue) elRevenue.textContent = '$0';
        }

        // Atualiza status dos cards
        const recordStatus = document.querySelector('#studioPage .record-card .nav-card-status');
        if (recordStatus) {
            const pend = (this.compositions?.length || 0);
            recordStatus.innerHTML = `<i class="fas fa-circle"></i> ${pend} Pendentes`;
        }

        const collabStatus = document.querySelector('#studioPage .collab-card .nav-card-status');
        if (collabStatus) {
            const pend = (this.collabInbox?.length || 0);
            collabStatus.innerHTML = `<i class=\"fas fa-circle\"></i> ${pend} Pedidos`;
        }

        const teamStatus = document.querySelector('#studioPage .team-card .nav-card-status');
        if (teamStatus) {
            const qtd = (this.team?.length || 0);
            teamStatus.innerHTML = `<i class=\"fas fa-circle\"></i> ${qtd} Membros`;
        }
    }

    // Métodos utilitários
    getPlayerMoney() {
        return this.gameEngine.gameData?.player?.money || 0;
    }

    // REMOVIDO: createModal antigo migrado para modernModalSystem

    showNotification(message, type = 'info') {
        // Integra com o sistema de notificação existente
        if (this.gameEngine.systems.interfaceManager && this.gameEngine.systems.interfaceManager.showNotification) {
            this.gameEngine.systems.interfaceManager.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Método chamado a cada semana para atualizar charts e revenue
    weeklyUpdate() {
        console.log('📊 Studio Manager: Weekly Update');
        this.updateCharts();
        this.calculateWeeklyRevenue();
        this.updateTrends();
        // Atualiza dashboard e cards após as mudanças semanais
        try { this.updateStudioStats(); } catch (e) { console.warn('updateStudioStats falhou após weeklyUpdate', e); }
    }

    updateCharts() {
        const player = this.gameEngine.gameData.player;
        const songs = player.songs || [];
        
        songs.forEach(song => {
            this.forEachChartPosition(song, (region, chartData, kind) => {
                // Simula mudança de posição baseada na qualidade e streams
                const momentum = this.calculateSongMomentum(song, region);
                const positionChange = Math.round(momentum * (Math.random() * 10 - 5));

                chartData.lastWeekPosition = chartData.position;
                chartData.position = Math.max(1, Math.min(100, chartData.position - positionChange));
                chartData.weeksOnChart++;

                if (chartData.position < chartData.peakPosition) {
                    chartData.peakPosition = chartData.position;
                }

                // Persistir de volta no objeto quando necessário
                if (kind === 'object') {
                    song.chartPositions[region] = chartData;
                } else if (kind === 'map') {
                    song.chartPositions.set(region, chartData);
                }
            });
        });
    }

    calculateSongMomentum(song, region) {
        // Calcula momentum baseado na qualidade, tendências e contrato
        let momentum = song.quality;
        
        // Bonus por contrato com gravadora
        if (this.gameEngine.gameData.player.currentLabel) {
            momentum += this.gameEngine.gameData.player.currentLabel.reputation * 0.3;
        }
        
        // Bonus por tendência do gênero
        const regionTrends = this.charts.trends.get(region) || [];
        const genreTrend = regionTrends.find(t => t.genre === song.genre);
        if (genreTrend && genreTrend.trending) {
            momentum += 0.2;
        }
        
        return Math.min(1.0, momentum);
    }

    calculateWeeklyRevenue() {
        const player = this.gameEngine.gameData.player;
        const songs = player.songs || [];
        
        songs.forEach(song => {
            // Calcula streams baseado na posição nos charts
            let weeklyStreams = 0;
            this.forEachChartPosition(song, (region, chartData) => {
                const regionMultiplier = this.getRegionMultiplier(region);
                const positionMultiplier = Math.max(0.1, (101 - chartData.position) / 100);
                weeklyStreams += Math.round(positionMultiplier * regionMultiplier * 10000);
            });

            song.streams += weeklyStreams;

            // Calcula receita (com desconto da gravadora se houver)
            const baseRevenue = weeklyStreams * 0.001; // $0.001 por stream
            let finalRevenue = baseRevenue;

            if (player.currentLabel) {
                finalRevenue = baseRevenue * player.currentLabel.royaltyRate;
            }

            song.revenue += finalRevenue;
            player.money += finalRevenue;
        });
    }

    getRegionMultiplier(region) {
        const multipliers = {
            'USA': 1.0,
            'Brazil': 0.8,
            'UK': 0.7,
            'Germany': 0.6,
            'Japan': 0.5,
            'Australia': 0.4
        };
        return multipliers[region] || 0.5;
    }

    updateTrends() {
        // Atualiza tendências musicais a cada semana
        this.charts.regions.forEach(region => {
            const trends = this.charts.trends.get(region);
            trends.forEach(trend => {
                // Mudança aleatória na popularidade
                trend.popularity += (Math.random() - 0.5) * 0.1;
                trend.popularity = Math.max(0, Math.min(1, trend.popularity));
                
                // Chance de se tornar trending
                trend.trending = trend.popularity > 0.7 && Math.random() > 0.8;
            });
        });
    }

    loadProjects() {
        // Carrega projetos salvos (placeholder)
        this.currentProjects = [];
    }

    // ===== SONG COMPOSER FUNCTIONS =====
    
    openSongComposer() {
        if (!window.modernModalSystem) {
            console.error('Sistema de modal moderno não disponível');
            return;
        }

        const composerContent = `
            <div class="composer-form">
                <div class="form-group">
                    <label>Título da Música</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" id="songTitle" placeholder="Digite o título da música" maxlength="50" style="flex: 1;">
                        <button type="button" id="randomTitleBtn" class="btn-secondary" style="padding: 8px 12px;">🎲</button>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Tema</label>
                        <select id="songTheme">
                            <option value="amor">💕 Amor</option>
                            <option value="festa">🎉 Festa</option>
                            <option value="nostalgia">🌅 Nostalgia</option>
                            <option value="motivacional">💪 Motivacional</option>
                            <option value="melancolia">🌧️ Melancolia</option>
                            <option value="liberdade">🦅 Liberdade</option>
                            <option value="sonhos">✨ Sonhos</option>
                            <option value="rebeldia">🔥 Rebeldia</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Assunto</label>
                        <select id="songTopic">
                            <option value="relacionamento">👫 Relacionamento</option>
                            <option value="vida-noturna">🌃 Vida Noturna</option>
                            <option value="superacao">🏆 Superação</option>
                            <option value="familia">👨‍👩‍👧‍👦 Família</option>
                            <option value="trabalho">💼 Trabalho</option>
                            <option value="juventude">🎓 Juventude</option>
                            <option value="sociedade">🏙️ Sociedade</option>
                            <option value="natureza">🌱 Natureza</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Gênero Musical</label>
                    <select id="songGenre">
                        <option value="pop">🎤 Pop</option>
                        <option value="rock">🎸 Rock</option>
                        <option value="hip-hop">🎧 Hip-Hop</option>
                        <option value="electronic">🎛️ Electronic</option>
                        <option value="r&b">🎹 R&B</option>
                        <option value="folk">🪕 Folk</option>
                        <option value="jazz">🎺 Jazz</option>
                        <option value="country">🤠 Country</option>
                    </select>
                </div>
                
                <div class="composition-preview">
                    <h4>👀 Preview da Composição</h4>
                    <div class="preview-content" id="compositionPreview">
                        <p>Selecione os elementos acima para ver como sua música ficará...</p>
                    </div>
                </div>
                
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn-primary" id="composeBtn" disabled>Compor Música 🎵</button>
                </div>
            </div>
        `;

        // Criar modal usando o Modern Modal System
        const modal = window.modernModalSystem.createModal({
            id: 'song-composer-modal',
            title: '🎵 Criar Nova Música',
            content: composerContent,
            size: 'medium'
        });

        // Adicionar classes específicas
        modal.classList.add('studio-modal', 'song-composer-modal');
        
        // Mostrar modal
        window.modernModalSystem.openModal(modal);
        
        // Setup event listeners
        this.setupComposerEvents(modal);
    }

    setupComposerEvents(modal) {
        // Event listeners para o formulário de composição
        const titleInput = modal.querySelector('#songTitle');
        const themeSelect = modal.querySelector('#songTheme');
        const topicSelect = modal.querySelector('#songTopic');
        const genreSelect = modal.querySelector('#songGenre');
        const composeBtn = modal.querySelector('#composeBtn');
        const randomTitleBtn = modal.querySelector('#randomTitleBtn');
        const preview = modal.querySelector('#compositionPreview');

        // Atualizar preview quando campos mudarem
        const updatePreview = () => {
            const title = titleInput.value.trim();
            const theme = themeSelect.value;
            const topic = topicSelect.value;
            const genre = genreSelect.value;

            // Habilitar botão apenas se título estiver preenchido
            composeBtn.disabled = !title;

            if (title && theme && topic && genre) {
                const themeText = themeSelect.options[themeSelect.selectedIndex].text;
                const topicText = topicSelect.options[topicSelect.selectedIndex].text;
                const genreText = genreSelect.options[genreSelect.selectedIndex].text;

                preview.innerHTML = `
                    <div class="preview-song">
                        <h5>"${title}"</h5>
                        <div class="song-details">
                            <span class="detail-item">Tema: ${themeText}</span>
                            <span class="detail-item">Assunto: ${topicText}</span>
                            <span class="detail-item">Gênero: ${genreText}</span>
                        </div>
                        <p class="song-concept">Uma ${genreText.toLowerCase()} sobre ${topicText.toLowerCase()} com vibe ${themeText.toLowerCase()}.</p>
                    </div>
                `;
            } else {
                preview.innerHTML = '<p>Selecione os elementos acima para ver como sua música ficará...</p>';
            }
        };

        // Bind eventos
        titleInput.addEventListener('input', updatePreview);
        themeSelect.addEventListener('change', updatePreview);
        topicSelect.addEventListener('change', updatePreview);
        genreSelect.addEventListener('change', updatePreview);

        // Botão de título aleatório
        randomTitleBtn.addEventListener('click', () => {
            this.generateRandomTitle(titleInput);
            updatePreview();
        });

        // Botão de compor
        const onCompose = () => {
            this.composeNewSong({
                title: titleInput.value.trim(),
                theme: themeSelect.value,
                topic: topicSelect.value,
                genre: genreSelect.value
            });
            // Fechar modal
            window.modernModalSystem.closeModal(modal);
        };
        this.addPressHandler(composeBtn, onCompose);

        // Preview inicial
        updatePreview();
    }

    // Helper: adiciona handler compatível com iOS evitando duplo disparo (click + touch/pointer)
    addPressHandler(element, handler) {
        if (!element) return;
        let armed = false;
        const wrap = (e) => {
            try { e.preventDefault && e.preventDefault(); } catch(_) {}
            if (armed) return;
            armed = true;
            try { handler(e); } finally {
                setTimeout(() => { armed = false; }, 250);
            }
        };
        element.addEventListener('pointerup', wrap, { passive: false });
        element.addEventListener('click', wrap, { passive: false });
        element.addEventListener('touchend', wrap, { passive: false });
    }

    // Cria uma composição e opcionalmente realiza uma gravação básica automática
    composeNewSong({ title, theme, topic, genre }) {
        try {
            if (!title) {
                this.showNotification('⚠️ Digite um título para a música', 'warning');
                return;
            }

            // Gera qualidade inicial baseada nas skills e tendências
            const initialQuality = this.calculateCompositionQuality(theme, topic, genre);
            const composition = {
                id: Date.now(),
                title,
                theme,
                topic,
                genre,
                status: 'composed',
                quality: initialQuality,
                maxQuality: Math.min(1.0, initialQuality + 0.2),
                originalQuality: initialQuality,
                createdAt: new Date(),
                improvements: []
            };

            if (!this.compositions) this.compositions = [];
            this.compositions.push(composition);

            // Notificar sucesso
            const q = Math.round(initialQuality * 100);
            this.showNotification(`🎵 "${title}" composta (${q}%). Vamos gravar!`, 'success', 4000);

            // Gravação básica automática para destravar o fluxo de validação
            const BASIC_COST = 500;
            if (this.getPlayerMoney() >= BASIC_COST) {
                this.executeRecording({
                    name: title,
                    genre,
                    mood: 'Alegre',
                    quality: 'basic',
                    cost: BASIC_COST
                });
            } else {
                this.showNotification('💸 Dinheiro insuficiente para gravar agora. Você pode gravar pelo Estúdio mais tarde.', 'info');
            }

            // Atualiza estatísticas e salva
            this.updateStudioStats();
        } catch (err) {
            console.error('❌ Erro ao compor música:', err);
            this.showNotification('❌ Erro ao compor música', 'error');
        }
    }



    generateRandomTitle(titleInput) {
        const titleTemplates = [
            "Coração {adjective}",
            "{emotion} na Noite",
            "Sonhos de {noun}",
            "{adjective} Demais",
            "Quando o {noun} Chegar",
            "Livre como {noun}",
            "{emotion} Perdido",
            "Noites de {adjective}",
            "Sem {noun}",
            "{adjective} Para Sempre"
        ];

        const adjectives = ["Selvagem", "Eterno", "Dourado", "Secreto", "Infinito", "Rebelde", "Puro", "Intenso"];
        const emotions = ["Amor", "Paixão", "Saudade", "Esperança", "Desejo", "Tristeza", "Alegria", "Melancolia"];
        const nouns = ["Vento", "Sol", "Lua", "Mar", "Estrelas", "Fogo", "Chuva", "Tempo"];

        const template = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
        let title = template
            .replace('{adjective}', adjectives[Math.floor(Math.random() * adjectives.length)])
            .replace('{emotion}', emotions[Math.floor(Math.random() * emotions.length)])
            .replace('{noun}', nouns[Math.floor(Math.random() * nouns.length)]);

        titleInput.value = title;
    }

    useLastTheme() {
        // Usa o último tema usado (implementar lógica de save)
        const lastTheme = localStorage.getItem('lastUsedTheme') || 'love';
        document.getElementById('songThemeSelect').value = lastTheme;
    }

    randomTheme() {
        const themes = ['love', 'heartbreak', 'party', 'social', 'personal', 'motivational', 'nostalgia', 'rebellion'];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        document.getElementById('songThemeSelect').value = randomTheme;
    }

    confirmSongComposition() {
        const title = document.getElementById('songTitleInput').value.trim();
        const theme = document.getElementById('songThemeSelect').value;
        const topic = document.getElementById('songTopicSelect').value;
        const genre = document.getElementById('songGenreSelect').value;

        if (!title) {
            this.showNotification('⚠️ Por favor, digite um título para a música!', 'warning');
            return;
        }

        // Cria a nova composição
        const initialQuality = this.calculateCompositionQuality(theme, topic, genre);
        const composition = {
            id: Date.now(),
            title: title,
            theme: theme,
            topic: topic,
            genre: genre,
            status: 'composed', // composed -> recorded -> produced -> released
            quality: initialQuality,
            maxQuality: Math.min(1.0, initialQuality + 0.2), // Pode melhorar até +20%
            originalQuality: initialQuality, // Qualidade original da composição
            createdAt: new Date(),
            streams: 0,
            revenue: 0,
            improvements: [] // Lista de melhorias aplicadas
        };

        // Adiciona à lista de composições não gravadas
        if (!this.compositions) {
            this.compositions = [];
        }
        this.compositions.push(composition);

        // Salva o tema usado
        localStorage.setItem('lastUsedTheme', theme);

        // Mostra sucesso
        this.showCompositionSuccess(composition);
        
        // Mostra dicas de melhoria após um tempo
        setTimeout(() => {
            this.showImprovementTips(composition);
        }, 2000);

        // Fecha o modal
        this.closeSongComposer();

        // Atualiza a interface
        this.updateStudioStats();
    }

    calculateCompositionQuality(theme, topic, genre) {
        // Qualidade baseada nas habilidades do jogador
        const player = this.gameEngine?.gameData?.player;
        let baseQuality = 0.3; // Qualidade mínima inicial
        
        if (player && player.skills) {
            // Habilidades que afetam a composição (usando nomes corretos do jogo)
            const songWriting = (player.skills.songWriting || 0) / 100; // 0-1
            const production = (player.skills.production || 0) / 100; // 0-1
            const charisma = (player.skills.charisma || 0) / 100; // 0-1
            const vocals = (player.skills.vocals || 0) / 100; // 0-1
            
            // Qualidade baseada nas habilidades (30% base + até 50% por skills)
            baseQuality += (songWriting * 0.25) + (production * 0.15) + (charisma * 0.10);
        } else {
            // Fallback se não houver player/skills
            baseQuality = 0.4 + Math.random() * 0.2; // 40-60%
        }
        
        // Pequeno fator aleatório (±5%)
        const randomFactor = (Math.random() - 0.5) * 0.1;
        baseQuality += randomFactor;
        
        // Bonus por tendências musicais atuais (+5%)
        const trendingGenres = ['pop', 'hip-hop', 'electronic'];
        if (trendingGenres.includes(genre)) {
            baseQuality += 0.05;
        }
        
        // Bonus por combinação tema/tópico (+3%)
        if (this.isGoodThemeTopicCombo(theme, topic)) {
            baseQuality += 0.03;
        }

        return Math.max(0.2, Math.min(0.8, baseQuality)); // Entre 20% e 80% para composições
    }

    isGoodThemeTopicCombo(theme, topic) {
        // Algumas combinações que funcionam bem juntas
        const goodCombos = {
            'love': ['relationships', 'memories', 'dreams'],
            'heartbreak': ['relationships', 'memories', 'struggles'],
            'party': ['freedom', 'friendship', 'success'],
            'motivational': ['success', 'dreams', 'future'],
            'nostalgia': ['memories', 'friendship', 'past']
        };
        
        return goodCombos[theme]?.includes(topic) || false;
    }

    showCompositionSuccess(composition) {
        // Cria uma notificação de sucesso
        const qualityPercent = Math.round(composition.quality * 100);
        const qualityLevel = this.getQualityLevel(composition.quality);
        
        const message = `🎵 "${composition.title}" foi composta!<br>
                        <small>Gênero: ${composition.genre.toUpperCase()} | Composição ${qualityLevel} (${qualityPercent}%)<br>
                        💡 Pode ser melhorada no estúdio e com colaborações</small>`;
        
        this.showNotification(message, 'success', 5000);
    }

    getQualityLevel(quality) {
        if (quality >= 0.8) return 'Excelente';
        if (quality >= 0.7) return 'Muito Boa';
        if (quality >= 0.6) return 'Boa';
        if (quality >= 0.5) return 'Regular';
        if (quality >= 0.4) return 'Básica';
        return 'Simples';
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Tenta usar o ToastManager do jogo primeiro
        if (window.ToastManager && typeof window.ToastManager.show === 'function') {
            window.ToastManager.show(message, type, duration);
            return;
        }

        // Fallback para o sistema de notificações do GameHub
        if (window.game?.systems?.gameHub && typeof window.game.systems.gameHub.showToast === 'function') {
            window.game.systems.gameHub.showToast(message, type, duration);
            return;
        }

        // Fallback para criar notificação customizada
        this.createCustomNotification(message, type, duration);
    }

    createCustomNotification(message, type, duration) {
        // Cria uma notificação visual customizada
        const notification = document.createElement('div');
        notification.className = `studio-notification studio-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${this.getNotificationIcon(type)}
                </div>
                <div class="notification-message">${message}</div>
            </div>
        `;

        // Adiciona estilos inline para garantir que funcione
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            background: ${this.getNotificationBg(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            max-width: 400px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remover após duração
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    getNotificationBg(type) {
        const colors = {
            success: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            error: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            warning: 'linear-gradient(135deg, #ffa726, #ff5722)',
            info: 'linear-gradient(135deg, #4facfe, #00f2fe)'
        };
        return colors[type] || colors.info;
    }

    showImprovementTips(composition) {
        const player = this.gameEngine?.gameData?.player;
        if (!player || !player.skills) return;

        const tips = [];
        const quality = composition.quality;

        // Dicas baseadas na qualidade atual
        if (quality < 0.6) {
            if ((player.skills.songWriting || 0) < 70) {
                tips.push('📝 Melhore sua habilidade de Composição para criar letras mais impactantes');
            }
            if ((player.skills.production || 0) < 60) {
                tips.push('�️ Desenvolva suas habilidades de Produção para melhorar o som');
            }
            if ((player.skills.charisma || 0) < 50) {
                tips.push('⭐ Melhore seu Carisma para criar músicas mais envolventes');
            }
            if ((player.skills.vocals || 0) < 50) {
                tips.push('� Pratique Vocal para melhorar a performance');
            }
        }

        // Dicas sobre próximos passos
        tips.push('🎤 Grave no estúdio para melhorar a produção');
        tips.push('🤝 Colabore com outros artistas para novas perspectivas');
        tips.push('🎛️ Use equipamentos melhores para maior qualidade');

        if (tips.length > 0) {
            const randomTip = tips[Math.floor(Math.random() * Math.min(2, tips.length))];
            this.showNotification(`💡 ${randomTip}`, 'info', 4000);
        }
    }

    

    // Função para abrir interface de gravação (que você já tinha)
    openRecordingInterface() {
        if (!this.compositions || this.compositions.length === 0) {
            this.showNotification('🎵 Você precisa compor algumas músicas primeiro!', 'info');
            return;
        }
        
        // Abre modal de gravação com as composições disponíveis
        // (implementar modal de seleção de composições para gravar)
        console.log('Abrindo interface de gravação...');
        this.showNotification('🎤 Interface de Gravação será implementada em breve!', 'info');
    }

    openMarketingInterface() {
        // Abre interface de marketing para músicas gravadas
        console.log('Abrindo interface de marketing...');
        this.showNotification('📢 Interface de Marketing será implementada em breve!', 'info');
    }

    openEquipmentInterface() {
        // Abre interface de equipamentos
        console.log('Abrindo interface de equipamentos...');
        this.showNotification('⚙️ Interface de Equipamentos será implementada em breve!', 'info');
    }

    // Eventos para nova interface profissional
    setupRecordingEventsPro(modal, recordingPro) {
        // Configurar carousels de estúdio e produtor
        recordingPro.setupCarousels();

        // Botão de procurar artistas para colaboração
        const collabBrowserBtn = modal.querySelector('#openCollabBrowserBtn');
        if (collabBrowserBtn) {
            collabBrowserBtn.addEventListener('click', () => {
                recordingPro.openCollabBrowser();
            });
        }

        // Atualizar custos quando seleções mudarem
        const studioInputs = modal.querySelectorAll('input[name="selectedStudio"]');
        const producerInputs = modal.querySelectorAll('input[name="selectedProducer"]');
        const compositionSelect = modal.querySelector('#selectedComposition');

        const updateCosts = () => {
            let studioCost = 0;
            let producerCost = 0;
            let collabCost = recordingPro.selectedCollabs ? 
                recordingPro.selectedCollabs.reduce((sum, collab) => sum + collab.cost, 0) : 0;

            // Calcular custo do estúdio
            const selectedStudio = modal.querySelector('input[name="selectedStudio"]:checked');
            if (selectedStudio) {
                studioCost = parseInt(selectedStudio.dataset.cost) || 0;
            }

            // Calcular custo do produtor
            const selectedProducer = modal.querySelector('input[name="selectedProducer"]:checked');
            if (selectedProducer) {
                producerCost = parseInt(selectedProducer.dataset.cost) || 0;
            }

            // Atualizar display de custos
            const studioCostDisplay = modal.querySelector('#studioCost');
            const producerCostDisplay = modal.querySelector('#producerCostDisplay');
            const collabCostDisplay = modal.querySelector('#collabCost');
            const totalCostDisplay = modal.querySelector('#totalCost');
            const collabCostItem = modal.querySelector('#collabCostItem');

            if (studioCostDisplay) studioCostDisplay.textContent = `$${studioCost.toLocaleString()}`;
            if (producerCostDisplay) producerCostDisplay.textContent = `$${producerCost.toLocaleString()}`;
            if (collabCostDisplay) collabCostDisplay.textContent = `$${collabCost.toLocaleString()}`;
            if (totalCostDisplay) totalCostDisplay.textContent = `$${(studioCost + producerCost + collabCost).toLocaleString()}`;
            
            if (collabCostItem) {
                collabCostItem.style.display = collabCost > 0 ? 'flex' : 'none';
            }

            // Calcular e mostrar qualidade estimada
            this.updateQualityPreview(modal, selectedStudio, selectedProducer, compositionSelect, recordingPro.selectedCollabs);

            // Verificar se pode pagar
            const totalCost = studioCost + producerCost + collabCost;
            const startBtn = modal.querySelector('#startRecordingBtn');
            const playerMoney = this.getPlayerMoney();
            
            if (startBtn) {
                startBtn.disabled = totalCost > playerMoney || !compositionSelect?.value;
                startBtn.textContent = totalCost > playerMoney ? 
                    '💰 Dinheiro Insuficiente' : 
                    (compositionSelect?.value ? '🎵 Iniciar Gravação' : '🎵 Selecione uma Faixa');
            }
        };

        // Eventos de mudança
        studioInputs.forEach(input => {
            input.addEventListener('change', updateCosts);
        });
        producerInputs.forEach(input => {
            input.addEventListener('change', updateCosts);
        });
        if (compositionSelect) {
            compositionSelect.addEventListener('change', updateCosts);
        }

        // Botão de iniciar gravação
        const startBtn = modal.querySelector('#startRecordingBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.executeRecordingPro(modal, recordingPro);
            });
        }

        // Calcular custos iniciais
        setTimeout(updateCosts, 100);
    }

    updateQualityPreview(modal, selectedStudio, selectedProducer, compositionSelect, selectedCollabs) {
        const qualityFill = modal.querySelector('.quality-fill');
        const qualityText = modal.querySelector('#estimatedQuality');
        
        if (!qualityFill || !qualityText || !compositionSelect?.value) {
            if (qualityFill) qualityFill.style.width = '0%';
            if (qualityText) qualityText.textContent = '--';
            return;
        }

        // Qualidade base da composição
        const composition = this.compositions.find(c => c.id === compositionSelect.value);
        let baseQuality = composition?.quality || 0.5;

        // Multiplicador do estúdio
        let studioMultiplier = 1.0;
        if (selectedStudio) {
            studioMultiplier = parseFloat(selectedStudio.dataset.multiplier) || 1.0;
        }

        // Habilidade do produtor
        let producerSkill = 0.3;
        if (selectedProducer) {
            producerSkill = parseFloat(selectedProducer.dataset.skill) || 0.3;
        }

        // Bonus de colaboração (múltiplos artistas)
        let collabBonus = 0;
        if (selectedCollabs && selectedCollabs.length > 0) {
            selectedCollabs.forEach(collab => {
                collabBonus += (collab.rating * 0.05) + (collab.hype * 0.001);
            });
            // Aplicar diminishing returns para muitos artistas
            collabBonus = collabBonus * (1 - (selectedCollabs.length - 1) * 0.1);
        }

        // Cálculo final
        let finalQuality = baseQuality * studioMultiplier * (0.7 + producerSkill * 0.3) + collabBonus;
        finalQuality = Math.min(finalQuality, 1.0); // Cap em 100%

        const qualityPercent = Math.round(finalQuality * 100);
        qualityFill.style.width = `${qualityPercent}%`;
        qualityText.textContent = `${qualityPercent}%`;
    }

    executeRecordingPro(modal, recordingPro) {
        const compositionSelect = modal.querySelector('#selectedComposition');
        const selectedStudio = modal.querySelector('input[name="selectedStudio"]:checked');
        const selectedProducer = modal.querySelector('input[name="selectedProducer"]:checked');

        if (!compositionSelect?.value) {
            this.showNotification('Selecione uma composição para gravar.', 'warning');
            return;
        }

        const composition = this.compositions.find(c => c.id === compositionSelect.value);
        if (!composition) {
            this.showNotification('Composição não encontrada.', 'error');
            return;
        }

        // Calcular custos
        const studioCost = parseInt(selectedStudio?.dataset.cost) || 0;
        const producerCost = parseInt(selectedProducer?.dataset.cost) || 0;
        const collabCost = recordingPro.selectedCollabs ? 
            recordingPro.selectedCollabs.reduce((sum, collab) => sum + collab.cost, 0) : 0;
        const totalCost = studioCost + producerCost + collabCost;

        // Verificar fundos
        if (totalCost > this.getPlayerMoney()) {
            this.showNotification('Dinheiro insuficiente para essa configuração.', 'warning');
            return;
        }

        // Aplicar bonificações conforme configuração escolhida
        const studioMultiplier = parseFloat(selectedStudio?.dataset.multiplier) || 1.0;
        const producerSkill = parseFloat(selectedProducer?.dataset.skill) || 0.3;
        let collabBonus = 0;
        if (recordingPro.selectedCollabs && recordingPro.selectedCollabs.length > 0) {
            recordingPro.selectedCollabs.forEach(collab => {
                collabBonus += (collab.rating * 0.05) + (collab.hype * 0.001);
            });
            // Aplicar diminishing returns para muitos artistas
            collabBonus = collabBonus * (1 - (recordingPro.selectedCollabs.length - 1) * 0.1);
        }

        // Processar gravação
        const recording = {
            id: 'rec_' + Date.now(),
            compositionId: composition.id,
            title: composition.title,
            genre: composition.genre,
            baseQuality: composition.quality,
            finalQuality: Math.min(composition.quality * studioMultiplier * (0.7 + producerSkill * 0.3) + collabBonus, 1.0),
            studioUsed: selectedStudio?.value || 'own',
            producerUsed: selectedProducer?.value || 'self',
            collaborations: recordingPro.selectedCollabs || [],
            costs: { studio: studioCost, producer: producerCost, collaboration: collabCost },
            totalCost: totalCost,
            recordedAt: Date.now(),
            status: 'recorded'
        };

        // Salvar gravação
        if (!this.recordings) this.recordings = [];
        this.recordings.push(recording);

        // Deduzir dinheiro
        this.gameEngine.gameData.player.money -= totalCost;

        // Marcar composição como gravada
        composition.status = 'recorded';
        composition.recordingId = recording.id;

        // Feedback
        this.showNotification(`🎵 "${recording.title}" gravada com sucesso! Qualidade: ${Math.round(recording.finalQuality * 100)}%`, 'success');

        // Fechar modal
        modal.remove();

        // Atualizar estatísticas
        this.updateStudioStats();
    }

    getPlayerMoney() {
        return this.gameEngine?.gameData?.player?.money || 0;
    }
}