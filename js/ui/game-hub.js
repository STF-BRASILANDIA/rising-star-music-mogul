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
            this.updateTimeInfo();
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

    // Determina o profileId atual para escopar dados por save
    _getCurrentProfileId() {
        try {
            const dm = this.game?.systems?.dataManager;
            if (dm && typeof dm.getProfileSaveId === 'function') {
                return dm.getProfileSaveId(this.game?.gameData || {});
            }
            // Fallback: tentar do próprio player
            const p = this.game?.gameData?.player || this.game?.player;
            return p?.profileId || null;
        } catch (_) { return null; }
    }

    _getAvatarStorageKey() {
        const pid = this._getCurrentProfileId();
        return pid ? `playerAvatarImage::${pid}` : null;
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
            
            // Desktop: tab-nav só deve aparecer na HOME (profile)
            if (window.innerWidth >= 1024) {
                const tabsNav = document.getElementById('hubTabs');
                if (tabsNav) tabsNav.style.display = (tab === 'profile') ? '' : 'none';
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

        // Mobile/Bottom navigation (ambos footers)
        document.getElementById('mobileNav')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.m-btn');
            if (!btn) return;
            // Intercepta no desktop para evitar handlers antigos
            if (window.innerWidth >= 1024) { e.preventDefault(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
            const view = btn.dataset.view;
            this._handleMobileNav(view);
        });
        document.getElementById('studioMobileNav')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.m-btn');
            if (!btn) return;
            // Intercepta no desktop para evitar handlers antigos
            if (window.innerWidth >= 1024) { e.preventDefault(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
            const view = btn.dataset.view;
            this._handleMobileNav(view);
        });

        // Captura global: garante que em qualquer menu inferior a navegação desktop seja forçada
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.m-btn');
            if (!btn) return;
            if (window.innerWidth < 1024) return; // mobile segue fluxo normal
            e.preventDefault();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            const view = btn.dataset.view;
            this._handleMobileNav(view);
        }, true);

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
        
        // No desktop, renderCurrent só executa para activity (quando em home)
        if (window.innerWidth >= 1024 && this.currentTab !== 'activity') {
            return;
        }
        
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
        
        const activityPanel = document.getElementById('panel-profile');
        if (activityPanel) {
            activityPanel.style.display = 'block';
        }
        
        // Atualizar dados dinâmicos
        const ovrEl = document.getElementById('activity-ovr');
        if (ovrEl && this.game?.player) {
            // 🎯 SKILLS: USAR FONTE ÚNICA window.game.gameData.player.skills
            const skills = (window?.game?.gameData?.player?.skills) || this.game.player.skills || {};
            console.log('🎯 GameHub: Skills carregadas de', window?.game?.gameData?.player?.skills ? 'window.game.gameData.player.skills' : 'fallback this.game.player.skills');
            
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
        // No desktop, não renderizar - usar páginas especiais
        if (window.innerWidth >= 1024) return;
        
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
        // No desktop, não renderizar - usar páginas especiais
        if (window.innerWidth >= 1024) return;
        
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
        // No desktop, não renderizar - usar páginas especiais
        if (window.innerWidth >= 1024) return;
        
        this.panels.innerHTML = `
            <div class="hub-card panel-full">
                <h3>Feed de Eventos</h3>
                <ul class="feed-list" id="feedList"></ul>
            </div>
        `;
        this.updateFeed();
    }

    renderGoals() {
        // No desktop, não renderizar - usar páginas especiais
        if (window.innerWidth >= 1024) return;
        
        this.panels.innerHTML = `
            <div class="hub-card panel-full">
                <h3>Metas e Objetivos</h3>
                <ul class="goals-list" id="goalsList"></ul>
            </div>
        `;
        this.updateGoals();
    }

    renderCareer() {
        // No desktop, não renderizar - usar páginas especiais
        if (window.innerWidth >= 1024) return;
        
        this.panels.innerHTML = `
            <div class="hub-card panel-full">
                <h3>Progresso de Carreira</h3>
                <p>Sistema de carreira em desenvolvimento...</p>
            </div>
        `;
    }

    renderStreaming() {
        // No desktop, não renderizar - usar páginas especiais
        if (window.innerWidth >= 1024) return;
        
        this.panels.innerHTML = `
            <div class="hub-card panel-full">
                <h3>Streaming e Audiência</h3>
                <p>Estatísticas de streaming em desenvolvimento...</p>
            </div>
        `;
    }

    renderEconomy() {
        // No desktop, não renderizar - usar páginas especiais
        if (window.innerWidth >= 1024) return;
        
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

        // Fallback: se não houver avatar em p mas existir salvo por perfil, injeta
        if (!p.avatarImage) {
            try {
                const key = this._getAvatarStorageKey();
                if (key) {
                    let storedDirect = null;
                    try { storedDirect = window.storageService?.getString(key, null); } catch(_) { storedDirect = null; }
                    if (!storedDirect) { try { storedDirect = localStorage.getItem(key); } catch(_) { storedDirect = null; } }
                    if (storedDirect) { p.avatarImage = storedDirect; }
                }
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
            const artistLetter = (p.artistName || p.name || 'M').charAt(0).toUpperCase();
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
    console.log('🚀 Inicializando sistema de upload do avatar...');
    
    if (this._avatarUploadInitialized) {
        console.log('⚠️ Upload de avatar já inicializado — rechecando e reanexando overlays...');
        // Não retornamos: garantimos overlays e listeners após troca de perfil/DOM
    }
    
    // Validação completa dos elementos DOM
    console.log('🔍 Verificando elementos do DOM...');
    
    let fileInput = document.getElementById('avatarFileInput');
    const avatarClickable = document.getElementById('newDesktopAvatar');
    const avatarInlineClickable = document.getElementById('newMobileAvatar');
    const sidebarAvatarWrapper = document.getElementById('sidebarAvatarWrapper');
    const inlineAvatarWrapper = document.querySelector('#inlineProfileBar .avatar-wrapper');
    
    console.log('🔍 Elementos encontrados:');
    console.log('  - fileInput:', fileInput);
    console.log('  - avatarClickable:', avatarClickable);
    console.log('  - avatarInlineClickable:', avatarInlineClickable);
    console.log('  - sidebarAvatarWrapper:', sidebarAvatarWrapper);
    console.log('  - inlineAvatarWrapper:', inlineAvatarWrapper);
    
    // Se o input não existir, criar um
    if (!fileInput) {
        console.log('🖼️ Criando input de arquivo para avatar...');
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'avatarFileInput';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }
    
    if (!fileInput) {
        console.error('❌ Não foi possível criar/encontrar input de arquivo');
        return; // elemento essencial
    }
    
    console.log('🖼️ Input de arquivo configurado:', fileInput);

    // Configuração de input (melhor experiência em mobile)
    try {
        fileInput.setAttribute('accept', 'image/*');
        // Sugere câmera em dispositivos móveis compatíveis
        fileInput.setAttribute('capture', 'environment');
    } catch(_) {}

    // Detecção global de iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isIOSSafari = isIOS && isSafari;

    // Handler único para processamento do arquivo
    const onFileChange = (e) => {
        console.log('🖼️ onFileChange disparado:', e);
        console.log('🖼️ Event target:', e?.target);
        console.log('🖼️ Files:', e?.target?.files);
        
        const file = e?.target?.files?.[0];
        if (!file) { 
            console.warn('🖼️ Nenhum arquivo selecionado'); 
            return; 
        }
        
        console.log('🖼️ Arquivo selecionado:', {
            name: file.name,
            size: file.size,
            type: file.type
        });
        
        if (!file.type?.startsWith?.('image/')) {
            console.error('❌ Tipo de arquivo inválido:', file.type);
            try {
                if (this.pushToast) {
                    this.pushToast('Arquivo inválido. Selecione uma imagem.');
                } else {
                    alert('Arquivo inválido. Selecione uma imagem.');
                }
            } catch(_) {}
            try { e.target.value = ''; } catch(_) {}
            return;
        }
        
        const maxBytes = 2 * 1024 * 1024; // 2MB
        if (file.size > maxBytes) {
            console.error('❌ Arquivo muito grande:', file.size, 'bytes');
            try {
                if (this.pushToast) {
                    this.pushToast('Imagem muito grande (máx 2MB).');
                } else {
                    alert('Imagem muito grande (máx 2MB).');
                }
            } catch(_) {}
            try { e.target.value = ''; } catch(_) {}
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            console.log('🖼️ DataURL gerado, aplicando avatar...');
            try {
                const player = this.game?.gameData?.player || this.game?.player;
                if (player) {
                    player.avatarImage = dataUrl;
                }
                // Persistência: gravar avatar por perfil (sem vazar entre saves)
                try {
                    const key = this._getAvatarStorageKey();
                    if (key) {
                        try { window.storageService?.setString(key, dataUrl); } catch(_) {}
                        try { localStorage.setItem(key, dataUrl); } catch(_) {}
                    }
                } catch(_) { /* ignore */ }

                // Forçar preview com estilos inline caso CSS não exista
                try {
                    ['newDesktopAvatar', 'newMobileAvatar'].forEach(cid => {
                        const el = document.getElementById(cid);
                        if (!el) return;
                        let img = el.querySelector('img.player-avatar-img');
                        if (!img) {
                            img = document.createElement('img');
                            img.className = 'player-avatar-img';
                            el.innerHTML = '';
                            el.appendChild(img);
                        }
                        img.src = dataUrl;
                        img.alt = 'Avatar';
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                        img.style.borderRadius = '50%';
                        el.classList.add('has-image');
                    });
                } catch(previewErr) { console.warn('Preview inline falhou, atualizando perfil:', previewErr); }

                this.updateProfileInfo?.();
                
                // Notificação simples
                try {
                    if (this.pushToast) {
                        this.pushToast('Avatar atualizado');
                    } else {
                        console.log('✅ Avatar atualizado com sucesso');
                        // Fallback: notificação visual no console para debug
                        if (typeof window !== 'undefined' && window.console) {
                            console.log('%c✅ Avatar atualizado!', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                        }
                    }
                } catch (notifErr) {
                    console.log('✅ Avatar atualizado (sem notificação visual)');
                }
                
                // Persistir avatar no save de perfil (auto-save baseado em evento)
                try {
                    if (this.game?.systems?.dataManager?.savePlayerData) {
                        this.game.systems.dataManager.savePlayerData(this.game.gameData.player);
                    }
                    if (typeof this.game?.saveOnEvent === 'function') {
                        this.game.saveOnEvent('avatar_updated', { length: dataUrl?.length || 0 });
                    }
                } catch (persistErr) {
                    console.warn('Falha ao persistir avatar no save:', persistErr);
                }
            } catch(err) {
                console.error('Erro aplicando avatar:', err);
                try {
                    if (this.pushToast) {
                        this.pushToast('Falha ao atualizar avatar');
                    } else {
                        console.error('❌ Falha ao atualizar avatar');
                    }
                } catch (notifErr) {
                    console.error('❌ Falha ao atualizar avatar (sem notificação)');
                }
            }
            // Permitir selecionar o mesmo arquivo novamente no futuro
            try { e.target.value = ''; } catch(_) { /* ignore */ }
        };
        reader.readAsDataURL(file);
    };

    // Método para anexar um input overlay invisível em cima do avatar (iOS Safari)
    const attachOverlayInput = (containerEl) => {
        if (!containerEl) return null;
        try { containerEl.style.position = containerEl.style.position || 'relative'; } catch(_) {}
        let overlay = containerEl.querySelector('input.avatar-overlay-input[type=file]');
        if (!overlay) {
            overlay = document.createElement('input');
            overlay.type = 'file';
            overlay.className = 'avatar-overlay-input';
            overlay.accept = 'image/*';
            overlay.setAttribute('capture', 'environment');
            overlay.style.position = 'absolute';
            overlay.style.inset = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.opacity = '0';
            overlay.style.cursor = 'pointer';
            overlay.style.zIndex = '9999';
            overlay.style.pointerEvents = 'auto';
            containerEl.appendChild(overlay);
            console.log('🍎 Overlay input anexado ao container:', containerEl.id);
        }
        // Garantir handler
        overlay.removeEventListener('change', onFileChange);
        overlay.addEventListener('change', onFileChange);
        return overlay;
    };

    const openPicker = (e) => { 
        console.log('🖼️ Avatar clicado - abrindo seletor de arquivo');
        console.log('🖼️ Event:', e);
        console.log('🖼️ Target:', e?.target);
        console.log('🖼️ FileInput element:', fileInput);
        console.log('🖼️ isIOSSafari:', isIOSSafari);
        
        try { e?.preventDefault?.(); e?.stopPropagation?.(); } catch(_) {}

        if (isIOSSafari) {
            console.log('🍎 iOS Safari detectado - clique nativo via overlay input');
            // No iOS Safari, não usamos click() programático. O overlay já captura o toque.
            return;
        }

        // Demais navegadores: clique programático imediato dentro do gesto do usuário
        try {
            console.log('🖼️ Chamando fileInput.click() (imediato)...');
            fileInput.click();
            console.log('🖼️ fileInput.click() executado (imediato)');
            return; // se funcionou, não precisa de fallback
        } catch (errImmediate) {
            console.warn('⚠️ Click imediato falhou, ajustando estilo e tentando novamente:', errImmediate);
        }

        // Ajustar estilo e tentar novamente ainda no mesmo gesto
        try { 
            fileInput.style.pointerEvents = 'auto'; 
            fileInput.style.display = 'block';
            fileInput.style.position = 'fixed';
            fileInput.style.left = '-9999px';
            fileInput.style.top = '-9999px';
            fileInput.style.zIndex = '999999';
            fileInput.focus();
            console.log('🖼️ Tentando fileInput.click() após ajustes...');
            fileInput.click();
            console.log('🖼️ fileInput.click() executado após ajustes');
            return;
        } catch (errAdjusted) {
            console.warn('⚠️ Click após ajustes falhou, tentando fallback:', errAdjusted);
        }

        // Último recurso: criar novo input e clicar
        try {
            console.log('🔄 Tentando fallback com novo input...');
            const fallbackInput = document.createElement('input');
            fallbackInput.type = 'file';
            fallbackInput.accept = 'image/*';
            fallbackInput.style.position = 'fixed';
            fallbackInput.style.left = '-9999px';
            fallbackInput.style.top = '-9999px';
            fallbackInput.style.opacity = '0';
            fallbackInput.addEventListener('change', onFileChange);
            document.body.appendChild(fallbackInput);
            fallbackInput.click();
            setTimeout(() => fallbackInput.remove(), 1000);
        } catch (fallbackErr) {
            console.error('❌ Fallback também falhou:', fallbackErr);
        }
    };
    // Tornar clicável em todos os alvos disponíveis (com capture para priorizar)
    console.log('🖼️ Vinculando listeners de avatar:', {
        avatarClickable: !!avatarClickable,
        avatarInlineClickable: !!avatarInlineClickable, 
        sidebarAvatarWrapper: !!sidebarAvatarWrapper,
        inlineAvatarWrapper: !!inlineAvatarWrapper,
        fileInput: !!fileInput
    });
    
    // Teste simples: adicionar listener de clique geral para debug
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (
            target.id === 'newDesktopAvatar' ||
            target.id === 'newMobileAvatar' ||
            (typeof target.closest === 'function' && (target.closest('#newDesktopAvatar') || target.closest('#newMobileAvatar')))
        ) {
            console.log('🖼️ Clique detectado no avatar:', target);
        }
    });
    
    // Sempre anexamos overlay inputs sobre os avatares (robusto em todos os navegadores)
    attachOverlayInput(avatarClickable);
    attachOverlayInput(avatarInlineClickable);
    if (sidebarAvatarWrapper) attachOverlayInput(sidebarAvatarWrapper);
    if (inlineAvatarWrapper) attachOverlayInput(inlineAvatarWrapper);
    console.log('🖼️ Overlay inputs prontos (clique direto sobre o avatar)');

    // Observação: não vinculamos openPicker aos contêineres quando há overlay,
    // pois preventDefault em fase de captura poderia impedir a abertura nativa do picker.

    // Sempre escutamos o change do input global também (desktop e fallback)
    fileInput.removeEventListener('change', onFileChange);
    fileInput.addEventListener('change', onFileChange);

        // Carregar avatar salvo previamente (uma vez), por perfil
        try {
            const key = this._getAvatarStorageKey();
            let stored = null;
            if (key) {
                try { stored = window.storageService?.getString(key, null); } catch(_) { stored = null; }
                if (!stored) {
                    try { stored = localStorage.getItem(key); } catch(_) { stored = null; }
                }
            }
            if (stored) {
                const player = this.game?.gameData?.player || this.game?.player;
                if (player && !player.avatarImage) {
                    player.avatarImage = stored;
                    this.updateProfileInfo();
                }
            } else {
                // Se já existir avatar em gameData e a chave por perfil não existir, persiste para fixar vínculo
                try {
                    const player = this.game?.gameData?.player || this.game?.player;
                    if (player?.avatarImage && key) {
                        try { window.storageService?.setString(key, player.avatarImage); } catch(_) {}
                        try { localStorage.setItem(key, player.avatarImage); } catch(_) {}
                    }
                } catch(_) { /* ignore */ }
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
        // Energia é atualizada pelo GameEngine.updatePlayerUI para usar formato MAX/CURRENT; evitar sobrescrever aqui.
        try {
            if (window.game?.systems?.dataManager) {
                const e = window.game.systems.dataManager.getEnergyState();
                // Mantém o fill bar baseado em percentual atual, mas não mexe no texto do cabeçalho
                const percent = Math.round((e.current / (e.max || 100)) * 100);
                this._fillResource('energy', percent);
            } else {
                this._fillResource('energy', p.energy || 85);
            }
        } catch(_) {
            this._fillResource('energy', p.energy || 85);
        }
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
        try {
            // 🎯 USAR SEMPRE A DATA DO ENGINE COMO FONTE ÚNICA DE VERDADE
            const date = this.game?.currentDate || new Date();
            if (!date) {
                console.warn('⚠️ updateTimeInfo: Nenhuma data disponível');
                return;
            }
            
            console.log(`🕒 updateTimeInfo: Data do engine: ${date.toISOString()}`);
            
            // 🎯 SEMANA DO ANO: Usar SEMPRE o ano da data do engine, não o ano atual
            const gameYear = date.getFullYear(); // ANO DA DATA DO JOGO, não o ano real
            const startOfGameYear = new Date(gameYear, 0, 1);
            const millisPerDay = 24 * 60 * 60 * 1000;
            const dayOfYear = Math.floor((date - startOfGameYear) / millisPerDay) + 1;
            let weekOfYear = Math.floor((dayOfYear - 1) / 7) + 1; // semana 1 cobre dias 1-7
            if (weekOfYear > 52) weekOfYear = 52; // fixar em 52 semanas por ano
            
            console.log(`📅 updateTimeInfo: Ano do jogo: ${gameYear}, Semana calculada: ${weekOfYear}`);
            
            this._setText('weekIndicator', `Semana ${weekOfYear}/52`);

            const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
            this._setText('dayIndicator', days[date.getDay()]);

            // Atualizar o time-card (título e data)
            const weekDayTitle = `Semana ${weekOfYear} - ${days[date.getDay()]}`;
            const dateText = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
            this._setText('timeCardTitle', weekDayTitle);
            this._setText('timeCardDate', dateText.charAt(0).toUpperCase() + dateText.slice(1));
        } catch (e) {
            console.warn('Falha ao atualizar info de tempo:', e);
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
        
        // 🖥️ DESKTOP: Sempre usar sistema de páginas especiais
    if (window.innerWidth >= 1024) {
            console.log('🖥️ Desktop navigation:', view);
            
            // Mapear views para painéis desktop
            const desktopPages = {
                'home': 'panel-profile',     // Home = Perfil detalhado
                'activity': 'panel-profile', // fallback activity -> perfil
                'profile': 'panel-profile',
                'studio': 'panel-studio',
                'career': 'panel-career', 
                'social': 'panel-social', 
                'finance': 'panel-finance',
                'more': 'panel-finance',
                'overview': 'panel-profile'
            };
            
            const desktopPanel = desktopPages[view] || 'panel-profile'; // Fallback para perfil
            
            // Montar conteúdo da página desktop (clonando a versão mobile para dentro do painel)
            try { this._mountDesktopPage(view, desktopPanel); } catch (e) { console.warn('⚠️ mount desktop page failed', e); }

            // Garantir que estamos no container principal e esconder telas legadas
            const gi = document.getElementById('gameInterface');
            if (gi) gi.style.display = 'block';
            ['studioPage','careerPage','socialPage','financePage'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });

            // Esconder todos os painéis (incluindo páginas desktop)
            [...document.querySelectorAll('.hub-panel')].forEach(panel => 
                panel.style.display = 'none'
            );
            
            // Mostrar o painel específico
            const targetPanel = document.getElementById(desktopPanel);
            if (targetPanel) {
                targetPanel.style.display = 'block';
                console.log('🖥️ Exibindo painel desktop:', desktopPanel);
            } else {
                console.warn('🖥️ Painel não encontrado:', desktopPanel);
                // Fallback: mostrar atividade
                const activityPanel = document.getElementById('panel-activity');
                if (activityPanel) {
                    activityPanel.style.display = 'block';
                }
            }
            
            // Gerenciar top bar - só mostra na atividade/home
            const topBar = document.querySelector('.top-bar');
            if (topBar) {
                if (view === 'home' || view === 'profile' || view === 'activity' || view === 'overview') {
                    topBar.style.display = '';
                } else {
                    topBar.style.display = 'none';
                }
            }

            // Gerenciar barra de abas (tab-nav) - deve aparecer apenas no HUB (home/perfil/notificações/loja)
            const tabsNav = document.getElementById('hubTabs');
            if (tabsNav) {
                const isDesktopPage = ['panel-studio','panel-career','panel-social','panel-finance'].includes(desktopPanel);
                // No HUB (perfil, notificações, loja), mantém visível; nas páginas desktop, esconde
                tabsNav.style.display = isDesktopPage ? 'none' : '';
            }
            
            return; // Parar aqui - DESKTOP sempre usa páginas especiais
        }
        
        // 📱 MOBILE APENAS: Usar sistema de tabs original
        if (window.innerWidth < 1024) {
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
    }

    // Clona o conteúdo da tela mobile para dentro do painel desktop correspondente (apenas uma vez)
    _mountDesktopPage(view, panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        if (panel.dataset.mounted === '1') return; // já montado

        const targets = {
            'panel-studio': '#studioPage .studio-page-container, #studioPage .page-container',
            'panel-career': '#careerPage .page-container',
            'panel-social': '#socialPage .page-container',
            'panel-finance': '#financePage .page-container'
        };

        const selector = targets[panelId];
        if (!selector) return;
        let src = null;
        // tentar múltiplos seletores
        selector.split(',').some(sel => {
            const el = document.querySelector(sel.trim());
            if (el) { src = el; return true; }
            return false;
        });
        if (!src) return;

        // Onde inserir no painel
        let container = panel.querySelector('.desktop-page-content');
        if (!container) {
            container = document.createElement('div');
            container.className = 'desktop-page-content';
            panel.appendChild(container);
        }

        // Limpar conteúdo placeholder do painel
        container.innerHTML = '';

        // Wrapper para estilo de card
        const wrapper = document.createElement('div');
        wrapper.className = 'desktop-card-wrapper';

        // Clonar conteúdo
        const cloned = src.cloneNode(true);
        cloned.classList.add('desktop-cloned');

        // Remover/ocultar footers internos do mobile dentro do clone (no desktop não precisa)
        cloned.querySelectorAll('.mobile-bottom-nav').forEach(el => el.remove());

        wrapper.appendChild(cloned);
        container.appendChild(wrapper);
        panel.dataset.mounted = '1';
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
        
    // Instanciar apenas via init controlado para evitar duplicidade com GameEngine
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
