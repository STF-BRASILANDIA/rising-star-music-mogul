/**
 * Rising Star: Music Mogul - Game Hub Controller
 * Dashboard híbrido com integração ao game engine existente
 */

export class GameHub {
    constructor(game) {
        this.game = game;
        this.root = document.getElementById('gameInterface');
        this.panels = document.getElementById('hubPanels');
        this.currentTab = 'overview';
        this.isVisible = false;
        
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

    renderCurrent() {
        if (!this.panels) return;
        
        switch (this.currentTab) {
            case 'overview': return this.renderOverview();
            case 'resources': return this.renderResources();
            case 'feed': return this.renderFeed();
            case 'goals': return this.renderGoals();
            case 'career': return this.renderCareer();
            case 'streaming': return this.renderStreaming();
            case 'economy': return this.renderEconomy();
            default: return this.renderOverview();
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
        
        // Sidebar profile
        this._setText('artistStageName', p.artistName || p.name || 'Novo Artista');
        this._setText('artistRoleGenre', `${p.role || 'Cantor(a)'} • ${p.genre || 'R&B'}`);
        // Inline mobile
        this._setText('artistStageNameInline', p.artistName || p.name || 'Novo Artista');
        this._setText('artistRoleGenreInline', `${p.role || 'Cantor(a)'} • ${p.genre || 'R&B'}`);
        
        // Avatar inicial
        const avatar = document.getElementById('hubAvatar');
        if (avatar && p.artistName) {
            avatar.textContent = p.artistName.charAt(0).toUpperCase();
        }
        const avatarInline = document.getElementById('hubAvatarInline');
        if (avatarInline && p.artistName) {
            avatarInline.textContent = p.artistName.charAt(0).toUpperCase();
        }

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

    updateMetrics() {
        const p = this.game?.gameData?.player || this.game?.player || {};
        
        // Sidebar stats
        this._setText('statFame', this._formatNumber(p.fame || 0));
        this._setText('statListeners', this._formatNumber(p.monthlyListeners || 0));
        this._setText('statHype', this._formatNumber(p.hype || 0));
        this._setText('statMoney', '$' + this._formatNumber(p.money || 0));
    // Inline stats
    this._setText('statFameInline', this._formatNumber(p.fame || 0));
    this._setText('statListenersInline', this._formatNumber(p.monthlyListeners || 0));
    this._setText('statMoneyInline', '$' + this._formatNumber(p.money || 0));
        
        // Main metrics
        this._setText('fameValue', this._formatNumber(p.fame || 0));
        this._setText('listenersValue', this._formatNumber(p.monthlyListeners || 0));
        this._setText('netWorthValue', '$' + this._formatNumber(p.money || 0));
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

    // ===== AÇÕES =====
    _handleQuickAction(action) {
        console.log('🎮 Ação rápida:', action);
        
        switch (action) {
            case 'create-track':
                this.pushToast('Sistema de criação em desenvolvimento');
                break;
            case 'train':
                this.pushToast('Sistema de treinamento em desenvolvimento');
                break;
            case 'show-offers':
                this.pushToast('Sistema de ofertas em desenvolvimento');
                break;
            case 'create-label':
                this.pushToast('Criação de label em desenvolvimento');
                break;
        }
    }

    _handleMobileNav(view) {
        console.log('📱 Navegação mobile:', view);
        
        // Atualizar visual
        [...document.querySelectorAll('.m-btn')].forEach(btn => 
            btn.classList.toggle('active', btn.dataset.view === view)
        );
        
        // Implementar lógica de navegação futuramente
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
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
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
