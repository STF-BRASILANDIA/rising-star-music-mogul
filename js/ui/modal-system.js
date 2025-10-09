/**
 * 🎭 RISING STAR MUSIC MOGUL - MODAL SYSTEM
 * Sistema moderno de modais com Glassmorphism + iOS/macOS aesthetic
 * 
 * Features:
 * - Glassmorphism UI/UX
 * - iOS/macOS design language  
 * - Cards sólidos para conteúdo
 * - Animações fluidas
 * - Sistema responsivo
 */

class ModernModalSystem {
    constructor() {
        this.activeModals = new Set();
        this.modalStack = [];
        this.backdropElement = null;
        
        this.init();
    }

    init() {
        this.createBackdrop();
        this.injectStyles();
        this.setupEventListeners();
        
        console.log('🎭 Modern Modal System initialized');
    }

    /**
     * Cria backdrop glassmorphism para todos os modais
     */
    createBackdrop() {
        this.backdropElement = document.createElement('div');
        this.backdropElement.className = 'modern-modal-backdrop';
        this.backdropElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            z-index: 20000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        document.body.appendChild(this.backdropElement);
    }

    /**
     * Injeta estilos CSS modernos para o sistema
     */
    injectStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modern-modal-styles';
        styleSheet.textContent = `
            /* 🎨 MODERN MODAL SYSTEM STYLES - HIGH SPECIFICITY */
            
            body .modern-modal {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) scale(0.9) !important;
                background: rgba(255, 255, 255, 0.02) !important; /* quase transparente para destacar os cards */
                backdrop-filter: none !important; /* blur fica no backdrop e nos cards */
                -webkit-backdrop-filter: none !important;
                border: 1px solid rgba(255, 255, 255, 0.12) !important;
                border-radius: 20px !important;
                box-shadow: 
                    0 32px 64px rgba(0, 0, 0, 0.4),
                    0 16px 32px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
                z-index: 20001 !important;
                opacity: 0 !important;
                visibility: hidden !important;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                max-width: 90vw !important;
                max-height: 90vh !important;
                height: auto !important;
                min-height: auto !important;
                overflow: hidden !important;
                display: flex !important;
                flex-direction: column !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
            }

            body .modern-modal.active {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translate(-50%, -50%) scale(1) !important;
            }

            body .modern-modal .modern-modal-header {
                padding: 16px 40px 12px 20px !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
                background: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(30px) !important;
                -webkit-backdrop-filter: blur(30px) !important;
                display: block !important;
                text-align: center !important;
                border-radius: 20px 20px 0 0 !important;
                position: relative !important;
                width: 100% !important;
                box-sizing: border-box !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                box-shadow: 
                    0 4px 20px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
            }

            body .modern-modal .modern-modal-title {
                font-size: 18px !important;
                font-weight: 700 !important;
                color: #1d1d1f !important;
                margin: 0 !important;
                padding: 0 !important;
                display: block !important;
                text-align: center !important;
                max-width: calc(100% - 40px) !important;
                position: relative !important;
                line-height: 1.2 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
            }

            body .modern-modal .modern-modal-close,
            body .modern-modal button.modern-modal-close,
            .modern-modal .modern-modal-close,
            .modern-modal button.modern-modal-close {
                position: absolute !important;
                top: 12px !important;
                right: 10px !important;
                width: 30px !important;
                height: 30px !important;
                min-width: 30px !important;
                min-height: 30px !important;
                max-width: 30px !important;
                max-height: 30px !important;
                border-radius: 50% !important;
                border: none !important;
                background: #ff4757 !important;
                color: white !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                font-size: 18px !important;
                font-weight: 600 !important;
                z-index: 10 !important;
                line-height: 1 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
                box-shadow: 
                    0 4px 12px rgba(255, 71, 87, 0.3),
                    0 2px 4px rgba(0, 0, 0, 0.1) !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                text-shadow: none !important;
                transform: none !important;
            }

            body .modern-modal .modern-modal-close:hover,
            body .modern-modal button.modern-modal-close:hover,
            .modern-modal .modern-modal-close:hover,
            .modern-modal button.modern-modal-close:hover {
                background: #ff3742 !important;
                transform: scale(1.1) !important;
                box-shadow: 
                    0 6px 16px rgba(255, 71, 87, 0.4),
                    0 2px 8px rgba(0, 0, 0, 0.15) !important;
            }
            
            body .modern-modal .modern-modal-close:active {
                transform: scale(0.95) !important;
                box-shadow: 
                    0 1px 4px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
            }

            body .modern-modal .modern-modal-body {
                /* 🔧 Robustez para mobile: evitar que o conteúdo desapareça em webviews (iOS) */
                padding: 16px 18px 20px 18px !important;
                overflow-y: auto !important;
                max-height: calc(90vh - 100px) !important;
                background: transparent !important;
                flex: 1 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important;
                align-items: stretch !important;
                box-sizing: border-box !important;
                position: relative !important;
            }

            /* Garantir que filhos não sejam escondidos por CSS externo agressivo */
            body .modern-modal .modern-modal-body > * {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* Placeholder quando vazio (corrida de renderização) */
            body .modern-modal .modern-modal-body[data-empty="true"]::after {
                content: '⏳ Carregando conteúdo...';
                display: block !important;
                text-align: center !important;
                font-size: 14px !important;
                color: #555 !important;
                font-style: italic !important;
                padding: 8px 0 !important;
            }

            /* Ícone padrão X se botão vier vazio */
            body .modern-modal .modern-modal-close:empty::before,
            .modern-modal .modern-modal-close:empty::before { content: '×'; font-weight: 600; font-size: 20px; line-height: 1; }

            body .modern-modal .modern-modal-footer {
                padding: 12px 20px 16px !important;
                border-top: 1px solid rgba(255, 255, 255, 0.3) !important;
                background: rgba(255, 255, 255, 0.9) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border-radius: 0 0 20px 20px !important;
                display: flex !important;
                gap: 10px !important;
                justify-content: flex-end !important;
            }

            /* Tamanhos de modais otimizados - altura automática */
            body .modern-modal.small {
                width: 400px !important;
                max-width: 90vw !important;
                min-height: auto !important;
                height: fit-content !important;
                max-height: 80vh !important;
            }
            
            body .modern-modal.medium {
                width: 600px !important;
                max-width: 92vw !important;
                min-height: auto !important;
                height: fit-content !important;
                max-height: 85vh !important;
            }
            
            body .modern-modal.large {
                width: 800px !important;
                max-width: 95vw !important;
                min-height: auto !important;
                height: fit-content !important;
                max-height: 90vh !important;
            }
            
            body .modern-modal.extra-large {
                width: 1000px !important;
                max-width: 98vw !important;
                min-height: auto !important;
                height: fit-content !important;
                max-height: 95vh !important;
            }
            
            body .modern-modal.notif-modal {
                width: 800px !important;
                max-width: 92vw !important;
                min-height: auto !important;
                height: fit-content !important;
                max-height: 85vh !important;
            }

            /* 📱 Responsividade iOS/macOS */
            @media (max-width: 768px) {
                body .modern-modal {
                    width: 96vw !important;
                    height: fit-content !important;
                    min-height: auto !important;
                    max-width: none !important;
                    max-height: 95vh !important;
                    border-radius: 20px !important;
                }
                
                body .modern-modal .modern-modal-header {
                    padding: 16px 35px 12px 16px !important;
                }
                
                body .modern-modal .modern-modal-title {
                    font-size: 17px !important;
                    max-width: calc(100% - 35px) !important;
                }
                
                body .modern-modal .modern-modal-close {
                    top: 8px !important;
                    right: 8px !important;
                    width: 30px !important;
                    height: 30px !important;
                    min-width: 30px !important;
                    min-height: 30px !important;
                    max-width: 30px !important;
                    max-height: 30px !important;
                    font-size: 18px !important;
                    border-radius: 50% !important;
                }
                
                body .modern-modal .modern-modal-body {
                    max-height: calc(95vh - 90px) !important;
                }
                
                body .modern-modal .modern-modal-footer {
                    padding: 10px 16px 14px !important;
                }
            }

            /* � Estilos específicos por tipo de modal */
            
            /* Modal de Habilidades */
            body .modal-type-skills .skills-grid {
                display: grid !important;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
                gap: 16px !important;
                padding: 8px !important;
            }
            
            /* Modal do Estúdio */
            body .modal-type-studio .studio-workspace {
                display: flex !important;
                flex-direction: column !important;
                gap: 20px !important;
                padding: 8px !important;
            }
            
            /* Modal de Analytics */
            body .modal-type-analytics .analytics-dashboard {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 20px !important;
                padding: 8px !important;
            }
            
            /* Modal de Configurações */
            body .modal-type-settings .settings-container {
                display: flex !important;
                flex-direction: column !important;
                gap: 16px !important;
                padding: 8px !important;
            }
            
            /* Modal de Criação */
            body .modal-type-creation .creation-form {
                display: flex !important;
                flex-direction: column !important;
                gap: 20px !important;
                padding: 8px !important;
            }

            /* �🌙 Dark mode support */
            @media (prefers-color-scheme: dark) {
                body .modern-modal {
                    background: rgba(28, 28, 30, 0.10) !important; /* dark translúcido suave */
                    border: 1px solid rgba(255, 255, 255, 0.18) !important;
                }
                
                body .modern-modal .modern-modal-header {
                    background: linear-gradient(135deg, rgba(28, 28, 30, 0.25), rgba(28, 28, 30, 0.15)) !important;
                }
                
                body .modern-modal .modern-modal-title {
                    color: #f2f2f7 !important;
                }
                
                body .modern-modal .modern-modal-close {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(255, 255, 255, 0.25) !important;
                    color: rgba(255, 255, 255, 0.8) !important;
                }
                
                body .modern-modal .modern-modal-close:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: rgba(255, 255, 255, 1) !important;
                }
                
                body .modern-modal .modern-modal-footer {
                    background: rgba(28, 28, 30, 0.35) !important;
                }

                /* botão X mais visível no dark */
                body .modern-modal .modern-modal-close {
                    background: rgba(255, 255, 255, 0.22) !important;
                    color: #fff !important;
                    border: 1px solid rgba(255, 255, 255, 0.35) !important;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6) !important;
                    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35) !important;
                }
            }
        `;
        
