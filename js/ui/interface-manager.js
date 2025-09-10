/**
 * Rising Star: Music Mogul - Interface Manager
 * Gerencia toda a interface do usuário e navegação
 */

export class InterfaceManager {
    constructor(gameEngine) {
        console.log('🏗️ Construindo InterfaceManager...');
        this.gameEngine = gameEngine;
    // Default to a neutral section since the visual dashboard was removed
    this.currentSection = 'studio';
        this.notifications = [];
        this.modals = [];
        this.updateTimers = new Map();
        
        // SAFETY: Never auto-start timers
        console.log('⚠️ Timers desabilitados no construtor');
        
        this.init();
        console.log('✅ InterfaceManager construído com sucesso');
    }
    
    init() {
        this.bindNavigationEvents();
        this.bindModalEvents();
        this.bindNotificationEvents();
        this.setupMobileHandlers();
        // Don't start timers until game is playing
        console.log('✅ InterfaceManager inicializado sem timers');
    }

    showMainInterface() {
        console.log('📺 showMainInterface() called');
        try {
            const gameInterface = document.getElementById('gameInterface');
            if (gameInterface) {
                gameInterface.style.display = 'block';
            }

            // Start update timers only when interface is shown and game is ready
            setTimeout(() => {
                try {
                    this.startUpdateTimers();
                } catch (err) {
                    console.warn('⚠️ Erro iniciando timers:', err);
                }
            }, 1000);
        } catch (err) {
            console.error('❌ showMainInterface falhou:', err);
            // Fallback: garantir que o elemento esteja visível
            const gi = document.getElementById('gameInterface');
            if (gi) gi.style.display = 'block';
        }
    }
    
    updatePlayerInfo() {
        const player = this.gameEngine.gameData?.player;
        if (!player) {
            console.warn('⚠️ Dados do jogador não disponíveis');
            return;
        }
        
        // Atualizar informações do cabeçalho
        const playerName = document.getElementById('playerDisplayName');
        const playerMoney = document.getElementById('playerDisplayMoney');
        
        if (playerName) {
            playerName.textContent = player.artistName || player.name || 'Artista';
        }
        
        if (playerMoney) {
            playerMoney.textContent = this.formatMoney(player.money || 0);
        }
        
    // Atualizar estatísticas - ARTIST TRAITS
        this.updateStatDisplay('vocalsStat', player.skills?.vocals || 0);
        this.updateStatDisplay('songWritingStat', player.skills?.songWriting || 0);
        this.updateStatDisplay('rhythmStat', player.skills?.rhythm || 0);
        this.updateStatDisplay('charismaStat', player.skills?.charisma || 0);
        this.updateStatDisplay('viralityStat', player.skills?.virality || 0);
        this.updateStatDisplay('videoDirectingStat', player.skills?.videoDirecting || 0);
        
        // Atualizar estatísticas - BUSINESS TRAITS
        this.updateStatDisplay('leadershipStat', player.skills?.leadership || 0);
        this.updateStatDisplay('marketingStat', player.skills?.marketing || 0);
        this.updateStatDisplay('negotiationStat', player.skills?.negotiation || 0);
        this.updateStatDisplay('recruitingStat', player.skills?.recruiting || 0);
        this.updateStatDisplay('salesStat', player.skills?.sales || 0);
        
    console.log('✅ Informações do jogador atualizadas na interface');
    }
    
    updateStatDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
    
    formatMoney(amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    bindUIEvents() {
        // Visual UI/designer foi removido por solicitação.
        // Este método permanece como stub para não quebrar chamadas antigas.
        if (this.uiEventsBound) return;
        this.uiEventsBound = true;
        console.log('ℹ️ bindUIEvents() stub - visual UI removido');
    }
    
    hideMainInterface() {
        const gameInterface = document.getElementById('gameInterface');
        if (gameInterface) {
            gameInterface.style.display = 'none';
        }
    }
    
    bindNavigationEvents() {
        // Main navigation
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const section = button.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });
        
