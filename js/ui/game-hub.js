/**
 * Rising Star: Music Mogul - Game Hub Controller
 * Dashboard híbrido com integração ao game engine existente
 */

export class GameHub {
    constructor(game) {
        this.game = game;
        this.root = document.getElementById('gameInterface');
        this.panels = document.getElementById('hubPanels');
        this.currentTab = 'activity'; // Mudança: iniciar na aba Atividade
        this.isVisible = false;
        
        // Action Registry - sistema centralizado de ações
        this.actionRegistry = new Map();
        this._setupActionRegistry();
        
        // Bindings
        this._bind();
        
        console.log('🎮 GameHub inicializado');
    }

    show() {
        console.log('🎮 GameHub.show() chamado');
        
        if (!this.root) {
            console.error('❌ GameHub: #gameInterface não encontrado');
            return;
        }
        
        console.log('🎮 GameHub: Elemento encontrado, configurando display');
        this.root.style.display = 'block';
        this.isVisible = true;
        
        // Esconder outras telas
        const mainMenu = document.getElementById('mainMenu');
        const charCreation = document.getElementById('characterCreation');
        
        if (mainMenu) {
            mainMenu.style.setProperty('display', 'none');
            console.log('🎮 Main menu escondido');
        }
        
        if (charCreation) {
            charCreation.style.setProperty('display', 'none');
            console.log('🎮 Character creation escondido');
        }
        
        // Renderizar conteúdo inicial
        console.log('🎮 Renderizando conteúdo inicial...');
        this.updateProfileInfo();
    // Inicializar upload de avatar (apenas uma vez)
    try { this._initAvatarUpload(); } catch(e) { console.warn('Falha init upload avatar:', e); }
        // Forçar atualização de métricas imediatamente (garante dinheiro abreviado no primeiro frame)
        try {
            this.updateMetrics();
            this.updateResources();
        } catch (e) {
            console.warn('⚠️ Falha atualização imediata em show():', e);
        }
        
        // Garantir que a aba Atividade esteja ativa
        const activityTab = document.querySelector('.tab-btn[data-tab="activity"]');
        if (activityTab) {
            [...document.querySelectorAll('.tab-btn')].forEach(btn => 
                btn.classList.toggle('active', btn === activityTab)
            );
        }
        
        // Atualizar título inicial
        const titleEl = document.getElementById('currentViewTitle');
        if (titleEl) {
            titleEl.textContent = 'Atividade';
        }
        
        this.renderCurrent();
        
        console.log('✅ GameHub exibido com sucesso');
    }

    hide() {
        if (this.root) {
            this.root.style.display = 'none';
            this.isVisible = false;
        }
    }

