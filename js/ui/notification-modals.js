/**
 * 📱 NOTIFICATION MODALS SYSTEM
 * Modais especializados para o sistema de notificações
 * Baseado no feed de notificações/eventos do jogo
 */

class NotificationModals {
    constructor() {
        this.modalSystem = window.modernModalSystem;
        this.init();
    }

    init() {
        this.injectNotificationStyles();
        console.log('📱 Notification Modals System initialized');
    }

    /**
     * Estilos específicos para modais de notificações
     */
    injectNotificationStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-modal-styles';
        styleSheet.textContent = `
            /* 📰 NOTIFICATION MODALS STYLES - HIGH SPECIFICITY TO OVERRIDE LEGACY */
            
            .modern-modal .notification-modal {
                width: 600px;
                max-width: 90vw;
            }

            body .modern-modal .notification-card {
                background: rgba(255, 255, 255, 0.12) !important;
                backdrop-filter: blur(25px) !important;
                -webkit-backdrop-filter: blur(25px) !important;
                border-radius: 16px !important;
                padding: 20px !important;
                margin: 20px !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                box-shadow: 
                    0 16px 40px rgba(0, 0, 0, 0.2),
                    0 8px 16px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
                transition: all 0.3s ease !important;
                position: relative !important;
                z-index: 10001 !important;
                cursor: default !important;
                transform: none !important;
            }

            body .modern-modal .notification-card:hover {
                transform: translateY(-2px) !important;
                box-shadow: 
                    0 20px 50px rgba(0, 0, 0, 0.25),
                    0 10px 20px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
                background: rgba(255, 255, 255, 0.15) !important;
            }

            body .modern-modal .notification-header {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                margin-bottom: 16px !important;
                position: relative !important;
                z-index: 10 !important;
            }

            body .modern-modal .notification-icon {
                width: 48px !important;
                height: 48px !important;
                border-radius: 12px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 20px !important;
                font-weight: 600 !important;
                color: white !important;
                flex-shrink: 0 !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
            }

            body .modern-modal .notification-icon.news { 
                background: linear-gradient(135deg, #667eea, #764ba2) !important; 
            }
            body .modern-modal .notification-icon.message { 
                background: linear-gradient(135deg, #f093fb, #f5576c) !important; 
            }
            body .modern-modal .notification-icon.event { 
                background: linear-gradient(135deg, #4facfe, #00f2fe) !important; 
            }
            body .modern-modal .notification-icon.achievement { 
                background: linear-gradient(135deg, #43e97b, #38f9d7) !important; 
            }

            body .modern-modal .notification-meta {
                flex: 1 !important;
            }

            body .modern-modal .notification-source {
                font-size: 12px !important;
                font-weight: 600 !important;
                color: #8e8e93 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
                margin: 0 !important;
            }

            body .modern-modal .notification-timestamp {
                font-size: 11px !important;
                color: #c7c7cc !important;
                margin-top: 2px !important;
                margin-bottom: 0 !important;
            }

            body .modern-modal .notification-title {
                font-size: 18px !important;
                font-weight: 700 !important;
                color: #1d1d1f !important;
                margin: 8px 0 !important;
                line-height: 1.3 !important;
            }

            body .modern-modal .notification-summary {
                font-size: 14px !important;
                color: #48484a !important;
                line-height: 1.5 !important;
                margin-bottom: 16px !important;
            }

            body .modern-modal .notification-actions {
                display: flex !important;
                gap: 8px !important;
                flex-wrap: wrap !important;
            }

            body .modern-modal .notification-btn {
                padding: 8px 16px !important;
                border-radius: 20px !important;
                border: none !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
            }

            body .modern-modal .notification-btn.primary {
                background: linear-gradient(135deg, #007aff, #0051d5) !important;
                color: white !important;
                box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3) !important;
            }

            body .modern-modal .notification-btn.primary:hover {
                transform: scale(1.05) !important;
                box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4) !important;
            }

            body .modern-modal .notification-btn.secondary {
                background: rgba(0, 0, 0, 0.1) !important;
                color: #1d1d1f !important;
                border: 1px solid rgba(0, 0, 0, 0.1) !important;
            }

            body .modern-modal .notification-btn.secondary:hover {
                background: rgba(0, 0, 0, 0.15) !important;
                transform: scale(1.02) !important;
            }

            body .modern-modal .notification-btn.success {
                background: linear-gradient(135deg, #34c759, #30d158) !important;
                color: white !important;
                box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3) !important;
            }

            body .modern-modal .notification-btn.danger {
                background: linear-gradient(135deg, #ff3b30, #ff2d20) !important;
                color: white !important;
                box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3) !important;
            }

            body .modern-modal .urgency-indicator {
                position: absolute !important;
                top: 16px !important;
                right: 16px !important;
                width: 8px !important;
                height: 8px !important;
                border-radius: 50% !important;
                background: #ff3b30 !important;
                animation: pulse 2s infinite !important;
            }

            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
                100% { opacity: 1; transform: scale(1); }
            }

            /* 🎨 HOVER EFFECTS PARA BOTÕES */
            body .modern-modal .notification-btn:hover {
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
            }

            body .modern-modal .action-btn:hover {
                background: rgba(255,255,255,0.3) !important;
                transform: translateY(-1px) !important;
            }
            
            /* 📊 ESTILOS ESPECÍFICOS PARA MODAIS DE ESTATÍSTICAS */
            body .modern-modal .stats-grid {
                display: grid !important;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
                gap: 16px !important;
                margin: 16px 0 !important;
            }
            
            body .modern-modal .stat-item {
                background: rgba(255,255,255,0.1) !important;
                padding: 16px !important;
                border-radius: 12px !important;
                text-align: center !important;
                backdrop-filter: blur(10px) !important;
            }
            
            body .modern-modal .stat-value {
                font-size: 24px !important;
                font-weight: 700 !important;
                color: #007aff !important;
                margin-bottom: 4px !important;
            }
            
            body .modern-modal .stat-label {
                font-size: 12px !important;
                color: #8e8e93 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
            }
            
            /* 🏆 ESTILOS PARA CONQUISTAS */
            body .modern-modal .achievement-item {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                padding: 12px !important;
                background: rgba(255,255,255,0.08) !important;
                border-radius: 8px !important;
                margin-bottom: 8px !important;
            }
            
            body .modern-modal .achievement-icon {
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                background: linear-gradient(135deg, #ffd700, #daa520) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 18px !important;
            }
            
            /* 📱 ESTILOS PARA CONFIGURAÇÕES */
            body .modern-modal .settings-section {
                margin-bottom: 20px !important;
            }
            
            body .modern-modal .settings-option {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 12px 0 !important;
                border-bottom: 1px solid rgba(255,255,255,0.1) !important;
            }
            
            body .modern-modal .toggle-switch {
                width: 50px !important;
                height: 26px !important;
                background: rgba(255,255,255,0.2) !important;
                border-radius: 13px !important;
                position: relative !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
            }
            
            body .modern-modal .toggle-switch.active {
                background: #007aff !important;
            }
            
            body .modern-modal .toggle-switch::before {
                content: '' !important;
                position: absolute !important;
                width: 22px !important;
                height: 22px !important;
                background: #fff !important;
                border-radius: 50% !important;
                top: 2px !important;
                left: 2px !important;
                transition: all 0.3s ease !important;
            }
            
            body .modern-modal .toggle-switch.active::before {
                left: 26px !important;
            }
            
            /* 🌟 ESTILOS ESPECÍFICOS PARA MODAIS DE HABILIDADES */
            body .modern-modal .skills-category {
                margin-bottom: 24px !important;
            }
            
            body .modern-modal .skills-category-title {
                font-size: 16px !important;
                font-weight: 700 !important;
                color: #1d1d1f !important;
                margin-bottom: 16px !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
            }
            
            body .modern-modal .skills-grid {
                display: grid !important;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
                gap: 12px !important;
            }
            
            body .modern-modal .skill-item {
                background: rgba(255,255,255,0.1) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                border-radius: 12px !important;
                padding: 16px !important;
                transition: all 0.3s ease !important;
                backdrop-filter: blur(10px) !important;
            }
            
            body .modern-modal .skill-item:hover {
                background: rgba(255,255,255,0.15) !important;
                border-color: rgba(255,255,255,0.3) !important;
                transform: translateY(-2px) !important;
            }
            
            body .modern-modal .skill-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-bottom: 12px !important;
            }
            
            body .modern-modal .skill-name {
                font-size: 14px !important;
                font-weight: 600 !important;
                color: #1d1d1f !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
            }
            
            body .modern-modal .skill-level {
                font-size: 18px !important;
                font-weight: 700 !important;
                color: #007aff !important;
            }
            
            body .modern-modal .skill-progress {
                width: 100% !important;
                height: 8px !important;
                background: rgba(0,0,0,0.1) !important;
                border-radius: 4px !important;
                overflow: hidden !important;
                margin-bottom: 12px !important;
            }
            
            body .modern-modal .skill-progress-fill {
                height: 100% !important;
                background: linear-gradient(90deg, #007aff, #00c6ff) !important;
                border-radius: 4px !important;
                transition: width 0.3s ease !important;
            }
            
            body .modern-modal .skill-upgrade {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                font-size: 12px !important;
            }
            
            body .modern-modal .skill-cost {
                color: #8e8e93 !important;
                display: flex !important;
                align-items: center !important;
                gap: 4px !important;
            }
            
            body .modern-modal .skill-upgrade-btn {
                padding: 6px 12px !important;
                background: linear-gradient(135deg, #007aff, #0051d5) !important;
                border: none !important;
                color: white !important;
                border-radius: 16px !important;
                font-size: 11px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            
            body .modern-modal .skill-upgrade-btn:hover {
                transform: scale(1.05) !important;
                box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3) !important;
            }
            
            body .modern-modal .skill-upgrade-btn:disabled {
                background: rgba(0,0,0,0.1) !important;
                color: #8e8e93 !important;
                cursor: not-allowed !important;
            }
            
            body .modern-modal .skill-upgrade-btn:disabled:hover {
                transform: none !important;
                box-shadow: none !important;
            }
            
            /* 🎉 ANIMAÇÕES PARA FEEDBACK */
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }

            body .modern-modal .achievement-celebration {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 237, 78, 0.2)) !important;
                border: 1px solid rgba(255, 215, 0, 0.4) !important;
                color: #1d1d1f !important;
                position: relative !important;
                overflow: hidden !important;
            }

            body .modern-modal .achievement-celebration::before {
                content: '' !important;
                position: absolute !important;
                top: -50% !important;
                left: -50% !important;
                width: 200% !important;
                height: 200% !important;
                background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent) !important;
                animation: shine 3s infinite !important;
                z-index: 1 !important;
            }

            @keyframes shine {
                0% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
                100% { transform: translateX(100%) translateY(100%) rotate(30deg); }
            }

            /* Garantir que o conteúdo fique acima do shine */
            body .modern-modal .achievement-celebration > * {
                position: relative !important;
                z-index: 2 !important;
            }

            /* 📱 Mobile Responsiveness */
            @media (max-width: 768px) {
                body .modern-modal .notification-modal { 
                    width: 95vw !important; 
                }
                body .modern-modal .notification-card { 
                    margin: 16px !important; 
                    padding: 16px !important; 
                }
                body .modern-modal .notification-title { 
                    font-size: 16px !important; 
                }
                body .modern-modal .notification-summary { 
                    font-size: 13px !important; 
                }
            }

            /* 🌙 Dark Mode */
            @media (prefers-color-scheme: dark) {
                body .modern-modal .notification-card {
                    background: rgba(28, 28, 30, 0.28) !important; /* vidro translúcido, não preto */
                    border: 1px solid rgba(255, 255, 255, 0.22) !important;
                    backdrop-filter: blur(30px) !important;
                    -webkit-backdrop-filter: blur(30px) !important;
                    box-shadow: 
                        0 16px 40px rgba(0, 0, 0, 0.35),
                        0 8px 16px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.22),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.06) !important;
                }
                
                body .modern-modal .notification-title { 
                    color: #f2f2f7 !important; 
                }
                body .modern-modal .notification-summary { 
                    color: #d1d1d6 !important; 
                }
                body .modern-modal .notification-source { 
                    color: #9a9aa0 !important; 
                }
                
                body .modern-modal .notification-btn.secondary {
                    background: rgba(255, 255, 255, 0.14) !important;
                    color: #f2f2f7 !important;
                    border: 1px solid rgba(255, 255, 255, 0.22) !important;
                }
            }
        `;
        