        // Remove qualquer estilo anterior
        const existingStyle = document.getElementById('modern-modal-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(styleSheet);
    }

    /**
     * Configura event listeners globais
     */
    setupEventListeners() {
        // Fechar modal ao clicar no backdrop
        this.backdropElement.addEventListener('click', (e) => {
            if (e.target === this.backdropElement) {
                this.closeTopModal();
            }
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                this.closeTopModal();
            }
        });

        // Reajustar altura quando viewport mudar (rotate, resize, barra de endereço iOS)
        const resizeHandler = () => {
            if (!this.modalStack || this.modalStack.length === 0) return;
            // Ajustar apenas o topo (geralmente o que importa visualmente)
            const topModal = this.modalStack[this.modalStack.length - 1];
            this._adjustModalViewport(topModal);
        };
        window.addEventListener('resize', resizeHandler);
        window.addEventListener('orientationchange', () => setTimeout(resizeHandler, 120));
    }

    /**
     * Abre um modal
     */
    openModal(modalElement) {
        if (!modalElement) return;

        // 🚧 PREVENIR MÚLTIPLOS CLIQUES - Se este modal já está ativo, não abrir novamente
        if (this.activeModals.has(modalElement)) {
            console.log('🎭 Modal já está ativo, ignorando abertura duplicada:', modalElement.id || 'unnamed');
            return;
        }

        // Adiciona à pilha
        this.modalStack.push(modalElement);
        this.activeModals.add(modalElement);

        // Mostra backdrop
        this.showBackdrop();

        // Ativa modal
        modalElement.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 🩺 Diagnóstico: se o body estiver aparentemente vazio em 50ms, marcar para placeholder
        try {
            const bodyEl = modalElement.querySelector('.modern-modal-body');
            if (bodyEl) {
                bodyEl.toggleAttribute('data-empty', bodyEl.children.length === 0);
                setTimeout(() => {
                    if (bodyEl && bodyEl.isConnected) {
                        bodyEl.toggleAttribute('data-empty', bodyEl.children.length === 0 || bodyEl.innerText.trim().length === 0);
                    }
                }, 60);
            }
        } catch (diagErr) {
            console.warn('Modal body diag error', diagErr);
        }

        // Ajustar layout responsivo (especialmente em mobile onde estava sobrando espaço)
        setTimeout(() => this._adjustModalViewport(modalElement), 80);

        // Setup close button
        const closeBtn = modalElement.querySelector('.modern-modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal(modalElement);
        }

        console.log('🎭 Modal opened:', modalElement.id || 'unnamed');
    }

    /**
     * Ajusta altura e área scrollável do modal para aproveitar melhor o viewport em mobile.
     * Evita modais "baixos" que mostram só o topo do conteúdo.
     */
    _adjustModalViewport(modalElement) {
        if (!modalElement || !modalElement.classList) return;
        const isMobile = window.innerWidth <= 820; // margem de segurança para tablets pequenos
        if (!isMobile) {
            // Limpa estilos inline se existirem (desktop gerencia sozinho)
            modalElement.style.removeProperty('height');
            modalElement.style.removeProperty('max-height');
            const bodyEl = modalElement.querySelector('.modern-modal-body');
            if (bodyEl) bodyEl.style.removeProperty('max-height');
            return;
        }

        const header = modalElement.querySelector('.modern-modal-header');
        const footer = modalElement.querySelector('.modern-modal-footer');
        const bodyEl = modalElement.querySelector('.modern-modal-body');
        if (!bodyEl) return;

        const viewportH = window.innerHeight;
        // Usar até 90% do viewport deixando espaço para gesto/navegação
        const targetModalH = Math.min(Math.round(viewportH * 0.9), viewportH - 12);
        modalElement.style.height = targetModalH + 'px';
        modalElement.style.maxHeight = targetModalH + 'px';

        const headerH = header ? header.offsetHeight : 0;
        const footerH = footer ? footer.offsetHeight : 0;
        const paddingReserve = 8; // margem extra
        const bodyMax = targetModalH - headerH - footerH - paddingReserve;
        if (bodyMax > 80) { // sanity check
            bodyEl.style.maxHeight = bodyMax + 'px';
        }

        // Se o conteúdo for pequeno, não forçar altura enorme – ajustar para conteúdo mínimo de 60% viewport
        const naturalContentH = headerH + footerH + bodyEl.scrollHeight;
        if (naturalContentH < targetModalH * 0.6) {
            const minWanted = Math.round(viewportH * 0.6);
            modalElement.style.height = Math.min(minWanted, targetModalH) + 'px';
            modalElement.style.maxHeight = Math.min(minWanted, targetModalH) + 'px';
            bodyEl.style.maxHeight = (Math.min(minWanted, targetModalH) - headerH - footerH - paddingReserve) + 'px';
        }

        // Garantir scroll se o conteúdo excede
        bodyEl.style.overflowY = 'auto';
    }

    /**
     * Fecha um modal específico
     */
    closeModal(modalElement) {
        // Permitir passar um id (string) ou o próprio elemento
        if (typeof modalElement === 'string') {
            const byId = document.getElementById(modalElement);
            if (!byId) return;
            modalElement = byId;
        }
        if (!modalElement || !this.activeModals.has(modalElement)) return;

        // Remove da pilha e conjunto
        this.modalStack = this.modalStack.filter(m => m !== modalElement);
        this.activeModals.delete(modalElement);

        // Desativa modal
        modalElement.classList.remove('active');

        // Se não há mais modais, esconde backdrop
        if (this.modalStack.length === 0) {
            this.hideBackdrop();
            document.body.style.overflow = '';
        }

        console.log('🎭 Modal closed:', modalElement.id || 'unnamed');
    }

    /**
     * Fecha um modal pelo id
     */
    closeModalById(id) {
        const el = document.getElementById(id);
        if (el) this.closeModal(el);
    }

    /**
     * Fecha o modal do topo da pilha
     */
    closeTopModal() {
        if (this.modalStack.length > 0) {
            const topModal = this.modalStack[this.modalStack.length - 1];
            this.closeModal(topModal);
        }
    }

    /**
     * Mostra o backdrop
     */
    showBackdrop() {
        this.backdropElement.style.opacity = '1';
        this.backdropElement.style.visibility = 'visible';
    }

    /**
     * Esconde o backdrop
     */
    hideBackdrop() {
        this.backdropElement.style.opacity = '0';
        this.backdropElement.style.visibility = 'hidden';
    }

    /**
     * Atualiza o conteúdo (body) de um modal existente
     */
    updateModalContent(id, newHtml) {
        const modal = document.getElementById(id);
        if (!modal) return false;
        const body = modal.querySelector('.modern-modal-body');
        if (!body) return false;
        body.innerHTML = newHtml;
        return true;
    }

    /**
     * Cria um modal dinamicamente com tipos padronizados
     * 
     * Tipos disponíveis:
     * - 'standard': Modal padrão (título + conteúdo + botão fechar)
     * - 'skills': Modal de habilidades com layout de cards
     * - 'studio': Modal do estúdio com layout de gravação
     * - 'analytics': Modal de estatísticas com gráficos
     * - 'settings': Modal de configurações com abas
     * - 'creation': Modal de criação com formulários
     */
    createModal(options = {}) {
        const {
            id = 'dynamic-modal-' + Date.now(),
            title = 'Modal',
            content = '',
            size = 'medium',
            type = 'standard',
            showFooter = false,
            footerContent = '',
            customClass = ''
        } = options;

        // 🚧 VERIFICAR SE JÁ EXISTE UM MODAL COM ESTE ID
        const existingModal = document.getElementById(id);
        if (existingModal) {
            console.log('🎭 Modal já existe, retornando o existente:', id);
            return existingModal;
        }

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = `modern-modal ${size} modal-type-${type} ${customClass}`.trim();

        // Define o layout baseado no tipo
        const modalLayout = this.getModalLayout(type, { title, content, showFooter, footerContent });
        modal.innerHTML = modalLayout;

        // Adiciona event listener para o botão de fechar
        const closeBtn = modal.querySelector('.modern-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modal));
        }

        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Define o layout do modal baseado no tipo
     */
    getModalLayout(type, { title, content, showFooter, footerContent }) {
        const baseHeader = `
            <div class="modern-modal-header">
                <h2 class="modern-modal-title">${title}</h2>
                <button class="modern-modal-close" type="button"></button>
            </div>
        `;

        const baseFooter = showFooter ? `
            <div class="modern-modal-footer">
                ${footerContent}
            </div>
        ` : '';

        switch (type) {
            case 'skills':
                return `
                    ${baseHeader}
                    <div class="modern-modal-body modal-skills-layout">
                        <div class="skills-grid">
                            ${content}
                        </div>
                    </div>
                    ${baseFooter}
                `;

            case 'studio':
                return `
                    ${baseHeader}
                    <div class="modern-modal-body modal-studio-layout">
                        <div class="studio-workspace">
                            ${content}
                        </div>
                    </div>
                    ${baseFooter}
                `;

            case 'analytics':
                return `
                    ${baseHeader}
                    <div class="modern-modal-body modal-analytics-layout">
                        <div class="analytics-dashboard">
                            ${content}
                        </div>
                    </div>
                    ${baseFooter}
                `;

            case 'settings':
                return `
                    ${baseHeader}
                    <div class="modern-modal-body modal-settings-layout">
                        <div class="settings-container">
                            ${content}
                        </div>
                    </div>
                    ${baseFooter}
                `;

            case 'creation':
                return `
                    ${baseHeader}
                    <div class="modern-modal-body modal-creation-layout">
                        <div class="creation-form">
                            ${content}
                        </div>
                    </div>
                    ${baseFooter}
                `;

            case 'standard':
            default:
                return `
                    ${baseHeader}
                    <div class="modern-modal-body">
                        ${content}
                    </div>
                    ${baseFooter}
                `;
        }
    }
}

// Instância global - inicializada após DOM ready
window.addEventListener('DOMContentLoaded', function() {
    window.modernModalSystem = new ModernModalSystem();
    console.log('🎭 Modern Modal System carregado após DOM ready');
});

// Fallback para inicialização imediata se DOM já estiver pronto
if (document.readyState === 'loading') {
    // DOM ainda carregando, aguardar evento
} else {
    // DOM já carregado
    window.modernModalSystem = new ModernModalSystem();
    console.log('🎭 Modern Modal System carregado imediatamente');
}

// Para compatibilidade, também adiciona ao objeto global
window.ModernModalSystem = ModernModalSystem;