    _bind() {
        // Action handler global - delega para actionRegistry
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (!actionBtn) return;
            
            const action = actionBtn.dataset.action;
            this.invokeAction(action, actionBtn);
        });

        // Navegação por tabs
        document.getElementById('hubTabs')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;
            
            const tab = btn.dataset.tab;
            if (tab === this.currentTab) return;
            
            this.currentTab = tab;
            [...e.currentTarget.querySelectorAll('.tab-btn')].forEach(b => 
                b.classList.toggle('active', b === btn)
            );
            
            // Atualizar título da view
            const titleEl = document.getElementById('currentViewTitle');
            if (titleEl) {
                const titles = {
                    'activity': 'Atividade',
                    'resources': 'Recursos', 
                    'goals': 'Metas',
                    'feed': 'Feed',
                    'career': 'Carreira',
                    'streaming': 'Streaming',
                    'economy': 'Economia'
                };
                titleEl.textContent = titles[tab] || 'Dashboard';
            }
            
            this.renderCurrent();
        });

        // Collapse sidebar
        document.getElementById('collapseProfile')?.addEventListener('click', () => {
            const side = document.getElementById('sideProfile');
            side?.classList.toggle('collapsed');
            const btn = document.getElementById('collapseProfile');
            if (btn) {
                btn.textContent = side?.classList.contains('collapsed') ? 'Expandir ▼' : 'Recolher ▲';
            }
        });

        // Ações rápidas
        document.getElementById('sideProfile')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.qa-btn');
            if (!btn) return;
            
            const action = btn.dataset.action;
            this._handleQuickAction(action);
        });

        // Mobile navigation
        document.getElementById('mobileNav')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.m-btn');
            if (!btn) return;
            
            const view = btn.dataset.view;
            this._handleMobileNav(view);
        });

        // Notificações
        document.getElementById('openNotifications')?.addEventListener('click', () => {
            this._showNotificationsModal();
        });

        // Resize handler para alternar perfil inline
        window.addEventListener('resize', () => {
            const inlineBar = document.getElementById('inlineProfileBar');
            if (!inlineBar) return;
            if (window.innerWidth <= 1000) {
                inlineBar.style.display = 'flex';
            } else {
                inlineBar.style.display = 'none';
            }
        });
    }

    // Action Registry - Sistema centralizado de ações
    _setupActionRegistry() {
        // Ações de criação musical
        this.actionRegistry.set('create-song', () => this._createSong());
        this.actionRegistry.set('create-ep', () => this._createEP());
        this.actionRegistry.set('create-album', () => this._createAlbum());
        this.actionRegistry.set('create-joint-album', () => this._createJointAlbum());
        this.actionRegistry.set('create-compilation', () => this._createCompilation());
        
        // Ações de contratação e colaboração
        this.actionRegistry.set('hire-composer', () => this._hireComposer());
        this.actionRegistry.set('unreleased-songs', () => this._showUnreleasedSongs());
        
        // Ações de treinamento e desenvolvimento
        this.actionRegistry.set('practice', () => this._practice());
        this.actionRegistry.set('train', () => this._practice()); // Alias
        
        // Ações de shows e eventos
        this.actionRegistry.set('gig-hub', () => this._openGigHub());
        this.actionRegistry.set('create-setlist', () => this._createSetlist());
        this.actionRegistry.set('ticket-gods', () => this._openTicketSales());
        
        // Ações de merchandising
        this.actionRegistry.set('create-merch', () => this._createMerch());
        
        // Ações de biblioteca de conteúdo
        this.actionRegistry.set('open-songs', () => this._openSongsLibrary());
        this.actionRegistry.set('open-albums', () => this._openAlbumsLibrary());
        this.actionRegistry.set('open-videos', () => this._openVideosLibrary());
        
        // Ações de promoção social
        this.actionRegistry.set('promo-instagram', () => this._promoInstagram());
        this.actionRegistry.set('promo-tiktok', () => this._promoTikTok());
        this.actionRegistry.set('promo-youtube', () => this._promoYouTube());
        this.actionRegistry.set('promo-twitter', () => this._promoTwitter());
        
        // Ações rápidas existentes (compatibilidade)
        this.actionRegistry.set('create-track', () => this._createSong()); // Alias
        this.actionRegistry.set('show-offers', () => this._showOffers());
        this.actionRegistry.set('create-label', () => this._createLabel());
    }

    invokeAction(actionName, element = null) {
        const handler = this.actionRegistry.get(actionName);
        if (handler) {
            console.log(`🎮 Executando ação: ${actionName}`);
            try {
                handler(element);
            } catch (error) {
                console.error(`❌ Erro ao executar ação ${actionName}:`, error);
                this._showNotification(`Erro ao executar ${actionName}`, 'error');
            }
        } else {
            console.warn(`⚠️ Ação não encontrada: ${actionName}`);
            this._showNotification(`Ação "${actionName}" não implementada`, 'warning');
        }
    }

    renderCurrent() {
        if (!this.panels) return;
        
        switch (this.currentTab) {
            case 'activity': return this.renderActivity(); // Nova aba
            case 'overview': return this.renderOverview();
            case 'resources': return this.renderResources();
            case 'feed': return this.renderFeed();
            case 'goals': return this.renderGoals();
            case 'career': return this.renderCareer();
            case 'streaming': return this.renderStreaming();
            case 'economy': return this.renderEconomy();
            default: return this.renderActivity(); // Default para atividade
        }
    }

    renderActivity() {
        // Esconder outros painéis e mostrar apenas o de atividade
        const allPanels = document.querySelectorAll('.hub-panel');
        allPanels.forEach(panel => panel.style.display = 'none');
        
        const activityPanel = document.getElementById('panel-activity');
        if (activityPanel) {
            activityPanel.style.display = 'block';
        }
        
        // Atualizar dados dinâmicos
        const ovrEl = document.getElementById('activity-ovr');
        if (ovrEl && this.game?.player) {
            // Calcular OVR baseado nas skills do player
            const skills = this.game.player.skills || {};
            const ovr = Math.round((
                (skills.vocals || 1) + 
                (skills.songWriting || 1) + 
                (skills.rhythm || 1) + 
                (skills.charisma || 1) + 
                (skills.virality || 1) + 
                (skills.videoDirecting || 1)
            ) / 6);
            ovrEl.textContent = ovr;
        }
    }

    renderOverview() {
        this.panels.innerHTML = `
            ${this._metricCard('Fama', 'fame')}
            ${this._metricCard('Seguidores Totais', 'listeners')}
            ${this._metricCard('Patrimônio', 'netWorth')}
            ${this._metricCard('Nível Carreira', 'careerLevel', true)}
            
            <div class="hub-card panel-full" id="resourcesPanel">
                <h3>Recursos do Artista</h3>
                <div class="resource-bars">
                    ${this._resourceRow('Criatividade', 'creativity')}
                    ${this._resourceRow('Energia', 'energy')}
                    ${this._resourceRow('Moral', 'morale')}
                </div>
            </div>
            
            <div class="hub-card panel-full" id="feedPanel">
                <h3>Eventos Recentes</h3>
                <ul class="feed-list" id="feedList"></ul>
                <button class="see-more-feed" data-action="more-feed">Ver mais eventos</button>
            </div>
        `;
        
        this.updateAll();
    }

    renderResources() {
        this.panels.innerHTML = `
            <div class="hub-card panel-full">
                <h3>Recursos do Artista</h3>
                <div class="resource-bars">
                    ${this._resourceRow('Criatividade', 'creativity')}
                    ${this._resourceRow('Energia', 'energy')}
                    ${this._resourceRow('Moral', 'morale')}
                </div>
            </div>
        `;
        this.updateResources();
    }

    renderFeed() {
        this.panels.innerHTML = `
            <div class="hub-card panel-full">
                <h3>Feed de Eventos</h3>
                <ul class="feed-list" id="feedList"></ul>
            </div>
        `;
        this.updateFeed();
    }

    renderGoals() {
        this.panels.innerHTML = `
            <div class="hub-card panel-full">
                <h3>Metas e Objetivos</h3>
                <ul class="goals-list" id="goalsList"></ul>
            </div>
        `;
        this.updateGoals();
    }

    renderCareer() {
        this.panels.innerHTML = `
            <div class="hub-card panel-full">
                <h3>Progresso de Carreira</h3>
                <p>Sistema de carreira em desenvolvimento...</p>
            </div>
        `;
    }

    renderStreaming() {
        this.panels.innerHTML = `
            <div class="hub-card panel-full">
                <h3>Streaming e Audiência</h3>
                <p>Estatísticas de streaming em desenvolvimento...</p>
            </div>
        `;
    }

    renderEconomy() {
        this.panels.innerHTML = `
            <div class="hub-card panel-full">
                <h3>Economia e Finanças</h3>
                <p>Sistema econômico em desenvolvimento...</p>
            </div>
        `;
    }

    // ===== TEMPLATES =====
    _metricCard(label, key, progress = false) {
        return `
            <div class="hub-card metric-big" data-metric="${key}">
                <h3>${label}</h3>
                <div class="metric-value" id="${key}Value">0</div>
                <div class="metric-delta" id="${key}Delta">—</div>
                ${progress ? `<div class="progress-line"><div class="progress-fill" id="${key}Progress" style="width:0%"></div></div>` : ''}
            </div>
        `;
    }

    _resourceRow(label, key) {
        return `
            <div class="resource-row" data-res="${key}">
                <span>${label}</span>
                <div class="bar">
                    <div class="fill" id="${key}Fill" style="width:0%"></div>
                </div>
                <span class="val" id="${key}Val">0/100</span>
            </div>
        `;
    }

    // ===== ATUALIZAÇÕES =====
    updateAll() {
        this.updateMetrics();
        this.updateResources();
        this.updateFeed();
        this.updateTimeInfo();
    }

    updateProfileInfo() {
        const p = this.game?.gameData?.player || this.game?.player || {};

        // Fallback: se não houver avatar em p mas existir em localStorage, injeta
        if (!p.avatarImage) {
            try {
                const storedDirect = localStorage.getItem('playerAvatarImage');
                if (storedDirect) { p.avatarImage = storedDirect; }
            } catch(storageReadErr) { /* silencioso */ }
        }
        
        // Sidebar profile
        this._setText('artistStageName', p.artistName || p.name || 'Novo Artista');
        this._setText('artistRoleGenre', `${p.role || 'Cantor(a)'} • ${p.genre || 'R&B'}`);
        // Inline mobile
        this._setText('artistStageNameInline', p.artistName || p.name || 'Novo Artista');
        this._setText('artistRoleGenreInline', `${p.role || 'Cantor(a)'} • ${p.genre || 'R&B'}`);
        
        // ===== Avatar usando <img> para evitar conflitos de CSS com background =====
        const applyAvatar = (containerId) => {
            const el = document.getElementById(containerId);
            if (!el) return;
            const artistLetter = (p.artistName || p.name || '🎵').charAt(0).toUpperCase();
            if (p.avatarImage) {
                let img = el.querySelector('img.player-avatar-img');
                if (!img) {
                    img = document.createElement('img');
                    img.className = 'player-avatar-img';
                    // Limpa qualquer conteúdo textual/emoji
                    el.innerHTML = '';
                    el.appendChild(img);
                }
                if (img.getAttribute('src') !== p.avatarImage) {
                    img.src = p.avatarImage;
                }
                el.classList.add('has-image');
                // Segurança: se der erro ao carregar a imagem, volta para a letra
                img.onerror = () => {
                    console.warn('Falha ao carregar avatar, revertendo para letra.');
                    el.classList.remove('has-image');
                    el.innerHTML = artistLetter;
                };
            } else {
                // Sem imagem: mostra inicial
                el.classList.remove('has-image');
                // Evita recriar se já é apenas a letra
                if (el.textContent !== artistLetter || el.children.length) {
                    el.innerHTML = artistLetter;
                }
            }
        };

        applyAvatar('newDesktopAvatar');
        applyAvatar('newMobileAvatar');

    // (debug removido)

        // Mostrar barra inline em telas pequenas
        const inlineBar = document.getElementById('inlineProfileBar');
        if (inlineBar) {
            if (window.innerWidth <= 1000) {
                inlineBar.style.display = 'flex';
            } else {
                inlineBar.style.display = 'none';
            }
        }
    }

    /**
     * Inicializa o fluxo de upload do avatar do jogador.
     * - Abre seletor de arquivo ao clicar no botão editar
     * - Valida tipo e tamanho (<= 2MB)
     * - Converte para DataURL e salva em gameData + localStorage
     * - Re-renderiza avatar principal e inline
     * - Carrega avatar salvo no primeiro init se existir
     */
    _initAvatarUpload() {
        if (this._avatarUploadInitialized) return; // evita múltiplos binds
        const editBtn = document.getElementById('editAvatarBtn');
        const fileInput = document.getElementById('avatarFileInput');
        const avatarClickable = document.getElementById('newDesktopAvatar');
        const avatarInlineClickable = document.getElementById('newMobileAvatar');
        if (!editBtn || !fileInput) return; // elementos não presentes ainda

        const openPicker = (e) => { e.preventDefault(); fileInput.click(); };
        editBtn.addEventListener('click', openPicker);
        if (avatarClickable) avatarClickable.addEventListener('click', openPicker);
        if (avatarInlineClickable) avatarInlineClickable.addEventListener('click', openPicker);

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                this.pushToast('Arquivo inválido. Selecione uma imagem.');
                fileInput.value = '';
                return;
            }
            const maxBytes = 2 * 1024 * 1024; // 2MB
            if (file.size > maxBytes) {
                this.pushToast('Imagem muito grande (máx 2MB).');
                fileInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result;
                try {
                    const player = this.game?.gameData?.player || this.game?.player;
                    if (player) {
                        player.avatarImage = dataUrl;
                    }
                    try { localStorage.setItem('playerAvatarImage', dataUrl); } catch(storageErr) { /* ignore */ }
                    this.updateProfileInfo();
                    this.pushToast('Avatar atualizado');
                } catch(err) {
                    console.error('Erro aplicando avatar:', err);
                    this.pushToast('Falha ao atualizar avatar');
                }
            };
            reader.readAsDataURL(file);
        });

        // Carregar avatar salvo previamente (uma vez)
        try {
            const stored = localStorage.getItem('playerAvatarImage');
            if (stored) {
                const player = this.game?.gameData?.player || this.game?.player;
                if (player && !player.avatarImage) {
                    player.avatarImage = stored;
                    this.updateProfileInfo();
                }
            }
        } catch(loadErr) {
            console.warn('Não foi possível carregar avatar salvo:', loadErr);
        }

        this._avatarUploadInitialized = true;
    }

    updateMetrics() {
        const p = this.game?.gameData?.player || this.game?.player || {};
        
        // Sidebar stats
        this._setText('statFame', this._formatNumber(p.fame || 0));
        this._setText('statListeners', this._formatNumber(p.monthlyListeners || 0));
        this._setText('statHype', this._formatNumber(p.hype || 0));
    this._setText('statMoney', this._formatMoney(p.money || 0));
    // Inline stats
    this._setText('statFameInline', this._formatNumber(p.fame || 0));
    this._setText('statListenersInline', this._formatNumber(p.monthlyListeners || 0));
    this._setText('statMoneyInline', this._formatMoney(p.money || 0));
        
        // Main metrics
        this._setText('fameValue', this._formatNumber(p.fame || 0));
        this._setText('listenersValue', this._formatNumber(p.monthlyListeners || 0));
    this._setText('netWorthValue', this._formatMoney(p.money || 0));
        this._setText('careerLevelValue', p.careerLevel || 1);
        
        // Career progress
        const progress = ((p.careerXP || 0) / (p.careerNextXP || 100)) * 100;
        this._setProgress('careerLevelProgress', progress);
        this._setProgress('careerLevelFill', progress);
    }

    updateResources() {
        const p = this.game?.gameData?.player || this.game?.player || {};
        
        this._fillResource('creativity', p.creativity || 75);
        this._fillResource('energy', p.energy || 85);
        this._fillResource('morale', p.morale || 90);
    }

    updateFeed() {
        const feedList = document.getElementById('feedList');
        if (!feedList) return;
        
        // Obter eventos do engine
        let events = [];
        if (this.game?.getRecentActivities) {
            events = this.game.getRecentActivities(8);
        } else if (this.game?.gameData?.events) {
            events = this.game.gameData.events.slice(-8).reverse();
        }
        
        if (events.length === 0) {
            events = [
                { message: 'Bem-vindo ao Rising Star!' },
                { message: 'Sua jornada musical começa agora.' }
            ];
        }
        
        feedList.innerHTML = events.map(e => 
            `<li class="feed-item">${e.message || e}</li>`
        ).join('');
    }

    updateGoals() {
        const goalsList = document.getElementById('goalsList');
        if (!goalsList) return;
        
        // Goals placeholder
        const goals = [
            { title: 'Alcançar 1.000 seguidores', progress: 0, target: 1000 },
            { title: 'Lançar primeira música', progress: 0, target: 1 },
            { title: 'Ganhar $5.000', progress: 0, target: 5000 }
        ];
        
        goalsList.innerHTML = goals.map(g => `
            <li class="goal-row">
                <div>${g.title}</div>
                <div class="goal-progress">
                    <div class="fill" style="width:${Math.min(100, (g.progress / g.target) * 100)}%"></div>
                </div>
            </li>
        `).join('');
    }

    updateTimeInfo() {
        const gameData = this.game?.gameData;
        if (gameData?.currentDate) {
            const date = new Date(gameData.currentDate);
            const week = Math.floor((Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
            this._setText('weekIndicator', `Semana ${week}`);
            
            const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            this._setText('dayIndicator', days[date.getDay()]);
        }
    }

    // ===== IMPLEMENTAÇÕES DE AÇÕES ===== 

    // Ações de criação musical
    _createSong() {
        this._showNotification('Criando nova música...', 'info');
        // TODO: Integrar com sistema de criação de música
        if (this.game?.createTrack) {
            this.game.createTrack();
        } else {
            console.log('🎵 Sistema de criação de música será implementado');
        }
    }

    _createEP() {
        this._showNotification('Criando novo EP...', 'info');
        console.log('� Sistema de criação de EP será implementado');
    }

    _createAlbum() {
        this._showNotification('Criando novo álbum...', 'info');
        console.log('🎵 Sistema de criação de álbum será implementado');
    }

    _createJointAlbum() {
        this._showNotification('Criando álbum conjunto...', 'info');
        console.log('🎵 Sistema de álbum conjunto será implementado');
    }

    _createCompilation() {
        this._showNotification('Criando compilação...', 'info');
        console.log('🎵 Sistema de compilação será implementado');
    }

    // Ações de contratação
    _hireComposer() {
        this._showNotification('Contratando compositor...', 'info');
        console.log('👥 Sistema de contratação será implementado');
    }

    _showUnreleasedSongs() {
        this._showNotification('Mostrando músicas não lançadas...', 'info');
        console.log('🎵 Sistema de músicas não lançadas será implementado');
    }

    // Ações de treinamento
    _practice() {
        this._showNotification('Iniciando treino...', 'info');
        // TODO: Integrar com sistema de treinamento
        if (this.game?.train) {
            this.game.train();
        } else {
            console.log('💪 Sistema de treinamento será implementado');
        }
    }

    // Ações de shows
    _openGigHub() {
        this._showNotification('Abrindo Gig Hub...', 'info');
        console.log('🎤 Sistema de shows será implementado');
    }

    _createSetlist() {
        this._showNotification('Criando setlist...', 'info');
        console.log('📝 Sistema de setlist será implementado');
    }

    _openTicketSales() {
        this._showNotification('Abrindo venda de ingressos...', 'info');
        console.log('🎫 Sistema de ingressos será implementado');
    }

    // Ações de merchandising
    _createMerch() {
        this._showNotification('Criando merchandising...', 'info');
        console.log('👕 Sistema de merchandising será implementado');
    }

    // Ações de biblioteca
    _openSongsLibrary() {
        this._showNotification('Abrindo biblioteca de músicas...', 'info');
        console.log('🎵 Biblioteca de músicas será implementada');
    }

    _openAlbumsLibrary() {
        this._showNotification('Abrindo biblioteca de álbuns...', 'info');
        console.log('💿 Biblioteca de álbuns será implementada');
    }

    _openVideosLibrary() {
        this._showNotification('Abrindo biblioteca de vídeos...', 'info');
        console.log('🎬 Biblioteca de vídeos será implementada');
    }

    // Ações de promoção social
    _promoInstagram() {
        this._showNotification('Promovendo no Instagram...', 'info');
        console.log('📸 Promoção Instagram será implementada');
    }

    _promoTikTok() {
        this._showNotification('Promovendo no TikTok...', 'info');
        console.log('🎵 Promoção TikTok será implementada');
    }

    _promoYouTube() {
        this._showNotification('Promovendo no YouTube...', 'info');
        console.log('📺 Promoção YouTube será implementada');
    }

    _promoTwitter() {
        this._showNotification('Promovendo no Twitter...', 'info');
        console.log('🐦 Promoção Twitter será implementada');
    }

    // Ações rápidas existentes
    _showOffers() {
        this._showNotification('Mostrando ofertas...', 'info');
        console.log('💼 Sistema de ofertas será implementado');
    }

    _createLabel() {
        this._showNotification('Criando label...', 'info');
        console.log('🏢 Sistema de criação de label será implementado');
    }

    // Método auxiliar para notificações
    _showNotification(message, type = 'info') {
        this.pushToast(message);
    }

    // ===== AÇÕES LEGADAS (COMPATIBILIDADE) =====
    _handleQuickAction(action) {
        console.log('🎮 Ação rápida (legado):', action);
        this.invokeAction(action);
    }

    _handleMobileNav(view) {
        console.log('📱 Navegação mobile:', view);
        
        // Atualizar visual
        [...document.querySelectorAll('.m-btn')].forEach(btn => 
            btn.classList.toggle('active', btn.dataset.view === view)
        );
        
        // Mapear views mobile para tabs desktop
        const viewToTab = {
            'profile': 'activity', // Home mobile = Atividade desktop
            'activity': 'activity',
            'overview': 'overview',
            'studio': 'resources',
            'social': 'feed',
            'more': 'economy'
        };
        
        const targetTab = viewToTab[view] || 'activity';
        
        // Atualizar tab ativa se diferente
        if (this.currentTab !== targetTab) {
            this.currentTab = targetTab;
            
            // Atualizar visualmente as tabs desktop
            [...document.querySelectorAll('.tab-btn')].forEach(btn => 
                btn.classList.toggle('active', btn.dataset.tab === targetTab)
            );
            
            // Atualizar título
            const titleEl = document.getElementById('currentViewTitle');
            if (titleEl) {
                const titles = {
                    'activity': 'Atividade',
                    'overview': 'Visão Geral',
                    'resources': 'Recursos', 
                    'goals': 'Metas',
                    'feed': 'Feed',
                    'career': 'Carreira',
                    'streaming': 'Streaming',
                    'economy': 'Economia'
                };
                titleEl.textContent = titles[targetTab] || 'Dashboard';
            }
            
            this.renderCurrent();
        }
    }

    _showNotificationsModal() {
        // Placeholder - integrar com sistema existente
        this.pushToast('Modal de notificações em desenvolvimento');
    }

    // ===== UTILITÁRIOS =====
    _setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    _setProgress(id, percent) {
        const el = document.getElementById(id);
        if (el) el.style.width = Math.min(100, Math.max(0, percent)) + '%';
    }

    _fillResource(key, value) {
        const fill = document.getElementById(key + 'Fill');
        const val = document.getElementById(key + 'Val');
        
        if (fill) fill.style.width = Math.min(100, Math.max(0, value)) + '%';
        if (val) val.textContent = `${Math.round(value)}/100`;
    }

    _formatNumber(num) {
        if (!Number.isFinite(num)) return '0';
        const abs = Math.abs(num);
        if (abs >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/,'') + 'B';
        if (abs >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/,'') + 'M';
        if (abs >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/,'') + 'K';
        return num.toString();
    }

    _formatMoney(num) {
        if (!Number.isFinite(num)) return '$0';
        const abs = Math.abs(num);
        const sign = num < 0 ? '-' : '';
        if (abs < 1000) return sign + '$' + abs.toString();
        if (abs < 10_000) { // 1.2K estilo $1.2K
            return sign + '$' + (abs/1000).toFixed(2).replace(/0$/,'').replace(/\.0$/,'') + 'K';
        }
        if (abs < 100_000) { // $15.2K
            return sign + '$' + (abs/1000).toFixed(1).replace(/\.0$/,'') + 'K';
        }
        if (abs < 1_000_000) { // $200K
            return sign + '$' + Math.round(abs/1000) + 'K';
        }
        if (abs < 10_000_000) { // $1.2M
            return sign + '$' + (abs/1_000_000).toFixed(1).replace(/\.0$/,'') + 'M';
        }
        if (abs < 1_000_000_000) { // $12M
            return sign + '$' + Math.round(abs/1_000_000) + 'M';
        }
        return sign + '$' + (abs/1_000_000_000).toFixed(1).replace(/\.0$/,'') + 'B';
    }

    pushToast(message, type = 'info') {
        const stack = document.getElementById('hubNotificationContainer');
        if (!stack) return;
        
        const toast = document.createElement('div');
        toast.className = `hub-toast ${type}`;
        toast.textContent = message;
        
        stack.appendChild(toast);
        
        // Auto-remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 4500);
        
        console.log('🔔 Toast:', message);
    }

    // ===== INTEGRAÇÃO COM ENGINE =====
    onGameTick() {
        if (this.isVisible) {
            this.updateAll();
        }
    }

    onPlayerUpdate() {
        if (this.isVisible) {
        this.updateProfileInfo();
        this._initAvatarUpload();
            this.updateMetrics();
            this.updateResources();
        }
    }

    onEventAdded(event) {
        if (this.isVisible && this.currentTab === 'feed') {
            this.updateFeed();
        }
        
        // Mostrar toast para eventos importantes
        if (event.type === 'music_released' || event.type === 'achievement') {
            this.pushToast(event.message || 'Novo evento!');
        }
    }
}

// Global initialization function
if (typeof window !== 'undefined') {
    window.GameHub = GameHub;
    
    window.initGameHub = function() {
        if (!window.game) {
            console.warn('⚠️ GameHub: window.game não disponível');
            return;
        }
        
        if (window.gameHub) {
            console.log('ℹ️ GameHub já inicializado');
            return;
        }
        
        window.gameHub = new GameHub(window.game);
        
        // Integrar com eventos do game engine se existir
        if (window.game.addEventListener) {
            window.game.addEventListener('tick', () => window.gameHub.onGameTick());
            window.game.addEventListener('playerUpdate', () => window.gameHub.onPlayerUpdate());
            window.game.addEventListener('eventAdded', (e) => window.gameHub.onEventAdded(e.detail));
        }
        
        console.log('✅ GameHub integrado globalmente');
    };
}