        // Mobile navigation toggle
        const mobileToggle = document.getElementById('mobileNavToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileNav();
            });
        }
        
        // Quick action buttons
        this.bindQuickActions();
        
        // Settings button (apenas quando não estivermos no menu principal)
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn && !document.getElementById('mainMenu')?.style.display === 'block') {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }
        
        // Save button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.gameEngine.saveGame();
                this.showNotification('Jogo salvo com sucesso!', 'success');
            });
        }
    }
    
    bindQuickActions() {
        // Speed control
        const speedButtons = document.querySelectorAll('.speed-btn');
        speedButtons.forEach(button => {
            button.addEventListener('click', () => {
                const speed = parseFloat(button.dataset.speed);
                this.gameEngine.setGameSpeed(speed);
                this.updateSpeedIndicator(speed);
            });
        });
        
        // Pause/Play button
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (this.gameEngine.isPlaying()) {
                    this.gameEngine.pauseGame();
                    pauseBtn.textContent = '▶️';
                    pauseBtn.title = 'Continuar';
                } else {
                    this.gameEngine.resumeGame();
                    pauseBtn.textContent = '⏸️';
                    pauseBtn.title = 'Pausar';
                }
            });
        }
    }
    
    bindModalEvents() {
        // Close modal buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('modal-overlay')) {
                this.closeTopModal();
            }
        });
        
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.modals.length > 0) {
                    e.preventDefault();
                    this.closeTopModal();
                }
            }
        });
    }
    
    bindNotificationEvents() {
        // Notification clicks
    // (Removido botão de fechar dedicado)
    }
    
    setupMobileHandlers() {
        // Touch gestures for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipeGesture(touchStartX, touchEndX);
        });
        
        // Prevent zoom on double tap for game elements
        document.addEventListener('touchend', (e) => {
            if (e.target.closest('.game-content')) {
                e.preventDefault();
            }
        });
    }
    
    handleSwipeGesture(startX, endX) {
        const threshold = 100;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe left - next section
                this.navigateToNextSection();
            } else {
                // Swipe right - previous section
                this.navigateToPreviousSection();
            }
        }
    }
    
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.game-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
            
            // Animate in
            targetSection.style.opacity = '0';
            targetSection.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                targetSection.style.transition = 'all 0.3s ease';
                targetSection.style.opacity = '1';
                targetSection.style.transform = 'translateY(0)';
            }, 50);
        }
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeNavBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
        }
        
        this.currentSection = sectionName;
        
        // Update section content
        this.updateSectionContent(sectionName);
        
        // Close mobile nav if open
        this.closeMobileNav();
        
        console.log(`📱 Switched to section: ${sectionName}`);
    }
    
    updateSectionContent(sectionName) {
        // Don't update if game isn't playing or player doesn't exist
        if (this.gameEngine.gameState !== 'playing' || !this.gameEngine.gameData.player) {
            return;
        }
        
        switch (sectionName) {
            // Seção principal visual foi removida; mantemos outras seções
            case 'studio':
                this.updateStudio();
                break;
            case 'studio':
                this.updateStudio();
                break;
            case 'career':
                this.updateCareer();
                break;
            case 'social':
                this.updateSocial();
                break;
            case 'industry':
                this.updateIndustry();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
        }
    }
    
    updateMainInterface() {
        // Visual UI/designer foi removido. Método mantido como no-op seguro para evitar erros.
        console.log('ℹ️ updateMainInterface() stub - visual UI removed');
        // Optionally keep lightweight data sync calls if needed by core logic
        try {
            if (this.gameEngine && typeof this.gameEngine.getFormattedDate === 'function') {
                this.updateElement('gameDate', this.gameEngine.getFormattedDate());
            }
        } catch (e) {
            // swallow
        }
    }
    
    updateStudio() {
        const gameData = this.gameEngine.gameData;
        
        // Update studio equipment
        this.updateStudioEquipment();
        
        // Update current projects
        this.updateCurrentProjects();
        
        // Update recording options
        this.updateRecordingOptions();
    }
    
    updateCareer() {
        const gameData = this.gameEngine.gameData;
        const player = gameData.player;
        
        // Update career stats
        this.updateCareerStats();
        
        // Update contracts
        this.updateContracts();
        
        // Update opportunities
        this.updateOpportunities();
    }
    
    updateSocial() {
        // Update social media stats
        this.updateSocialStats();
        
        // Update social feed
        this.updateSocialFeed();
        
        // Update trending topics
        this.updateTrendingTopics();
    }
    
    updateIndustry() {
        // Update industry trends
        this.updateIndustryTrends();
        
        // Update charts
        this.updateCharts();
        
        // Update news
        this.updateIndustryNews();
    }
    
    updateAnalytics() {
        // Update performance charts
        this.updatePerformanceCharts();
        
        // Update detailed statistics
        this.updateDetailedStats();
        
        // Update achievements
        this.updateAchievements();
    }
    
    updateElement(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            if (element.textContent !== content) {
                element.textContent = content;
                
                // Add update animation
                element.classList.add('value-updated');
                setTimeout(() => {
                    element.classList.remove('value-updated');
                }, 1000);
            }
        }
    }
    
    updateRecentActivities() {
        const activities = this.gameEngine.getRecentActivities(5);
        const container = document.getElementById('recentActivities');
        
        if (container && activities) {
            container.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <span class="activity-icon">${activity.icon}</span>
                    <span class="activity-text">${activity.text}</span>
                    <span class="activity-time">${this.formatTimeAgo(activity.timestamp)}</span>
                </div>
            `).join('');
        }
    }
    
    updateQuickStats() {
        const stats = this.gameEngine.getQuickStats();
        
        if (stats) {
            this.updateElement('todayEarnings', `$${stats.todayEarnings.toLocaleString()}`);
            this.updateElement('weeklyStreams', stats.weeklyStreams.toLocaleString());
            this.updateElement('newFans', `+${stats.newFans}`);
            this.updateElement('currentTrend', stats.currentTrend);
        }
    }
    
    showNotification(message, type = 'info', duration = 5000) {
        // Unified API: accepts (message, type, duration) OR an options object
        let options;
        if (typeof message === 'object' && message !== null) {
            options = { duration: 5000, type: 'info', ...message };
        } else {
            options = { message, type, duration };
        }

        // Basic validation
        if (!options.message || typeof options.message !== 'string') {
            console.warn('⚠️ showNotification: mensagem inválida', options);
            return null;
        }

        // Deduplicação simples: evitar mesma mensagem+tipo em < 1500ms
        const now = Date.now();
        this._lastNotifications = this._lastNotifications || {}; // key => timestamp
        const key = `${options.type}|${options.message.trim()}`;
        const lastTs = this._lastNotifications[key];
        if (lastTs && (now - lastTs) < 1500) {
            // Ignora duplicata recente
            return null;
        }
        this._lastNotifications[key] = now;

        // Limitar histórico de dedupe para não crescer indefinidamente
        if (Object.keys(this._lastNotifications).length > 200) {
            for (const k of Object.keys(this._lastNotifications)) {
                if (now - this._lastNotifications[k] > 10000) delete this._lastNotifications[k];
            }
        }

        const id = now.toString() + Math.random().toString(36).slice(2, 7);
        const notification = {
            id,
            message: options.message,
            type: options.type || 'info',
            title: options.title || null,
            data: options.data || null,
            timestamp: now,
            duration: options.duration == null ? 5000 : options.duration
        };

        this.notifications.push(notification);
        this.renderNotification(notification);

        if (notification.duration > 0) {
            setTimeout(() => this.removeNotification(id), notification.duration);
        }
        return id;
    }
    
    renderNotification(notification) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        // Limite máximo de notificações visíveis (evita spam visual)
        const MAX_VISIBLE = 5;
        while (container.children.length >= MAX_VISIBLE) {
            const first = container.firstElementChild;
            if (first) first.remove();
        }
        
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${notification.type}`;
        notificationElement.dataset.id = notification.id;

        const titleHtml = notification.title ? `<div class="notification-title">${notification.title}</div>` : '';
        // Estrutura mínima sem ícone e sem botão de fechar (auto dismiss)
        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-text-block">
                    ${titleHtml}
                    <span class="notification-message">${notification.message}</span>
                </div>
            </div>
        `;
        
        container.appendChild(notificationElement);
        
        // Animate in
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);

        // Clique fecha
        // Clique (qualquer área) fecha antecipadamente opcionalmente
        notificationElement.addEventListener('click', () => {
            this.removeNotification(notification.id);
        });
    }
    
    removeNotification(id) {
        const notification = document.querySelector(`[data-id="${id}"]`);
        if (notification) {
            notification.classList.add('removing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== id);
    }
    
    getNotificationIcon(type) {
        // Ícones removidos (retorna string vazia para compatibilidade caso algum código ainda chame)
        return '';
    }
    
    showModal(modalContent, options = {}) {
        const modalId = Date.now().toString();
        const modal = {
            id: modalId,
            content: modalContent,
            options
        };
        
        this.modals.push(modal);
        this.renderModal(modal);
        
        return modalId;
    }
    
    renderModal(modal) {
        const modalElement = document.createElement('div');
        modalElement.className = 'modal-overlay';
        modalElement.dataset.id = modal.id;
        
        modalElement.innerHTML = `
            <div class="modal-content ${modal.options.size || 'medium'}">
                <div class="modal-header">
                    <h3>${modal.options.title || ''}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    ${modal.content}
                </div>
                ${modal.options.footer ? `<div class="modal-footer">${modal.options.footer}</div>` : ''}
            </div>
        `;
        
        document.body.appendChild(modalElement);
        
        // Animate in
        setTimeout(() => {
            modalElement.classList.add('show');
        }, 10);
        
        // Focus first input
        const firstInput = modalElement.querySelector('input, select, textarea, button');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
    
    closeTopModal() {
        if (this.modals.length === 0) return;
        
        const topModal = this.modals[this.modals.length - 1];
        const modalElement = document.querySelector(`[data-id="${topModal.id}"]`);
        
        if (modalElement) {
            modalElement.classList.add('removing');
            setTimeout(() => {
                modalElement.remove();
            }, 300);
        }
        
        this.modals.pop();
    }
    
    closeAllModals() {
        while (this.modals.length > 0) {
            this.closeTopModal();
        }
    }
    
    showSettingsModal() {
        const settingsContent = `
            <div class="settings-tabs">
                <button class="tab-btn active" data-tab="general">Geral</button>
                <button class="tab-btn" data-tab="audio">Áudio</button>
                <button class="tab-btn" data-tab="graphics">Gráficos</button>
                <button class="tab-btn" data-tab="controls">Controles</button>
            </div>
            
            <div class="settings-content">
                <div class="tab-panel active" id="general">
                    <div class="setting-item">
                        <label>Auto-save</label>
                        <input type="checkbox" id="autoSave" checked>
                    </div>
                    <div class="setting-item">
                        <label>Notificações</label>
                        <input type="checkbox" id="notifications" checked>
                    </div>
                    <div class="setting-item">
                        <label>Idioma</label>
                        <select id="language">
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                        </select>
                    </div>
                </div>
                
                <div class="tab-panel" id="audio">
                    <div class="setting-item">
                        <label>Volume Principal</label>
                        <input type="range" id="masterVolume" min="0" max="100" value="80">
                        <span class="value">80%</span>
                    </div>
                    <div class="setting-item">
                        <label>Efeitos Sonoros</label>
                        <input type="range" id="sfxVolume" min="0" max="100" value="70">
                        <span class="value">70%</span>
                    </div>
                    <div class="setting-item">
                        <label>Música de Fundo</label>
                        <input type="range" id="musicVolume" min="0" max="100" value="60">
                        <span class="value">60%</span>
                    </div>
                </div>
                
                <div class="tab-panel" id="graphics">
                    <div class="setting-item">
                        <label>Qualidade Gráfica</label>
                        <select id="graphicsQuality">
                            <option value="low">Baixa</option>
                            <option value="medium" selected>Média</option>
                            <option value="high">Alta</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Animações</label>
                        <input type="checkbox" id="animations" checked>
                    </div>
                    <div class="setting-item">
                        <label>Partículas</label>
                        <input type="checkbox" id="particles" checked>
                    </div>
                </div>
                
                <div class="tab-panel" id="controls">
                    <div class="setting-item">
                        <label>Zoom com Scroll</label>
                        <input type="checkbox" id="scrollZoom" checked>
                    </div>
                    <div class="setting-item">
                        <label>Gestos Touch</label>
                        <input type="checkbox" id="touchGestures" checked>
                    </div>
                </div>
            </div>
        `;
        
        const modalId = this.showModal(settingsContent, {
            title: 'Configurações',
            size: 'large',
            footer: `
                <button class="btn-secondary" onclick="this.closest('.modal-overlay').querySelector('.modal-close').click()">
                    Cancelar
                </button>
                <button class="btn-primary" onclick="game.systems.interfaceManager.saveSettings()">
                    Salvar
                </button>
            `
        });
        
        // Bind settings tabs
        const modal = document.querySelector(`[data-id="${modalId}"]`);
        if (modal) {
            this.bindSettingsTabs(modal);
            this.loadCurrentSettings(modal);
        }
    }
    
    bindSettingsTabs(modal) {
        const tabButtons = modal.querySelectorAll('.tab-btn');
        const tabPanels = modal.querySelectorAll('.tab-panel');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab panel
                tabPanels.forEach(panel => panel.classList.remove('active'));
                const targetPanel = modal.querySelector(`#${tabName}`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
        
        // Bind range sliders
        const rangeInputs = modal.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const valueSpan = e.target.nextElementSibling;
                if (valueSpan) {
                    valueSpan.textContent = `${e.target.value}%`;
                }
            });
        });
    }
    
    loadCurrentSettings(modal) {
    // Load settings from game engine (safe fallback)
    const settings = (this.gameEngine.getSettings && this.gameEngine.getSettings()) || this.gameEngine.settings || {};
        
        if (settings) {
            Object.keys(settings).forEach(key => {
                const input = modal.querySelector(`#${key}`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = settings[key];
                    } else {
                        input.value = settings[key];
                        
                        // Update range display
                        if (input.type === 'range') {
                            const valueSpan = input.nextElementSibling;
                            if (valueSpan) {
                                valueSpan.textContent = `${input.value}%`;
                            }
                        }
                    }
                }
            });
        }
    }
    
    saveSettings() {
        const modal = document.querySelector('.modal-overlay:last-child');
        if (!modal) return;
        
        const settings = {};
        const inputs = modal.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (input.id) {
                if (input.type === 'checkbox') {
                    settings[input.id] = input.checked;
                } else {
                    settings[input.id] = input.value;
                }
            }
        });
        
        this.gameEngine.saveSettings(settings);
        this.showNotification('Configurações salvas!', 'success');
        this.closeTopModal();
    }
    
    toggleMobileNav() {
        const nav = document.querySelector('.main-nav');
        if (nav) {
            nav.classList.toggle('mobile-open');
        }
    }
    
    closeMobileNav() {
        const nav = document.querySelector('.main-nav');
        if (nav) {
            nav.classList.remove('mobile-open');
        }
    }
    
    navigateToNextSection() {
    const sections = ['studio', 'career', 'social', 'industry', 'analytics'];
        const currentIndex = sections.indexOf(this.currentSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        this.showSection(sections[nextIndex]);
    }
    
    navigateToPreviousSection() {
    const sections = ['studio', 'career', 'social', 'industry', 'analytics'];
        const currentIndex = sections.indexOf(this.currentSection);
        const prevIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
        this.showSection(sections[prevIndex]);
    }
    
    updateSpeedIndicator(speed) {
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-speed="${speed}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        const indicator = document.getElementById('speedIndicator');
        if (indicator) {
            indicator.textContent = `${speed}x`;
        }
    }
    
    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes}m atrás`;
        if (hours < 24) return `${hours}h atrás`;
        return `${days}d atrás`;
    }
    
    startUpdateTimers() {
        console.log('🚫 MÉTODO COMPLETAMENTE DESABILITADO - DEBUG');
        // TODO: Reabilitar quando o problema for resolvido
        /*
        // TEMPORARIAMENTE DESABILITADO para debug
        console.log('⚠️ Timers temporariamente desabilitados para debug');
        return;
        
        // Ensure we only start timers when game is properly initialized
        if (!this.gameEngine || 
            this.gameEngine.gameState !== 'playing' || 
            !this.gameEngine.gameData.player) {
            console.log('⚠️ Timers não iniciados - jogo não está pronto');
            return;
        }
        
        console.log('⏰ Iniciando timers de atualização');
        
    // Visual UI timers removed. Other sections timers may be enabled when needed.
        
        // Update other sections every 10 seconds
        ['studio', 'career', 'social', 'industry', 'analytics'].forEach(section => {
            this.updateTimers.set(section, setInterval(() => {
                if (this.currentSection === section && this.gameEngine.gameState === 'playing') {
                    this.updateSectionContent(section);
                }
            }, 10000));
        });
        */
    }
    
    stopUpdateTimers() {
        this.updateTimers.forEach(timer => clearInterval(timer));
        this.updateTimers.clear();
    }
    
    // Método update chamado pelo game loop
    update(deltaTime) {
        // Atualização contínua da interface (se necessário)
        // Por enquanto vazio, os timers cuidam das atualizações periódicas
    }
    
    destroy() {
        this.stopUpdateTimers();
        this.closeAllModals();
        this.notifications = [];
    }

    // Placeholder pause menu toggler (a ser expandido depois)
    togglePauseMenu() {
        // Simple state flip for now
        if (this._paused) {
            this._paused = false;
            console.log('▶️ Pause menu fechado (placeholder)');
        } else {
            this._paused = true;
            console.log('⏸️ Pause menu aberto (placeholder)');
        }
    }

    // Pause menu básico (stub)
    togglePauseMenu() {
        if (!this.gameEngine) return;
        if (this.gameEngine.isPlaying()) {
            this.gameEngine.pauseGame();
            this.showNotification('Jogo pausado', 'info');
        } else if (this.gameEngine.isPaused()) {
            this.gameEngine.resumeGame();
            this.showNotification('Jogo retomado', 'success');
        }
    }
}