        // Remove qualquer estilo anterior
        const existingStyle = document.getElementById('notification-modal-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(styleSheet);
    }

    /**
     * 📰 Modal para Notícias da Indústria Musical
     */
    openNewsModal(newsData) {
        const content = `
            <div class="notification-card ${newsData.featured ? 'featured-news' : ''}">
                <div class="notification-header">
                    <div class="notification-icon news">📰</div>
                    <div class="notification-meta">
                        <div class="notification-source">${newsData.source}</div>
                        <div class="notification-timestamp">${this.formatTimestamp(newsData.timestamp)}</div>
                    </div>
                </div>
                
                <h3 class="notification-title">${newsData.title}</h3>
                <p class="notification-summary">${newsData.summary}</p>
                
                ${newsData.fullArticle ? `
                    <div class="article-content" style="margin: 16px 0; padding: 16px; background: rgba(0, 0, 0, 0.05); border-radius: 12px; font-size: 14px; line-height: 1.6;">
                        ${newsData.fullArticle}
                    </div>
                ` : ''}
                
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="notificationModals.readFullNews('${newsData.id}')">
                        <i class="fas fa-newspaper"></i> Ler Matéria Completa
                    </button>
                    ${newsData.impact ? `
                        <button class="notification-btn secondary" onclick="notificationModals.viewImpact('${newsData.id}')">
                            <i class="fas fa-chart-line"></i> Ver Impacto
                        </button>
                    ` : ''}
                    <button class="notification-btn secondary" onclick="notificationModals.shareNews('${newsData.id}')">
                        <i class="fas fa-share"></i> Compartilhar
                    </button>
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: `news-modal-${newsData.id}`,
            title: `${newsData.source} - Notícias da Indústria`,
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        return modal;
    }

    /**
     * 💼 Modal para Mensagens de Gravadoras/Agentes
     */
    openMessageModal(messageData) {
        const content = `
            <div class="notification-card">
                ${messageData.urgent ? '<div class="urgency-indicator"></div>' : ''}
                
                <div class="notification-header">
                    <div class="notification-icon message">💼</div>
                    <div class="notification-meta">
                        <div class="notification-source">${messageData.senderType}</div>
                        <div class="notification-timestamp">${this.formatTimestamp(messageData.timestamp)}</div>
                    </div>
                </div>
                
                <h3 class="notification-title">De: ${messageData.sender}</h3>
                <p style="font-size: 14px; color: #666; margin: 8px 0;"><strong>Assunto:</strong> ${messageData.subject}</p>
                <p class="notification-summary">${messageData.message}</p>
                
                ${messageData.offer ? `
                    <div style="background: rgba(0, 122, 255, 0.1); padding: 16px; border-radius: 12px; margin: 16px 0;">
                        <h4 style="margin: 0 0 8px; color: #007aff;">💰 Proposta de Contrato</h4>
                        <p style="margin: 4px 0; font-size: 13px;"><strong>Royalties:</strong> ${messageData.offer.royalties}%</p>
                        <p style="margin: 4px 0; font-size: 13px;"><strong>Adiantamento:</strong> $${messageData.offer.advance?.toLocaleString()}</p>
                        <p style="margin: 4px 0; font-size: 13px;"><strong>Duração:</strong> ${messageData.offer.duration}</p>
                    </div>
                ` : ''}
                
                <div class="notification-actions">
                    ${messageData.actions.map(action => `
                        <button class="notification-btn ${action.type}" onclick="notificationModals.handleMessageAction('${messageData.id}', '${action.action}')">
                            <i class="fas fa-${action.icon}"></i> ${action.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: `message-modal-${messageData.id}`,
            title: `Mensagem - ${messageData.senderType}`,
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        return modal;
    }

    /**
     * 🎭 Modal para Convites de Eventos
     */
    openEventModal(eventData) {
        const content = `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="notification-icon event">🎭</div>
                    <div class="notification-meta">
                        <div class="notification-source">${eventData.organizer}</div>
                        <div class="notification-timestamp">${this.formatTimestamp(eventData.timestamp)}</div>
                    </div>
                </div>
                
                <h3 class="notification-title">${eventData.eventName}</h3>
                <p class="notification-summary">${eventData.description}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; padding: 16px; background: rgba(0, 0, 0, 0.05); border-radius: 12px;">
                    <div>
                        <p style="margin: 4px 0; font-size: 13px;"><strong>📅 Data:</strong> ${eventData.date}</p>
                        <p style="margin: 4px 0; font-size: 13px;"><strong>📍 Local:</strong> ${eventData.location}</p>
                    </div>
                    <div>
                        <p style="margin: 4px 0; font-size: 13px;"><strong>🎤 Tipo:</strong> ${eventData.type}</p>
                        <p style="margin: 4px 0; font-size: 13px;"><strong>💰 Pagamento:</strong> $${eventData.payment?.toLocaleString()}</p>
                    </div>
                </div>
                
                ${eventData.requirements ? `
                    <div style="margin: 16px 0;">
                        <h4 style="margin: 0 0 8px; font-size: 14px; color: #666;">📋 Requisitos:</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #666;">
                            ${eventData.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="notification-actions">
                    <button class="notification-btn success" onclick="notificationModals.acceptEvent('${eventData.id}')">
                        <i class="fas fa-check"></i> Aceitar Convite
                    </button>
                    <button class="notification-btn danger" onclick="notificationModals.declineEvent('${eventData.id}')">
                        <i class="fas fa-times"></i> Recusar
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.negotiateEvent('${eventData.id}')">
                        <i class="fas fa-handshake"></i> Negociar
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.moreDetails('${eventData.id}')">
                        <i class="fas fa-info-circle"></i> Mais Detalhes
                    </button>
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: `event-modal-${eventData.id}`,
            title: `Convite - ${eventData.eventName}`,
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        return modal;
    }

    /**
     * 🏆 Modal para Conquistas/Marcos
     */
    openAchievementModal(achievementData) {
        const content = `
            <div class="notification-card achievement-celebration">
                <div class="notification-header">
                    <div class="notification-icon achievement">🏆</div>
                    <div class="notification-meta">
                        <div class="notification-source">CONQUISTA DESBLOQUEADA</div>
                        <div class="notification-timestamp">${this.formatTimestamp(achievementData.timestamp)}</div>
                    </div>
                </div>
                
                <h3 class="notification-title">🎉 ${achievementData.title}</h3>
                <p class="notification-summary">${achievementData.description}</p>
                
                ${achievementData.stats ? `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin: 16px 0;">
                        ${Object.entries(achievementData.stats).map(([key, value]) => `
                            <div style="text-align: center; padding: 12px; background: rgba(255, 255, 255, 0.3); border-radius: 12px;">
                                <div style="font-size: 18px; font-weight: 700; color: #1d1d1f;">${value}</div>
                                <div style="font-size: 11px; color: #666; text-transform: uppercase;">${key}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${achievementData.rewards ? `
                    <div style="margin: 16px 0; padding: 16px; background: rgba(52, 199, 89, 0.2); border-radius: 12px;">
                        <h4 style="margin: 0 0 8px; color: #34c759;">🎁 Recompensas Desbloqueadas:</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                            ${achievementData.rewards.map(reward => `<li>${reward}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="notificationModals.viewProgress('${achievementData.id}')">
                        <i class="fas fa-chart-line"></i> Ver Progresso
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.shareAchievement('${achievementData.id}')">
                        <i class="fas fa-share"></i> Compartilhar
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.viewAllAchievements()">
                        <i class="fas fa-trophy"></i> Todas Conquistas
                    </button>
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: `achievement-modal-${achievementData.id}`,
            title: `Conquista - ${achievementData.title}`,
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        return modal;
    }

    /**
     * Utilitários
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) return 'Agora mesmo';
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h atrás`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d atrás`;
        return date.toLocaleDateString('pt-BR');
    }

    // Métodos de ação (placeholder - conectar com sistema do jogo)
    readFullNews(newsId) { console.log('📰 Reading full news:', newsId); }
    viewImpact(newsId) { console.log('📈 Viewing impact:', newsId); }
    shareNews(newsId) { console.log('📤 Sharing news:', newsId); }
    handleMessageAction(messageId, action) { console.log('💼 Message action:', messageId, action); }
    acceptEvent(eventId) { console.log('✅ Event accepted:', eventId); }
    declineEvent(eventId) { console.log('❌ Event declined:', eventId); }
    negotiateEvent(eventId) { console.log('🤝 Negotiating event:', eventId); }
    moreDetails(eventId) { console.log('ℹ️ More details:', eventId); }
    viewProgress(achievementId) { console.log('📊 Viewing progress:', achievementId); }
    shareAchievement(achievementId) { console.log('🏆 Sharing achievement:', achievementId); }
    viewAllAchievements() { console.log('🏆 Viewing all achievements'); }

    /**
     * 📊 Modal para Estatísticas do Perfil
     */
    openStatsModal() {
        const content = `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="notification-icon achievement">📊</div>
                    <div class="notification-meta">
                        <div class="notification-source">Dashboard de Performance</div>
                        <div class="notification-timestamp">Atualizado agora</div>
                    </div>
                </div>
                
                <h3 class="notification-title">Estatísticas Detalhadas</h3>
                <p class="notification-summary">Acompanhe seu progresso e performance ao longo da carreira</p>
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value" id="modalStatMoney">$0</div>
                        <div class="stat-label">Cash Total</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="modalStatFame">0</div>
                        <div class="stat-label">Pontos de Fama</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="modalStatFollowers">0</div>
                        <div class="stat-label">Seguidores</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="modalStatHype">0%</div>
                        <div class="stat-label">Hype Level</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="modalStatLevel">1</div>
                        <div class="stat-label">Nível Atual</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="modalStatEnergy">100%</div>
                        <div class="stat-label">Energia</div>
                    </div>
                </div>
                
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="notificationModals.exportStats()">
                        <i class="fas fa-download"></i> Exportar Relatório
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.viewDetailedStats()">
                        <i class="fas fa-chart-line"></i> Análise Detalhada
                    </button>
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: 'stats-modal',
            title: 'Estatísticas de Performance',
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        this.updateStatsModal();
        return modal;
    }

    /**
     * ⚙️ Modal para Configurações do Perfil
     */
    openProfileSettingsModal() {
        const content = `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="notification-icon achievement">⚙️</div>
                    <div class="notification-meta">
                        <div class="notification-source">Configurações do Perfil</div>
                        <div class="notification-timestamp">Personalize sua experiência</div>
                    </div>
                </div>
                
                <h3 class="notification-title">Configurações do Perfil</h3>
                
                <div class="settings-section">
                    <h4 style="margin: 0 0 12px; color: #1d1d1f; font-size: 16px;">🔔 Notificações</h4>
                    <div class="settings-option">
                        <span>Notificações de Email</span>
                        <div class="toggle-switch active" onclick="notificationModals.toggleSetting(this, 'email')"></div>
                    </div>
                    <div class="settings-option">
                        <span>Notificações Push</span>
                        <div class="toggle-switch active" onclick="notificationModals.toggleSetting(this, 'push')"></div>
                    </div>
                    <div class="settings-option">
                        <span>Sons de Notificação</span>
                        <div class="toggle-switch" onclick="notificationModals.toggleSetting(this, 'sound')"></div>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4 style="margin: 0 0 12px; color: #1d1d1f; font-size: 16px;">🎮 Gameplay</h4>
                    <div class="settings-option">
                        <span>Auto-Save</span>
                        <div class="toggle-switch active" onclick="notificationModals.toggleSetting(this, 'autosave')"></div>
                    </div>
                    <div class="settings-option">
                        <span>Dicas Tutorial</span>
                        <div class="toggle-switch active" onclick="notificationModals.toggleSetting(this, 'tips')"></div>
                    </div>
                    <div class="settings-option">
                        <span>Modo Noturno</span>
                        <div class="toggle-switch" onclick="notificationModals.toggleSetting(this, 'darkmode')"></div>
                    </div>
                </div>

                <div class="settings-section">
                    <h4 style="margin: 0 0 12px; color: #1d1d1f; font-size: 16px;">📱 Interface</h4>
                    <div class="settings-option">
                        <div style="display: flex; flex-direction: column; width: 100%;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span>Área Segura (Notch/Pills)</span>
                                <span id="safeAreaValue" style="font-size: 12px; opacity: 0.7;">0px</span>
                            </div>
                            <input type="range" id="safeAreaOffset" min="0" max="80" value="0" 
                                   style="width: 100%; margin: 4px 0;" 
                                   oninput="notificationModals.updateSafeArea(this.value)" />
                            <div style="font-size: 11px; opacity: 0.6; margin-top: 4px;">
                                Ajuste para dispositivos com notch (iPhone 15 Pro Max, etc.)
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h4 style="margin: 0 0 12px; color: #1d1d1f; font-size: 16px;">💾 Dados e Armazenamento</h4>
                    <div class="settings-option" style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Gerenciar Dados do Jogo</span>
                        <button class="notification-btn secondary" onclick="notificationModals.openStorageModal()">
                            <i class="fas fa-database"></i> Abrir
                        </button>
                    </div>
                </div>

                <div class="settings-section">
                    <h4 style="margin: 0 0 12px; color: #1d1d1f; font-size: 16px;">💾 Dados e Armazenamento</h4>
                    <div class="settings-option" style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Gerenciar Dados do Jogo</span>
                        <button class="notification-btn secondary" onclick="notificationModals.openStorageModal()">
                            <i class="fas fa-database"></i> Abrir
                        </button>
                    </div>
                </div>
                
                <div class="notification-actions">
                    <button class="notification-btn success" onclick="notificationModals.saveSettings()">
                        <i class="fas fa-save"></i> Salvar Configurações
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.resetSettings()">
                        <i class="fas fa-undo"></i> Restaurar Padrão
                    </button>
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: 'profile-settings-modal',
            title: 'Configurações do Perfil',
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        
        // Carregar configurações salvas após o modal ser criado
        setTimeout(() => {
            this.loadSettingsInModal();
        }, 100);
        
        return modal;
    }

    /**
     * 🏆 Modal para Lista de Conquistas
     */
    openAchievementsListModal() {
        const achievements = [
            { icon: '🎵', title: 'Primeira Música', desc: 'Criou sua primeira música', unlocked: true },
            { icon: '💿', title: 'Primeiro Álbum', desc: 'Lançou seu primeiro álbum', unlocked: true },
            { icon: '🏆', title: 'Top 10', desc: 'Chegou ao Top 10 das paradas', unlocked: false },
            { icon: '💎', title: 'Disco de Platina', desc: 'Vendeu mais de 1 milhão de cópias', unlocked: true },
            { icon: '🌟', title: 'Superstar', desc: 'Alcançou 10 milhões de fãs', unlocked: false },
            { icon: '🎤', title: 'Performance Épica', desc: 'Fez um show para mais de 100k pessoas', unlocked: false }
        ];

        const achievementsList = achievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}" style="opacity: ${achievement.unlocked ? '1' : '0.5'};">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info" style="flex: 1;">
                    <div style="font-weight: 600; color: #1d1d1f; margin-bottom: 2px;">${achievement.title}</div>
                    <div style="font-size: 13px; color: #8e8e93;">${achievement.desc}</div>
                </div>
                ${achievement.unlocked ? '<div style="color: #34c759; font-size: 18px;"><i class="fas fa-check-circle"></i></div>' : '<div style="color: #c7c7cc; font-size: 18px;"><i class="fas fa-lock"></i></div>'}
            </div>
        `).join('');

        const content = `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="notification-icon achievement">🏆</div>
                    <div class="notification-meta">
                        <div class="notification-source">Sistema de Conquistas</div>
                        <div class="notification-timestamp">3 de 6 desbloqueadas</div>
                    </div>
                </div>
                
                <h3 class="notification-title">Suas Conquistas</h3>
                <p class="notification-summary">Acompanhe seu progresso e desbloqueie novas conquistas</p>
                
                <div style="margin: 16px 0;">
                    ${achievementsList}
                </div>
                
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="notificationModals.viewAllAchievements()">
                        <i class="fas fa-trophy"></i> Ver Todas as Conquistas
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.shareAchievements()">
                        <i class="fas fa-share"></i> Compartilhar Progresso
                    </button>
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: 'achievements-list-modal',
            title: 'Conquistas e Progresso',
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        return modal;
    }

    /**
     * 📰 Modal de Lista de Notícias
     */
    openNewsListModal() {
        const content = `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="notification-icon news">📰</div>
                    <div class="notification-meta">
                        <div class="notification-source">Centro de Notícias</div>
                        <div class="notification-timestamp">Últimas atualizações</div>
                    </div>
                </div>
                
                <h3 class="notification-title">Últimas Notícias da Indústria</h3>
                <p class="notification-summary">Fique por dentro das últimas novidades do mercado musical</p>
                
                <div style="margin: 16px 0;">
                    <div class="news-item" style="padding: 12px; background: rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="notificationModals.openNewsModal_Streaming()">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <span style="background: linear-gradient(135deg, #007aff, #0051d5); color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Mercado</span>
                            <span style="font-size: 11px; color: #8e8e93;">2h atrás</span>
                        </div>
                        <div style="font-weight: 600; color: #1d1d1f; margin-bottom: 4px; font-size: 14px;">Streaming alcança números recordes em 2025</div>
                        <div style="font-size: 12px; color: #8e8e93;">Billboard News</div>
                    </div>
                    
                    <div class="news-item" style="padding: 12px; background: rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="notificationModals.openNewsModal_Forbes()">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <span style="background: linear-gradient(135deg, #007aff, #0051d5); color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Business</span>
                            <span style="font-size: 11px; color: #8e8e93;">1 dia atrás</span>
                        </div>
                        <div style="font-weight: 600; color: #1d1d1f; margin-bottom: 4px; font-size: 14px;">Artistas independentes faturam $4.2 bilhões</div>
                        <div style="font-size: 12px; color: #8e8e93;">Forbes Music Mogul</div>
                    </div>
                </div>
                
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="notificationModals.subscribeToNews()">
                        <i class="fas fa-rss"></i> Assinar Feed
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.customizeNewsFeed()">
                        <i class="fas fa-filter"></i> Personalizar Feed
                    </button>
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: 'news-list-modal',
            title: 'Centro de Notícias',
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        return modal;
    }

    /**
     * 🤝 Modal de Lista de Contratos
     */
    openContractsListModal() {
        const content = `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="notification-icon message">🤝</div>
                    <div class="notification-meta">
                        <div class="notification-source">Gestão de Contratos</div>
                        <div class="notification-timestamp">1 pendente, 1 ativo</div>
                    </div>
                </div>
                
                <h3 class="notification-title">Seus Contratos</h3>
                <p class="notification-summary">Gerencie suas parcerias e acordos comerciais</p>
                
                <div style="margin: 16px 0;">
                    <div class="contract-item" style="padding: 12px; background: rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="notificationModals.openMessageModal_Atlantic()">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div style="font-weight: 600; color: #1d1d1f; font-size: 14px;">Atlantic Records</div>
                            <span style="background: #ff9500; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Pendente</span>
                        </div>
                        <div style="font-size: 13px; color: #8e8e93; margin-bottom: 4px;">Contrato de Gravação</div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px;">
                            <span style="color: #007aff; font-weight: 600;">$250,000</span>
                            <span style="color: #8e8e93;">Expira: 7 dias</span>
                        </div>
                    </div>
                    
                    <div class="contract-item" style="padding: 12px; background: rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div style="font-weight: 600; color: #1d1d1f; font-size: 14px;">Sony Music</div>
                            <span style="background: #34c759; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Ativo</span>
                        </div>
                        <div style="font-size: 13px; color: #8e8e93; margin-bottom: 4px;">Distribuição Digital</div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px;">
                            <span style="color: #007aff; font-weight: 600;">$75,000</span>
                            <span style="color: #8e8e93;">Expira: 2 anos</span>
                        </div>
                    </div>
                </div>
                
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="notificationModals.negotiateNewContract()">
                        <i class="fas fa-handshake"></i> Novo Contrato
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.reviewContracts()">
                        <i class="fas fa-file-contract"></i> Revisar Contratos
                    </button>
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: 'contracts-list-modal',
            title: 'Gestão de Contratos',
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        return modal;
    }

    /**
     * 📅 Modal de Lista de Eventos
     */
    openEventsListModal() {
        const content = `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="notification-icon event">📅</div>
                    <div class="notification-meta">
                        <div class="notification-source">Agenda de Eventos</div>
                        <div class="notification-timestamp">3 eventos próximos</div>
                    </div>
                </div>
                
                <h3 class="notification-title">Seus Eventos</h3>
                <p class="notification-summary">Acompanhe sua agenda de shows e eventos</p>
                
                <div style="margin: 16px 0;">
                    <div class="event-item" style="padding: 12px; background: rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="notificationModals.openEventModal_RockInRio()">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div style="font-weight: 600; color: #1d1d1f; font-size: 14px;">Rock in Rio Festival 2025</div>
                            <span style="background: #34c759; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Confirmado</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #8e8e93; margin-bottom: 4px;">
                            <span><i class="fas fa-calendar"></i> 15 Set 2025</span>
                            <span><i class="fas fa-map-marker-alt"></i> Rio de Janeiro</span>
                        </div>
                        <div style="font-size: 13px; color: #007aff; font-weight: 600;">$180,000</div>
                    </div>
                    
                    <div class="event-item" style="padding: 12px; background: rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="notificationModals.openEventModal_DJSnake()">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div style="font-weight: 600; color: #1d1d1f; font-size: 14px;">Colaboração com DJ Snake</div>
                            <span style="background: #007aff; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Agendado</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #8e8e93; margin-bottom: 4px;">
                            <span><i class="fas fa-calendar"></i> 20-22 Set 2025</span>
                            <span><i class="fas fa-map-marker-alt"></i> Abbey Road Studios</span>
                        </div>
                        <div style="font-size: 13px; color: #007aff; font-weight: 600;">$75,000</div>
                    </div>
                </div>
                
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="notificationModals.scheduleNewEvent()">
                        <i class="fas fa-plus"></i> Agendar Evento
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.syncCalendar()">
                        <i class="fas fa-sync"></i> Sincronizar Agenda
                    </button>
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: 'events-list-modal',
            title: 'Agenda de Eventos',
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        return modal;
    }

    // Métodos auxiliares para os novos modais
    updateStatsModal() {
        if (document.getElementById('modalStatMoney')) {
            document.getElementById('modalStatMoney').textContent = document.getElementById('statMoney')?.textContent || '$0';
            document.getElementById('modalStatFame').textContent = document.getElementById('statFame')?.textContent || '0';
            document.getElementById('modalStatFollowers').textContent = document.getElementById('statListeners')?.textContent || '0';
            document.getElementById('modalStatHype').textContent = document.getElementById('statHype')?.textContent || '0';
            document.getElementById('modalStatLevel').textContent = document.getElementById('statLevel')?.textContent || '1';
            document.getElementById('modalStatEnergy').textContent = document.getElementById('statEnergy')?.textContent || '100';
        }
    }

    toggleSetting(element, setting) {
        element.classList.toggle('active');
        console.log(`Setting ${setting} toggled:`, element.classList.contains('active'));
    }

    saveSettings() { console.log('💾 Configurações salvas'); }
    resetSettings() { console.log('🔄 Configurações restauradas'); }
    
    /**
     * Atualiza a área segura em tempo real
     */
    updateSafeArea(value) {
        const val = parseInt(value || '0');
        
        // Aplicar mudança visual imediatamente
        if (val > 0) {
            document.documentElement.style.setProperty('--safe-area-extra-top', val + 'px');
        } else {
            document.documentElement.style.setProperty('--safe-area-extra-top', '0px');
        }
        
        // Atualizar label
        const valueLabel = document.getElementById('safeAreaValue');
        if (valueLabel) {
            valueLabel.textContent = val + 'px';
        }
        
        // Salvar imediatamente no localStorage
        try {
            const current = JSON.parse(localStorage.getItem('risingstar_settings') || '{}');
            localStorage.setItem('risingstar_settings', JSON.stringify({ ...current, safeAreaOffset: val }));
            console.log('✅ Safe area offset salvo:', val + 'px');
        } catch (err) {
            console.warn('⚠️ Não foi possível salvar safeAreaOffset:', err);
        }
    }

    /**
     * Carrega configurações salvas no modal
     */
    loadSettingsInModal() {
        try {
            const saved = JSON.parse(localStorage.getItem('risingstar_settings') || '{}');
            
            // Carregar safe area offset
            const safeAreaInput = document.getElementById('safeAreaOffset');
            const safeAreaValue = document.getElementById('safeAreaValue');
            
            if (safeAreaInput && saved.safeAreaOffset !== undefined) {
                safeAreaInput.value = saved.safeAreaOffset || 0;
                if (safeAreaValue) {
                    safeAreaValue.textContent = (saved.safeAreaOffset || 0) + 'px';
                }
                
                // Aplicar valor atual
                if (saved.safeAreaOffset > 0) {
                    document.documentElement.style.setProperty('--safe-area-extra-top', saved.safeAreaOffset + 'px');
                }
            }
            
            console.log('📋 Configurações carregadas no modal');
        } catch (error) {
            console.error('❌ Erro ao carregar configurações no modal:', error);
        }
    }
    exportStats() { console.log('📊 Exportando relatório de estatísticas'); }
    viewDetailedStats() { console.log('📈 Visualizando análise detalhada'); }
    subscribeToNews() { console.log('📰 Assinando feed de notícias'); }
    customizeNewsFeed() { console.log('🔧 Personalizando feed de notícias'); }
    negotiateNewContract() { console.log('🤝 Iniciando negociação de novo contrato'); }
    reviewContracts() { console.log('📝 Revisando contratos existentes'); }
    scheduleNewEvent() { console.log('📅 Agendando novo evento'); }
    syncCalendar() { console.log('🔄 Sincronizando agenda'); }
    shareAchievements() { console.log('🏆 Compartilhando conquistas'); }

    /**
     * 🌟 Modal para Sistema de Habilidades - SISTEMA ATUALIZADO
     */
    openSkillsModal() {
        // 🎯 BUSCAR DADOS REAIS DO CHARACTER CREATOR E DATA MANAGER
        const getSkillData = (skillKey, name, icon) => {
            let level = 0; // ✅ padrão
            let maxLevel = 100;
            
            // 🎯 PRIORIDADE 1: window.game.gameData.player.skills (dados sincronizados)
            try {
                if (window.game?.gameData?.player?.skills && 
                    typeof window.game.gameData.player.skills[skillKey] === 'number') {
                    level = window.game.gameData.player.skills[skillKey];
                    console.log(`🎯 Skill ${skillKey} carregada do window.game.gameData.player: ${level}`);
                }
                // 🎯 PRIORIDADE 2: DataManager skillState 
                else if (window.game?.systems?.dataManager) {
                    const dm = window.game.systems.dataManager;
                    const skillState = dm.getSkillState(skillKey);
                    level = skillState.level || 0;
                    maxLevel = skillState.maxLevel || 100;
                    console.log(`🎯 Skill ${skillKey} carregada do skillState: level=${level}`);
                    
                    // Fallback para playerData se necessário
                    if (level === 0) {
                        const playerData = dm.loadPlayerData();
                        if (playerData?.skills && typeof playerData.skills[skillKey] === 'number') {
                            level = playerData.skills[skillKey];
                            console.log(`🎯 Skill ${skillKey} carregada do player data: level=${level}`);
                        }
                    }
                } else {
                    // Fallback: localStorage
                    const gameData = JSON.parse(localStorage.getItem('risingstar_gamedata') || '{}');
                    if (gameData.player?.skills && typeof gameData.player.skills[skillKey] === 'number') {
                        level = gameData.player.skills[skillKey];
                        console.log(`💾 Skill ${skillKey} carregada do localStorage (player): level=${level}`);
                    } else if (gameData.skills && typeof gameData.skills[skillKey] === 'number') {
                        level = gameData.skills[skillKey];
                        console.log(`💾 Skill ${skillKey} carregada do localStorage (skills): level=${level}`);
                    }
                }
            } catch (error) {
                console.warn(`Erro ao buscar dados da skill ${skillKey}:`, error);
            }
            
            // Calcular custos baseados no sistema real
            let cost = 500;
            let energy = 20;
            try {
                if (window.game?.systems?.dataManager) {
                    cost = window.game.systems.dataManager.trainingMoneyCost(level);
                    energy = window.game.systems.dataManager.trainingEnergyCost(level);
                }
            } catch (error) {
                // Usar custos padrão se houver erro
                cost = Math.floor(500 * Math.pow(1.2, Math.floor(level / 10)));
                energy = Math.floor(20 * Math.pow(1.1, Math.floor(level / 20)));
            }
            
            return { id: skillKey, name, icon, level, maxLevel, cost, energy };
        };

        // 🎵 TODAS AS 8 SKILLS DO SISTEMA ATUALIZADO
        const artisticSkills = [
            getSkillData('vocals', 'Vocals', '🎤'),
            getSkillData('songWriting', 'Songwriting', '✍️'),
            getSkillData('rhythm', 'Rhythm', '🥁'),
            getSkillData('livePerformance', 'Live Performance', '🎭'), // NOVA SKILL
            getSkillData('production', 'Production', '🎛️'),          // NOVA SKILL
            getSkillData('charisma', 'Charisma', '✨'),
            getSkillData('virality', 'Virality', '📱'),
            getSkillData('videoDirecting', 'Video Directing', '🎬')
        ];

        // 🏢 HABILIDADES DE NEGÓCIO (começam em 0, não aparecem na criação)
        const businessSkills = [
            getSkillData('marketing', 'Marketing', '📈'),
            getSkillData('business', 'Business', '💼'),
            getSkillData('networking', 'Networking', '🤝'),
            getSkillData('management', 'Management', '📊')
        ];

        const renderSkillCategory = (title, icon, skills) => {
            const skillsHtml = skills.map(skill => {
                const progressPercent = (skill.level / skill.maxLevel) * 100;
                const canUpgrade = skill.level < skill.maxLevel;
                // Usar fonte de verdade para recursos
                let currentEnergy = 100;
                let currentMoney = 0;
                try {
                    if (window.game?.systems?.dataManager) {
                        const energyInfo = window.game.systems.dataManager.getEnergyState();
                        currentEnergy = energyInfo.current;
                        const gd = window.game.systems.dataManager.loadGameData();
                        if (gd.player && typeof gd.player.money === 'number') {
                            currentMoney = gd.player.money;
                        } else if (typeof gd.money === 'number') {
                            currentMoney = gd.money;
                        }
                    } else if (window.game?.gameData?.player) {
                        currentEnergy = window.game.gameData.player.energy ?? 100;
                        currentMoney = window.game.gameData.player.money ?? 0;
                    }
                } catch (_) { /* fallback mantém defaults */ }
                const hasResources = (currentMoney >= skill.cost) && (currentEnergy >= skill.energy);
                
                return `
                    <div class="skill-item">
                        <div class="skill-header">
                            <div class="skill-name">
                                <span style="font-size: 16px;">${skill.icon}</span>
                                ${skill.name}
                            </div>
                            <div class="skill-level">${skill.level}/${skill.maxLevel}</div>
                        </div>
                        
                        <div class="skill-progress">
                            <div class="skill-progress-fill" style="width: ${progressPercent}%;"></div>
                        </div>
                        
                        <div class="skill-upgrade">
                            <div class="skill-cost">
                                <i class="fas fa-dollar-sign"></i> ${skill.cost}
                                <span style="margin-left: 8px;"><i class="fas fa-bolt"></i> ${skill.energy}</span>
                            </div>
                            <button 
                                class="skill-upgrade-btn" 
                                ${!canUpgrade || !hasResources ? 'disabled' : ''}
                                onclick="notificationModals.upgradeSkill('${skill.id}', ${skill.cost}, ${skill.energy})"
                            >
                                ${!canUpgrade ? 'MAX' : !hasResources ? 'Sem Recursos' : 'Upgrade'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="skills-category">
                    <h4 class="skills-category-title">
                        <span style="font-size: 18px;">${icon}</span>
                        ${title}
                    </h4>
                    <div class="skills-grid">
                        ${skillsHtml}
                    </div>
                </div>
            `;
        };

        const content = `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="notification-icon achievement">🌟</div>
                    <div class="notification-meta">
                        <div class="notification-source">Sistema de Desenvolvimento</div>
                        <div class="notification-timestamp">Invista em suas habilidades</div>
                    </div>
                </div>
                
                <h3 class="notification-title">Árvore de Habilidades</h3>
                <p class="notification-summary">Desenvolva suas habilidades artísticas e de negócios para alcançar o sucesso</p>
                
                <div style="margin: 20px 0;">
                    ${renderSkillCategory('Habilidades Artísticas', '🎨', artisticSkills)}
                    ${renderSkillCategory('Habilidades de Negócios', '💼', businessSkills)}
                </div>
                
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="notificationModals.resetSkills()">
                        <i class="fas fa-undo"></i> Reset Habilidades
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.skillsInfo()">
                        <i class="fas fa-info-circle"></i> Informações
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.skillsPresets()">
                        <i class="fas fa-bookmark"></i> Presets
                    </button>
                </div>
            </div>
        `;

        // Evitar múltiplas instâncias: se já existir, apenas atualiza conteúdo
        const existing = document.getElementById('skills-modal');
        if (existing && existing.classList.contains('active')) {
            this.modalSystem.updateModalContent('skills-modal', content);
            return existing;
        }
        const modal = this.modalSystem.createModal({
            id: 'skills-modal',
            title: 'Sistema de Habilidades',
            content,
            size: 'large'
        });
        this.modalSystem.openModal(modal);
        return modal;
    }

    /**
     * 🎯 Upgrade de habilidade - INTEGRAÇÃO COM SISTEMA REAL DE DADOS
     */
    upgradeSkill(skillId, cost, energyCost) {
        // Evitar múltiplos cliques
        if (this._upgrading) {
            console.log('⚠️ Upgrade já em andamento, ignorando...');
            return;
        }
        this._upgrading = true;
        
        try {
            console.log(`🎯 DEBUG upgradeSkill: skillId=${skillId}, cost_interface=${cost}, energy_interface=${energyCost}`);
            
            // ✅ USAR SISTEMA REAL DE TREINAMENTO SE DISPONÍVEL
            if (window.game?.systems?.dataManager && typeof window.game.systems.dataManager.trainSkill === 'function') {
                console.log('🎯 Usando sistema real de treinamento via DataManager');
                
                const result = window.game.systems.dataManager.trainSkill(skillId);
                
                if (result && result.success) {
                    console.log(`✅ Skill ${skillId} treinada com sucesso! Novo nível: ${result.newLevel || 'N/A'}`);
                    
                    // Atualizar displays de recursos - TODOS OS SELETORES
                    if (result.remainingMoney !== undefined) {
                        const moneyFormatted = `$${result.remainingMoney.toLocaleString()}`;
                        document.querySelectorAll('#statMoney, #statMoneyInline, .money-display, .stat-cash .val').forEach(el => {
                            if (el) {
                                el.textContent = moneyFormatted;
                                console.log(`💰 Dinheiro atualizado: ${el.id || el.className} = ${moneyFormatted}`);
                            }
                        });
                    }
                    if (result.remainingEnergy !== undefined) {
                        document.querySelectorAll('#statEnergy, #statEnergyInline, .energy-display, .stat-energy .val').forEach(el => {
                            if (el) {
                                el.textContent = String(result.remainingEnergy);
                                console.log(`⚡ Energia atualizada: ${el.id || el.className} = ${result.remainingEnergy}`);
                            }
                        });
                    }
                    
                    // ✅ ATUALIZAR MODAL SEM FECHAR - apenas re-renderizar conteúdo
                    this._refreshSkillsModalInPlace();
                    
                    // Mostrar feedback de sucesso
                    this.showSkillUpgradeSuccess(skillId, result.newLevel);
                    
                } else {
                    console.log(`❌ Falha no treinamento: ${result?.reason || 'Erro desconhecido'}`);
                    alert(`❌ ${result?.reason || 'Recursos insuficientes ou erro no sistema'}`);
                }
                
            } else {
                console.log('⚠️ Sistema real não disponível, usando fallback...');
                
                // FALLBACK: Sistema básico que atualiza localStorage diretamente
                const currentMoney = parseInt(document.getElementById('statMoney')?.textContent?.replace(/[$,]/g, '') || '0');
                const currentEnergy = parseInt(document.getElementById('statEnergy')?.textContent || '100');
                
                if (currentMoney >= cost && currentEnergy >= energyCost) {
                    // Deduzir recursos
                    const newMoney = currentMoney - cost;
                    const newEnergy = currentEnergy - energyCost;
                    
                    // ✅ ATUALIZAR DADOS DAS HABILIDADES NO LOCALSTORAGE
                    try {
                        const gameData = JSON.parse(localStorage.getItem('risingstar_gamedata') || '{}');
                        if (!gameData.player) gameData.player = {};
                        if (!gameData.player.skills) gameData.player.skills = {};
                        
                        // Incrementar nível da habilidade
                        const currentLevel = gameData.player.skills[skillId] || 0;
                        const newLevel = currentLevel + 1;
                        gameData.player.skills[skillId] = newLevel;
                        
                        // Salvar recursos atualizados
                        gameData.player.money = newMoney;
                        gameData.player.energy = newEnergy;
                        
                        // Salvar no localStorage
                        localStorage.setItem('risingstar_gamedata', JSON.stringify(gameData));
                        
                        console.log(`✅ Skill ${skillId} incrementada de ${currentLevel} para ${newLevel} (fallback)`);
                        
                        // Atualizar UI - TODOS OS SELETORES
                        document.querySelectorAll('#statMoney, #statMoneyInline, .money-display, .stat-cash .val').forEach(el => {
                            if (el) {
                                el.textContent = `$${newMoney.toLocaleString()}`;
                                console.log(`💰 Dinheiro atualizado (fallback): ${el.id || el.className} = $${newMoney.toLocaleString()}`);
                            }
                        });
                        document.querySelectorAll('#statEnergy, #statEnergyInline, .energy-display, .stat-energy .val').forEach(el => {
                            if (el) {
                                el.textContent = String(newEnergy);
                                console.log(`⚡ Energia atualizada (fallback): ${el.id || el.className} = ${newEnergy}`);
                            }
                        });
                        
                        // ✅ ATUALIZAR MODAL SEM FECHAR - apenas re-renderizar conteúdo  
                        this._refreshSkillsModalInPlace();
                        
                        // Mostrar feedback
                        this.showSkillUpgradeSuccess(skillId, newLevel);
                        
                    } catch (error) {
                        console.error('❌ Erro ao salvar dados da habilidade:', error);
                        alert('❌ Erro ao salvar progresso da habilidade');
                    }
                } else {
                    console.log('❌ Recursos insuficientes para upgrade');
                    alert('❌ Recursos insuficientes! Você precisa de mais dinheiro ou energia.');
                }
            }
        } catch (error) {
            console.error('❌ Erro durante upgrade da skill:', error);
            alert('❌ Erro interno durante treinamento');
        } finally {
            // Liberar flag de upgrade
            this._upgrading = false;
        }
    }

    /**
     * ✅ Atualiza o conteúdo do modal de skills SEM fechar - apenas regera o HTML
     */
    _refreshSkillsModalInPlace() {
        const modal = document.getElementById('skills-modal');
        if (!modal || !modal.classList.contains('active')) {
            console.log('⚠️ Modal skills não está ativo, ignorando refresh');
            return;
        }
        
        console.log('🔄 Atualizando conteúdo do modal de skills IN-PLACE...');
        
        // 🎯 REGENERAR CONTEÚDO COM DADOS ATUALIZADOS
        const getSkillData = (skillKey, name, icon) => {
            let level = 0;
            let maxLevel = 100;
            
            try {
                // 🎯 PRIORIDADE 1: window.game.gameData.player.skills (dados sincronizados)
                if (window.game?.gameData?.player?.skills && 
                    typeof window.game.gameData.player.skills[skillKey] === 'number') {
                    level = window.game.gameData.player.skills[skillKey];
                    console.log(`🔄 Refresh - Skill ${skillKey} do gameData.player: level=${level}`);
                }
                // 🎯 PRIORIDADE 2: DataManager skillState 
                else if (window.game?.systems?.dataManager) {
                    const dm = window.game.systems.dataManager;
                    const skillState = dm.getSkillState(skillKey);
                    level = skillState.level || 0;
                    maxLevel = skillState.maxLevel || 100;
                    console.log(`🔄 Refresh - Skill ${skillKey} do skillState: level=${level}`);
                    
                    if (level === 0) {
                        const playerData = dm.loadPlayerData();
                        if (playerData?.skills && typeof playerData.skills[skillKey] === 'number') {
                            level = playerData.skills[skillKey];
                        }
                    }
                } else {
                    const gameData = JSON.parse(localStorage.getItem('risingstar_gamedata') || '{}');
                    if (gameData.player?.skills && typeof gameData.player.skills[skillKey] === 'number') {
                        level = gameData.player.skills[skillKey];
                    } else if (gameData.skills && typeof gameData.skills[skillKey] === 'number') {
                        level = gameData.skills[skillKey];
                    }
                }
            } catch (error) {
                console.warn(`Erro ao buscar dados da skill ${skillKey}:`, error);
            }
            
            let cost = 500;
            let energy = 20;
            try {
                if (window.game?.systems?.dataManager) {
                    cost = window.game.systems.dataManager.trainingMoneyCost(level);
                    energy = window.game.systems.dataManager.trainingEnergyCost(level);
                }
            } catch (error) {
                cost = Math.floor(500 * Math.pow(1.2, Math.floor(level / 10)));
                energy = Math.floor(20 * Math.pow(1.1, Math.floor(level / 20)));
            }
            
            return { id: skillKey, name, icon, level, maxLevel, cost, energy };
        };

        const artisticSkills = [
            getSkillData('vocals', 'Vocals', '🎤'),
            getSkillData('songWriting', 'Songwriting', '✍️'),
            getSkillData('rhythm', 'Rhythm', '🥁'),
            getSkillData('livePerformance', 'Live Performance', '🎭'),
            getSkillData('production', 'Production', '🎛️'),
            getSkillData('charisma', 'Charisma', '✨'),
            getSkillData('virality', 'Virality', '📱'),
            getSkillData('videoDirecting', 'Video Directing', '🎬')
        ];

        const businessSkills = [
            getSkillData('marketing', 'Marketing', '📈'),
            getSkillData('business', 'Business', '💼'),
            getSkillData('networking', 'Networking', '🤝'),
            getSkillData('management', 'Management', '📊')
        ];

        const renderSkillCategory = (title, icon, skills) => {
            const skillsHtml = skills.map(skill => {
                const progressPercent = (skill.level / skill.maxLevel) * 100;
                const canUpgrade = skill.level < skill.maxLevel;
                
                let currentEnergy = 100;
                let currentMoney = 0;
                try {
                    if (window.game?.systems?.dataManager) {
                        const energyInfo = window.game.systems.dataManager.getEnergyState();
                        currentEnergy = energyInfo.current;
                        const gd = window.game.systems.dataManager.loadGameData();
                        if (gd.player && typeof gd.player.money === 'number') {
                            currentMoney = gd.player.money;
                        } else if (typeof gd.money === 'number') {
                            currentMoney = gd.money;
                        }
                    }
                } catch (_) { /* fallback mantém defaults */ }
                const hasResources = (currentMoney >= skill.cost) && (currentEnergy >= skill.energy);
                
                return `
                    <div class="skill-item">
                        <div class="skill-header">
                            <div class="skill-name">
                                <span style="font-size: 16px;">${skill.icon}</span>
                                ${skill.name}
                            </div>
                            <div class="skill-level">${skill.level}/${skill.maxLevel}</div>
                        </div>
                        
                        <div class="skill-progress">
                            <div class="skill-progress-fill" style="width: ${progressPercent}%;"></div>
                        </div>
                        
                        <div class="skill-upgrade">
                            <div class="skill-cost">
                                <i class="fas fa-dollar-sign"></i> ${skill.cost}
                                <span style="margin-left: 8px;"><i class="fas fa-bolt"></i> ${skill.energy}</span>
                            </div>
                            <button 
                                class="skill-upgrade-btn" 
                                ${!canUpgrade || !hasResources ? 'disabled' : ''}
                                onclick="notificationModals.upgradeSkill('${skill.id}', ${skill.cost}, ${skill.energy})"
                            >
                                ${!canUpgrade ? 'MAX' : !hasResources ? 'Sem Recursos' : 'Upgrade'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="skills-category">
                    <h4 class="skills-category-title">
                        <span style="font-size: 18px;">${icon}</span>
                        ${title}
                    </h4>
                    <div class="skills-grid">
                        ${skillsHtml}
                    </div>
                </div>
            `;
        };

        const newContent = `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="notification-icon achievement">🌟</div>
                    <div class="notification-meta">
                        <div class="notification-source">Sistema de Desenvolvimento</div>
                        <div class="notification-timestamp">Invista em suas habilidades</div>
                    </div>
                </div>
                
                <h3 class="notification-title">Árvore de Habilidades</h3>
                <p class="notification-summary">Desenvolva suas habilidades artísticas e de negócios para alcançar o sucesso</p>
                
                <div style="margin: 20px 0;">
                    ${renderSkillCategory('Habilidades Artísticas', '🎨', artisticSkills)}
                    ${renderSkillCategory('Habilidades de Negócios', '💼', businessSkills)}
                </div>
                
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="notificationModals.resetSkills()">
                        <i class="fas fa-undo"></i> Reset Habilidades
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.skillsInfo()">
                        <i class="fas fa-info-circle"></i> Informações
                    </button>
                    <button class="notification-btn secondary" onclick="notificationModals.skillsPresets()">
                        <i class="fas fa-bookmark"></i> Presets
                    </button>
                </div>
            </div>
        `;
        
        // ✅ ATUALIZAR APENAS O BODY DO MODAL - SEM FECHAR
        const modalBody = modal.querySelector('.modern-modal-body');
        if (modalBody) {
            modalBody.innerHTML = newContent;
            console.log('✅ Modal skills atualizado in-place com novos dados!');
        } else {
            console.error('❌ Não foi possível encontrar .modern-modal-body');
        }
    }

    /**
     * ❌ MÉTODO ANTIGO - NÃO USAR MAIS
     */
    _updateSkillsModalContent() {
        // Método mantido para compatibilidade, mas não deve ser usado
        console.log('⚠️ _updateSkillsModalContent() chamado - redirecionando para _refreshSkillsModalInPlace()');
        this._refreshSkillsModalInPlace();
    }

    showSkillUpgradeSuccess(skillId, newLevel = null) {
        // Criar notificação de sucesso temporária
        const skillName = this.getSkillDisplayName ? this.getSkillDisplayName(skillId) : skillId;
        const message = newLevel ? `${skillName} atingiu nível ${newLevel}!` : `${skillName} aprimorada!`;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #34c759, #30d158);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 30000;
            box-shadow: 0 4px 20px rgba(52, 199, 89, 0.3);
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-check-circle"></i> 
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Obtém nome de exibição da skill
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
            videoDirecting: 'Direção de Vídeo',
            marketing: 'Marketing',
            business: 'Negócios',
            networking: 'Networking',
            management: 'Gestão'
        };
        return skillNames[skillKey] || skillKey;
    }

    // Métodos auxiliares para o sistema de habilidades
    resetSkills() { 
        if (confirm('Tem certeza que deseja resetar todas as habilidades? Isso custará $1000.')) {
            console.log('🔄 Resetando todas as habilidades'); 
            // Implementar lógica de reset
        }
    }
    
    skillsInfo() { 
        console.log('📖 Mostrando informações sobre habilidades'); 
        // Implementar modal de ajuda
    }
    
    skillsPresets() { 
        console.log('📚 Mostrando presets de build'); 
        // Implementar presets de construção de personagem
    }

    // Referências aos modais específicos já implementados
    openNewsModal_Streaming() {
        const newsData = {
            id: 'news-001',
            source: 'Billboard News',
            title: 'Streaming alcança números recordes em 2025',
            summary: 'O streaming musical atingiu 2.1 trilhões de reproduções globalmente no primeiro semestre, representando um crescimento de 15% em relação ao ano anterior.',
            timestamp: Date.now() - (2 * 60 * 60 * 1000),
            featured: true,
            fullArticle: `
                O mercado de streaming musical continua sua trajetória ascendente, com dados divulgados hoje mostrando que as plataformas digitais registraram 2.1 trilhões de reproduções no primeiro semestre de 2025.
                
                Este crescimento de 15% em relação ao mesmo período do ano anterior demonstra a consolidação do streaming como principal meio de consumo musical, superando inclusive as projeções mais otimistas da indústria.
                
                <h4>Principais Destaques:</h4>
                <ul>
                    <li>Hip-hop lidera com 35% das reproduções totais</li>
                    <li>Pop mantém 28% do market share</li>
                    <li>Música latina cresce 40% comparado a 2024</li>
                    <li>Podcasts musicais aumentaram 65%</li>
                </ul>
                
                Para artistas independentes, estes números representam oportunidades sem precedentes de alcançar audiências globais sem depender de grandes gravadoras.
            `,
            impact: {
                fama: +5,
                oportunidades: ['streaming_boost', 'label_interest']
            }
        };
        this.openNewsModal(newsData);
    }

    openNewsModal_Forbes() {
        const newsData = {
            id: 'news-003',
            source: 'Forbes Music Mogul',
            title: 'Artistas independentes faturam $4.2 bilhões em 2025',
            summary: 'Relatório exclusivo mostra como músicos sem contratos com major labels estão dominando o mercado digital e construindo impérios financeiros próprios.',
            timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000),
            featured: true,
            fullArticle: `
                O mercado de música independente atingiu a marca histórica de $4.2 bilhões em receitas durante o primeiro semestre de 2025, segundo dados exclusivos compilados pela Forbes.
                
                Este crescimento exponencial é alimentado por artistas que optaram por manter controle total sobre sua música, utilizando plataformas de distribuição digital e estratégias de marketing direto ao consumidor.
                
                <h4>Top 5 Estratégias de Sucesso:</h4>
                <ol>
                    <li>Engajamento direto nas redes sociais</li>
                    <li>Parcerias com marcas alinhadas ao público</li>
                    <li>Merchandising exclusivo e limitado</li>
                    <li>Experiências virtuais personalizadas</li>
                    <li>Diversificação em múltiplas plataformas</li>
                </ol>
            `,
            impact: {
                motivacao: +10,
                business_insights: true
            }
        };
        this.openNewsModal(newsData);
    }

    openMessageModal_Atlantic() {
        const messageData = {
            id: 'msg-001',
            sender: 'Atlantic Records',
            senderType: 'Gravadora',
            subject: 'Proposta de Contrato - Oportunidade Exclusiva',
            message: 'Ficamos impressionados com seu trabalho recente e gostaríamos de discutir uma parceria estratégica. Nossa proposta inclui suporte completo para produção, marketing e distribuição mundial.',
            timestamp: Date.now() - (30 * 60 * 1000),
            urgent: true,
            offer: {
                royalties: 15,
                advance: 250000,
                duration: '3 anos + 2 opcionais'
            },
            actions: [
                { action: 'accept', label: 'Aceitar Proposta', type: 'success', icon: 'check' },
                { action: 'counter', label: 'Contra-Proposta', type: 'primary', icon: 'handshake' },
                { action: 'decline', label: 'Recusar', type: 'danger', icon: 'times' },
                { action: 'schedule', label: 'Agendar Reunião', type: 'secondary', icon: 'calendar' }
            ]
        };
        this.openMessageModal(messageData);
    }

    openEventModal_RockInRio() {
        const eventData = {
            id: 'event-001',
            eventName: 'Rock in Rio Festival 2025',
            organizer: 'Rock in Rio Productions',
            description: 'Convite para se apresentar no maior festival de música da América Latina. Show de 45 minutos no Palco Mundo para uma audiência estimada de 100,000 pessoas.',
            date: '15 de Setembro, 2025',
            location: 'Rio de Janeiro, Brasil',
            type: 'Festival Internacional',
            payment: 180000,
            timestamp: Date.now() - (1 * 60 * 60 * 1000),
            requirements: [
                'Apresentação de 45 minutos',
                'Som próprio (será fornecido)',
                'Disponibilidade para ensaio técnico no dia anterior',
                'Presença em coletiva de imprensa'
            ]
        };
        this.openEventModal(eventData);
    }

    openEventModal_DJSnake() {
        const eventData = {
            id: 'event-003',
            eventName: 'Colaboração com DJ Snake',
            organizer: 'Premiere Classe Records',
            description: 'DJ Snake está procurando vocalists para seu próximo álbum. Sua voz foi especificamente solicitada para a faixa principal. Sessão de gravação agendada para próxima semana.',
            date: '20-22 de Setembro, 2025',
            location: 'Abbey Road Studios, London',
            type: 'Colaboração Musical',
            payment: 75000,
            timestamp: Date.now() - (3 * 60 * 60 * 1000),
            requirements: [
                'Disponibilidade por 3 dias consecutivos',
                'Vocal range: A2 - E5',
                'Experiência em música eletrônica (desejável)',
                'Flexibilidade criativa para experimentação'
            ]
        };
        this.openEventModal(eventData);
    }

    openNewsModal_Rolling() {
        const newsData = {
            id: 'news-002',
            source: 'Rolling Stone',
            title: 'Nova era do Hip-Hop está chegando',
            summary: 'Análise exclusiva sobre as tendências que estão moldando o futuro do hip-hop e como artistas emergentes estão redefinindo o gênero.',
            timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000),
            featured: true,
            fullArticle: `
                O hip-hop está passando por uma transformação revolucionária que promete redefinir completamente o gênero para a próxima década.
                
                Esta nova era é caracterizada pela fusão de elementos tradicionais com tecnologias emergentes, criando um som único que resonoa com uma geração digital nativa.
                
                <h4>Características da Nova Era:</h4>
                <ul>
                    <li>Integração de IA na produção musical</li>
                    <li>Colaborações virtuais em tempo real</li>
                    <li>Samples de culturas globais</li>
                    <li>Narrativas mais inclusivas e diversas</li>
                </ul>
                
                Artistas independentes estão liderando essa mudança, aproveitando plataformas digitais para alcançar audiências globais sem depender do sistema tradicional.
            `,
            impact: {
                criatividade: +8,
                network: ['hip_hop_producers', 'indie_artists']
            }
        };
        this.openNewsModal(newsData);
    }

    /**
     * 💾 Modal para Gerenciamento de Armazenamento
     */
    openStorageModal() {
        // Calcular dados de armazenamento
        const storageData = this.calculateStorageInfo();
        
        const content = `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="notification-icon achievement">💾</div>
                    <div class="notification-meta">
                        <div class="notification-source">Gerenciamento de Dados</div>
                        <div class="notification-timestamp">Controle seu armazenamento local</div>
                    </div>
                </div>
                
                <h3 class="notification-title">Informações de Armazenamento</h3>
                
                <div class="settings-section">
                    <h4 style="margin: 0 0 12px; color: #1d1d1f; font-size: 16px;">📊 Uso de Armazenamento</h4>
                    
                    <div class="storage-info" style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 12px; margin-bottom: 16px; backdrop-filter: blur(10px);">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
                            <div>
                                <div style="font-size: 12px; opacity: 0.7; margin-bottom: 4px;">Total Usado</div>
                                <div style="font-size: 18px; font-weight: 600; color: #007AFF;">${storageData.totalSizeFormatted}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; opacity: 0.7; margin-bottom: 4px;">Saves do Jogo</div>
                                <div style="font-size: 18px; font-weight: 600; color: #34C759;">${storageData.gameDataCount} saves</div>
                            </div>
                        </div>
                        
                        <div class="storage-breakdown" style="font-size: 14px; opacity: 0.8;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span>• Dados do Jogador:</span>
                                <span>${(storageData.playerDataSize / 1024).toFixed(1)} KB</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span>• Saves do Jogo:</span>
                                <span>${(storageData.gameDataSize / 1024).toFixed(1)} KB</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span>• Configurações:</span>
                                <span>${(storageData.settingsSize / 1024).toFixed(1)} KB</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>• Outros dados:</span>
                                <span>${(storageData.otherSize / 1024).toFixed(1)} KB</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h4 style="margin: 0 0 12px; color: #1d1d1f; font-size: 16px;">⚡ Ações Rápidas</h4>
                    
                    <div class="storage-actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button class="notification-btn primary" onclick="notificationModals.exportGameData()">
                            <i class="fas fa-download"></i> Exportar Dados
                        </button>
                        <button class="notification-btn secondary" onclick="notificationModals.importGameData()">
                            <i class="fas fa-upload"></i> Importar Dados
                        </button>
                    </div>
                </div>
                
                <div class="notification-actions">
                    <button class="notification-btn secondary" onclick="notificationModals.clearOldSaves()">
                        <i class="fas fa-broom"></i> Limpar Saves Antigos
                    </button>
                    <button class="notification-btn danger" onclick="notificationModals.confirmClearAllData()">
                        <i class="fas fa-trash"></i> Limpar Todos os Dados
                    </button>
                </div>
            </div>
        `;

        const modal = this.modalSystem.createModal({
            id: 'storage-modal',
            title: 'Gerenciamento de Armazenamento',
            content,
            size: 'notif-modal'
        });

        this.modalSystem.openModal(modal);
        return modal;
    }

    /**
     * Calcula informações de armazenamento
     */
    calculateStorageInfo() {
        let totalSize = 0;
        let gameDataSize = 0;
        let playerDataSize = 0;
        let settingsSize = 0;
        let otherSize = 0;
        let gameDataCount = 0;

        // Analisar localStorage
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const itemSize = localStorage.getItem(key).length;
                totalSize += itemSize;

                if (key.includes('save') || key.includes('game_data')) {
                    gameDataSize += itemSize;
                    gameDataCount++;
                } else if (key.includes('player') || key.includes('character')) {
                    playerDataSize += itemSize;
                } else if (key.includes('settings') || key.includes('config')) {
                    settingsSize += itemSize;
                } else {
                    otherSize += itemSize;
                }
            }
        }

        return {
            totalSize,
            totalSizeFormatted: totalSize > 1024 * 1024 ? 
                (totalSize / (1024 * 1024)).toFixed(1) + ' MB' : 
                (totalSize / 1024).toFixed(1) + ' KB',
            gameDataSize,
            playerDataSize,
            settingsSize,
            otherSize,
            gameDataCount
        };
    }

    /**
     * Exporta dados do jogo
     */
    exportGameData() {
        try {
            const gameData = {};
            
            // Coletar dados relevantes do localStorage
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key) && 
                    (key.includes('risingstar') || key.includes('save') || key.includes('game'))) {
                    gameData[key] = localStorage.getItem(key);
                }
            }

            const dataStr = JSON.stringify(gameData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(dataBlob);
            downloadLink.download = `rising-star-backup-${new Date().toISOString().split('T')[0]}.json`;
            downloadLink.click();
            
            // Mostrar confirmação
            if (window.notificationSystem) {
                window.notificationSystem.show({
                    type: 'success',
                    title: 'Dados Exportados',
                    message: 'Backup dos seus dados criado com sucesso!',
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            if (window.notificationSystem) {
                window.notificationSystem.show({
                    type: 'error',
                    title: 'Erro na Exportação',
                    message: 'Não foi possível criar o backup dos dados.',
                    duration: 3000
                });
            }
        }
    }

    /**
     * Importa dados do jogo
     */
    importGameData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const gameData = JSON.parse(e.target.result);
                    
                    // Confirmar antes de importar
                    if (confirm('Importar dados irá sobrescrever seus dados atuais. Continuar?')) {
                        for (let key in gameData) {
                            localStorage.setItem(key, gameData[key]);
                        }
                        
                        if (window.notificationSystem) {
                            window.notificationSystem.show({
                                type: 'success',
                                title: 'Dados Importados',
                                message: 'Dados restaurados com sucesso! Recarregue a página.',
                                duration: 5000
                            });
                        }
                    }
                } catch (error) {
                    console.error('❌ Erro ao importar dados:', error);
                    if (window.notificationSystem) {
                        window.notificationSystem.show({
                            type: 'error',
                            title: 'Erro na Importação',
                            message: 'Arquivo de backup inválido.',
                            duration: 3000
                        });
                    }
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    /**
     * Remove saves antigos (mantém apenas os 3 mais recentes)
     */
    clearOldSaves() {
        try {
            const saves = [];
            
            // Coletar todos os saves
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key) && 
                    (key.includes('save') || key.includes('backup'))) {
                    const data = localStorage.getItem(key);
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.timestamp || parsed.lastUpdated) {
                            saves.push({
                                key,
                                timestamp: parsed.timestamp || parsed.lastUpdated || 0
                            });
                        }
                    } catch (e) {
                        // Se não conseguir parsear, adicionar com timestamp 0
                        saves.push({ key, timestamp: 0 });
                    }
                }
            }
            
            // Ordenar por timestamp (mais recente primeiro)
            saves.sort((a, b) => b.timestamp - a.timestamp);
            
            // Remover saves antigos (manter apenas os 3 mais recentes)
            const savesToRemove = saves.slice(3);
            
            if (savesToRemove.length > 0) {
                savesToRemove.forEach(save => {
                    localStorage.removeItem(save.key);
                });
                
                if (window.notificationSystem) {
                    window.notificationSystem.show({
                        type: 'success',
                        title: 'Limpeza Concluída',
                        message: `${savesToRemove.length} saves antigos foram removidos.`,
                        duration: 3000
                    });
                }
            } else {
                if (window.notificationSystem) {
                    window.notificationSystem.show({
                        type: 'info',
                        title: 'Nenhuma Ação Necessária',
                        message: 'Não há saves antigos para remover.',
                        duration: 3000
                    });
                }
            }
        } catch (error) {
            console.error('❌ Erro ao limpar saves antigos:', error);
        }
    }

    /**
     * Confirma limpeza de todos os dados
     */
    confirmClearAllData() {
        const confirmed = confirm(
            'ATENÇÃO: Esta ação irá apagar TODOS os seus dados do jogo, incluindo saves, configurações e progresso.\n\n' +
            'Esta ação é IRREVERSÍVEL!\n\n' +
            'Tem certeza de que deseja continuar?'
        );
        
        if (confirmed) {
            const doubleConfirm = confirm('Última confirmação: Realmente deseja apagar TODOS os dados?');
            
            if (doubleConfirm) {
                this.clearAllGameData();
            }
        }
    }

    /**
     * Remove todos os dados do jogo
     */
    clearAllGameData() {
        try {
            // Identificar e remover chaves relacionadas ao jogo
            const keysToRemove = [];
            
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key) && 
                    (key.includes('risingstar') || key.includes('save') || 
                     key.includes('game') || key.includes('player') ||
                     key.includes('character'))) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Limpar IndexedDB se disponível
            if (window.game?.systems?.dataManager?.clearAllData) {
                window.game.systems.dataManager.clearAllData();
            }
            
            if (window.notificationSystem) {
                window.notificationSystem.show({
                    type: 'success',
                    title: 'Dados Removidos',
                    message: `${keysToRemove.length} entradas foram removidas. Recarregue a página.`,
                    duration: 5000
                });
            }
            
            // Fechar modal
            this.modalSystem.closeCurrentModal();
            
            // Recarregar a página após 2 segundos
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro ao limpar dados:', error);
            if (window.notificationSystem) {
                window.notificationSystem.show({
                    type: 'error',
                    title: 'Erro na Limpeza',
                    message: 'Não foi possível remover todos os dados.',
                    duration: 3000
                });
            }
        }
    }
}

// Instância global - inicializada após o modal system estar pronto
function initNotificationModals() {
    if (window.modernModalSystem) {
        window.notificationModals = new NotificationModals();
        console.log('📱 Notification Modals carregado após modal system');
    } else {
        // Tentar novamente em 100ms
        setTimeout(initNotificationModals, 100);
    }
}

// Inicializar após DOM ready
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(initNotificationModals, 50);
});

// Fallback para inicialização imediata
if (document.readyState !== 'loading') {
    setTimeout(initNotificationModals, 50);
}

// Para compatibilidade
window.NotificationModals = NotificationModals;