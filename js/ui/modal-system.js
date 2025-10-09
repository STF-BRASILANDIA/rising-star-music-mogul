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
        this.injectHardeningStyles();
        this.setupEventListeners();
        
        console.log('🎭 Modern Modal System initialized');
    }

    /**
     * Injeta uma camada de CSS de "hardening" que desativa efeitos residuais
     * de sistemas de modal antigos quando nenhum modal moderno está aberto.
     */
    injectHardeningStyles() {
        const id = 'modern-modal-hardening';
        if (document.getElementById(id)) return;
        const style = document.createElement('style');
        style.id = id;
        style.textContent = `
            /* HARDENING LAYER - neutraliza interferências quando não há modais modernos abertos */
            body:not(.mm-open) .modern-modal-backdrop { display: none !important; opacity:0 !important; visibility:hidden !important; pointer-events:none !important; }
            body:not(.mm-open) .modern-modal { opacity:0 !important; visibility:hidden !important; pointer-events:none !important; }
            /* Restaura pointer-events se algum estilo legado deixou o body travado */
            body:not(.mm-open) { pointer-events:auto !important; }
            /* Alguns seletores legados comuns */
            body:not(.mm-open) #songComposerModal { pointer-events:auto !important; }
            /* Evita que overlays órfãos bloqueiem a tela */
            body:not(.mm-open) .overlay, 
            body:not(.mm-open) .modal-overlay, 
            body:not(.mm-open) .backdrop, 
            body:not(.mm-open) .legacy-modal-backdrop { pointer-events:none !important; opacity:0 !important; }
            /* Scroll area refinada */
            .modern-modal .modern-modal-body.mm-scrollable { overscroll-behavior: contain; scrollbar-width: thin; }
            .modern-modal .modern-modal-body.mm-scrollable::-webkit-scrollbar { width: 8px; }
            .modern-modal .modern-modal-body.mm-scrollable::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 6px; }
            .modern-modal .modern-modal-body.mm-scrollable::-webkit-scrollbar-track { background: transparent; }
            .modern-modal .modern-modal-body.mm-force-scroll { overflow-y:auto !important; position:relative; }
            .modern-modal .modern-modal-body.mm-force-scroll > .mm-inner-scroll { min-height: fit-content; }
            .modern-modal .modern-modal-body.mm-force-scroll > .mm-inner-scroll { display:block; }
            /* Bloqueio de chain scroll */
            body.mm-open { overscroll-behavior: contain; }
            body.mm-open .modern-modal .modern-modal-body,
            body.mm-open .modern-modal .modern-modal-body.mm-scrollable,
            body.mm-open .modern-modal .modern-modal-body.mm-force-scroll { touch-action: pan-y; overscroll-behavior: contain; }
            /* Ativação discreta de scroll quando necessário */
            .modern-modal .modern-modal-body.mm-scroll-active { overflow-y:auto !important; -webkit-overflow-scrolling:touch; }
            .modern-modal .modern-modal-body { max-height: var(--mm-body-max, auto); }
        `;
        document.head.appendChild(style);
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
            z-index: 999998;
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
                z-index: 1000000 !important;
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

            /* Remover margin-top herdada de safe-area-global que desloca o centro */
            body .modern-modal { margin-top: 0 !important; }

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
                /* 🔧 Mobile scroll fix: altura definida + overflow garantido */
                padding: 16px 18px 20px 18px !important;
                overflow-y: scroll !important;
                height: auto !important;
                min-height: 150px !important;
                max-height: var(--mm-body-max, calc(90vh - 100px)) !important;
                background: transparent !important;
                display: block !important;
                box-sizing: border-box !important;
                position: relative !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* Layouts específicos com rolagem explícita */
            body .modern-modal .modern-modal-body.modal-skills-layout,
            body .modern-modal .modern-modal-body.modal-settings-layout {
                overflow-y: auto !important;
                overscroll-behavior: contain !important;
            }
            body .modern-modal .modern-modal-body.modal-skills-layout > .skills-grid,
            body .modern-modal .modern-modal-body.modal-settings-layout > .settings-container {
                display: block !important;
                min-height: fit-content !important;
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

            /* 📱 FULL SCREEN MOBILE SHEET MODE (aplicado via classe .mobile-full) */
            @media (max-width: 810px) {
                body .modern-modal.mobile-full {
                    top: calc(env(safe-area-inset-top, 0px) + 8px) !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important; /* remove translateY para usar top */
                    width: 100vw !important;
                    max-width: 100vw !important;
                    height: calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 16px) !important;
                    max-height: calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 16px) !important;
                    border-radius: 24px 24px 28px 28px !important;
                }
                body .modern-modal.mobile-full .modern-modal-header {
                    position: sticky !important;
                    top: 0 !important;
                    z-index: 5 !important;
                }
                body .modern-modal.mobile-full .modern-modal-body {
                    /* header + footer dinâmicos via variáveis setadas no JS */
                    --mm-header-h: 60px;
                    --mm-footer-h: 0px;
                    max-height: calc(
                        100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 16px - var(--mm-header-h) - var(--mm-footer-h)
                    ) !important;
                }
                body .modern-modal.mobile-full.has-footer .modern-modal-body {
                    max-height: calc(
                        100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 16px - var(--mm-header-h) - var(--mm-footer-h)
                    ) !important;
                }
                body .modern-modal.mobile-full .modern-modal-footer {
                    position: sticky !important;
                    bottom: 0 !important;
                    z-index: 6 !important;
                    backdrop-filter: blur(20px) !important;
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

        // Memoriza foco anterior na primeira abertura da pilha
        if (!this.modalStack.length) {
            this._lastFocusedBeforeOpen = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }

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
        // Marcar body como tendo modal aberto (classe em vez de só manipular overflow direto)
        if (!document.body.classList.contains('mm-open')) {
            document.body.classList.add('mm-open');
        }
        if (document.body.style.overflow !== 'hidden') {
            document.body.style.overflow = 'hidden';
        }

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
    // Agendar observadores de conteúdo / scroll após layout inicial
    setTimeout(() => this._attachContentObserver(modalElement), 140);

        // Setup close button - evitar listeners duplicados
        const closeBtn = modalElement.querySelector('.modern-modal-close');
        if (closeBtn && !closeBtn.hasAttribute('data-listener-set')) {
            closeBtn.onclick = () => this.closeModal(modalElement);
            closeBtn.setAttribute('data-listener-set', 'true');
        }

        console.log('🎭 Modal opened:', modalElement.id || 'unnamed');
        // Foco inicial acessível
        setTimeout(() => {
            try {
                const auto = modalElement.querySelector('[autofocus]');
                const target = auto || modalElement.querySelector('.modern-modal-close') || modalElement;
                if (target && target.focus) target.focus({ preventScroll: true });
            } catch {}
        }, 30);

        // Configurar bloqueio de scroll de fundo e permitir apenas dentro do body
        this._setupScrollIsolation(modalElement);

        // Observar crescimento dinâmico de conteúdo e reajustar viewport
        this._attachResizeObserver(modalElement);

        // Auto-fix caso overflow não esteja habilitado corretamente
        setTimeout(() => this._autoFixScroll(modalElement), 140);
    }

    /**
     * Ajusta altura e área scrollável do modal para aproveitar melhor o viewport em mobile.
     * Evita modais "baixos" que mostram só o topo do conteúdo.
     */
    _adjustModalViewport(modalElement) {
        if (!modalElement || !modalElement.classList) return;
        const bodyEl = modalElement.querySelector('.modern-modal-body');
        if (!bodyEl) return;
        // Garantir que o body funcione como área flexível scrollável
        bodyEl.style.display = 'block';
        bodyEl.style.flex = '1 1 auto';
        const header = modalElement.querySelector('.modern-modal-header');
        const footer = modalElement.querySelector('.modern-modal-footer');
        const isMobile = window.innerWidth <= 810;

        const vh = window.innerHeight;
        const headerH = header ? header.getBoundingClientRect().height : 0;
        const footerH = footer ? footer.getBoundingClientRect().height : 0;

        // Reset de estilos possivelmente antigos antes de recalcular
        bodyEl.style.removeProperty('height');
        bodyEl.style.removeProperty('min-height');
        bodyEl.style.removeProperty('max-height');
        bodyEl.classList.add('mm-scrollable');

        if (isMobile) {
            // Aplicar layout sheet full-screen controlado
            if (!modalElement.classList.contains('mobile-full')) modalElement.classList.add('mobile-full');
            const usable = vh - 16; // pequena margem
            modalElement.style.height = usable + 'px';
            modalElement.style.maxHeight = usable + 'px';
            modalElement.style.top = 'calc(env(safe-area-inset-top, 0px) + 8px)';
            modalElement.style.left = '50%';
            // variáveis ajudam o CSS a recalcular se necessário
            modalElement.style.setProperty('--mm-header-h', headerH + 'px');
            modalElement.style.setProperty('--mm-footer-h', footerH + 'px');
            const bodyMax = usable - headerH - footerH - 6;
            const finalBodyMax = bodyMax > 40 ? bodyMax : Math.max(usable - headerH - footerH - 6, 120);
            bodyEl.style.maxHeight = finalBodyMax + 'px';
            modalElement.style.setProperty('--mm-body-max', finalBodyMax + 'px');
            bodyEl.style.overflowY = 'auto';
            bodyEl.style.webkitOverflowScrolling = 'touch';
        } else {
            // Desktop / large screen: comportamento centrado, altura automática até limite
            modalElement.classList.remove('mobile-full');
            // Limpar estilos que interferem na centralização
            ['height','max-height','top','left'].forEach(p => modalElement.style.removeProperty(p));
            const targetMax = Math.min(Math.round(vh * 0.82), vh - 120); // ~82% do viewport ou menos
            const bodyMax = targetMax - headerH - footerH - 8;
            if (bodyMax > 160) {
                bodyEl.style.maxHeight = bodyMax + 'px';
                modalElement.style.setProperty('--mm-body-max', bodyMax + 'px');
            } else {
                bodyEl.style.removeProperty('max-height');
                modalElement.style.setProperty('--mm-body-max', bodyMax > 0 ? bodyMax + 'px' : '');
            }
            bodyEl.style.overflowY = 'auto';
            bodyEl.style.webkitOverflowScrolling = 'touch';
            // Fallback se conteúdo exceder e nenhuma max-height aplicada
            if (!bodyEl.style.maxHeight) {
                const approx = Math.round(vh * 0.7);
                if (bodyEl.scrollHeight > approx) {
                    bodyEl.style.maxHeight = approx + 'px';
                    modalElement.style.setProperty('--mm-body-max', approx + 'px');
                }
            }
        }

        // Fallback adicional: se ainda não houver scroll mas conteúdo extrapola
        setTimeout(() => {
            try {
                if (bodyEl.scrollHeight > bodyEl.clientHeight + 4 && getComputedStyle(bodyEl).overflowY === 'visible') {
                    bodyEl.style.overflowY = 'auto';
                }
                this._recalcBodyScroll(modalElement);
            } catch {}
        }, 120);
    }

    /**
     * Observa alterações de conteúdo para manter scroll consistente sem mudar design.
     */
    _attachContentObserver(modalElement) {
        if (!modalElement || !modalElement.isConnected) return;
        const bodyEl = modalElement.querySelector('.modern-modal-body');
        if (!bodyEl) return;
        // Evitar múltiplos
        if (!this._contentObservers) this._contentObservers = new Map();
        if (this._contentObservers.has(modalElement)) return;

        const recalc = () => this._recalcBodyScroll(modalElement);
        let lastH = bodyEl.scrollHeight;
        const mo = new MutationObserver(() => {
            const current = bodyEl.scrollHeight;
            if (Math.abs(current - lastH) > 24) {
                lastH = current;
                recalc();
            }
        });
        try { mo.observe(bodyEl, { childList: true, subtree: true, characterData: true }); } catch {}
        // ResizeObserver se disponível
        let ro = null;
        if (window.ResizeObserver) {
            ro = new ResizeObserver(() => recalc());
            try { ro.observe(bodyEl); } catch {}
        }
        this._contentObservers.set(modalElement, { mo, ro });
        // Recalc inicial
        recalc();
    }

    /**
     * Recalcula necessidade de scroll e ativa classe sem alterar layout visual.
     */
    _recalcBodyScroll(modalElement) {
        const bodyEl = modalElement && modalElement.querySelector('.modern-modal-body');
        if (!bodyEl) return;
        const needsScroll = bodyEl.scrollHeight > bodyEl.clientHeight + 2;
        bodyEl.classList.toggle('mm-scroll-active', needsScroll);
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

        // Desativa modal - remover classes mobile e limpar estilos inline
        modalElement.classList.remove('active', 'mobile-full');
        ['height', 'max-height', 'top', 'left'].forEach(prop => {
            modalElement.style.removeProperty(prop);
        });

        // Limpar event listeners e atributo de controle
        const closeBtn = modalElement.querySelector('.modern-modal-close');
        if (closeBtn) {
            closeBtn.onclick = null;
            closeBtn.removeAttribute('data-listener-set');
        }

        // 🔧 CORREÇÃO CRÍTICA: sempre restaurar overflow mesmo com outros modais
        // (evita travamento de interação que é o bug principal)
        if (this.modalStack.length === 0) {
            this.hideBackdrop();
            this._forceRestoreBodyInteraction();
            document.body.classList.remove('mm-open');
            this._postCloseAudit();
        } else {
            // Verificar se ainda há modais realmente visíveis
            const hasVisibleModals = this.modalStack.some(m => 
                m.classList && m.classList.contains('active') && 
                m.style.display !== 'none' && 
                m.style.visibility !== 'hidden'
            );
            if (!hasVisibleModals) {
                this.hideBackdrop();
                this._forceRestoreBodyInteraction();
                // Limpar pilha órfã
                this.modalStack = [];
                this.activeModals.clear();
                document.body.classList.remove('mm-open');
                this._postCloseAudit();
            }
        }

        console.log('🎭 Modal closed:', modalElement.id || 'unnamed');
        if (!this.modalStack.length && this._lastFocusedBeforeOpen) {
            try { this._lastFocusedBeforeOpen.focus({ preventScroll: true }); } catch {}
            this._lastFocusedBeforeOpen = null;
        }
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
     * 🚑 FUNÇÃO DE EMERGÊNCIA: força restauração da interação do body
     * Resolve o bug crítico de não conseguir clicar após fechar modal
     */
    _forceRestoreBodyInteraction() {
        const attempts = [
            () => { document.body.style.overflow = 'auto'; },
            () => { document.body.style.overflow = ''; },
            () => { document.body.style.removeProperty('overflow'); },
            () => { document.body.style.cssText = document.body.style.cssText.replace(/overflow:[^;]+;?/g, ''); },
            () => { if (document.body.style.overflow === 'hidden') { document.body.style.overflow = 'visible'; setTimeout(() => document.body.style.removeProperty('overflow'), 50); } }
        ];
        attempts.forEach((fn,i)=>setTimeout(fn, i*40));
        setTimeout(()=>{ if (!this.modalStack.length && getComputedStyle(document.body).overflow === 'hidden') { document.body.style.overflow = 'auto'; } }, 350);
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
            customClass = '',
            ariaLabel = null,
            describedBy = null
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
    // Acessibilidade
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    const headingId = `${id}-title`;
    modal.setAttribute('aria-labelledby', headingId);
    if (ariaLabel) modal.setAttribute('aria-label', ariaLabel);
    if (describedBy) modal.setAttribute('aria-describedby', describedBy);

        // Define o layout baseado no tipo
    const modalLayout = this.getModalLayout(type, { id, title, content, showFooter, footerContent });
        modal.innerHTML = modalLayout;

        // Adiciona event listener para o botão de fechar - evitar duplicação
        const closeBtn = modal.querySelector('.modern-modal-close');
        if (closeBtn && !closeBtn.hasAttribute('data-listener-set')) {
            closeBtn.addEventListener('click', () => this.closeModal(modal));
            closeBtn.setAttribute('data-listener-set', 'true');
        }

        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Define o layout do modal baseado no tipo
     */
    getModalLayout(type, options = {}) {
        const { id, title = 'Modal', content = '', showFooter = false, footerContent = '' } = options;
        const safeId = id || ('modal-' + Date.now());
        const baseHeader = `
            <div class="modern-modal-header">
                <h2 class="modern-modal-title" id="${safeId}-title">${title}</h2>
                <button class="modern-modal-close" type="button" aria-label="Fechar"></button>
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
                    <div class="modern-modal-body modal-skills-layout mm-force-scroll">
                        <div class="skills-grid mm-inner-scroll">
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
                    <div class="modern-modal-body modal-settings-layout mm-force-scroll">
                        <div class="settings-container mm-inner-scroll">
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

    /**
     * 🚑 FUNÇÃO DE EMERGÊNCIA GLOBAL: limpar todos os modais e restaurar interação
     * Chame esta função se modais ficarem travado: window.modernModalSystem.emergencyCleanup()
     */
    emergencyCleanup() {
        console.warn('🚑 EMERGENCY MODAL CLEANUP - forçando limpeza de todos os modais');
        
        // Fechar todos os modais da pilha
        [...this.modalStack].forEach(modal => {
            if (modal && modal.classList) {
                modal.classList.remove('active', 'mobile-full');
                modal.style.display = 'none';
            }
        });
        
        // Limpar state
        this.modalStack = [];
        this.activeModals.clear();
        
        // Forçar limpeza do backdrop
        if (this.backdropElement) {
            this.backdropElement.style.opacity = '0';
            this.backdropElement.style.visibility = 'hidden';
            this.backdropElement.style.display = 'none';
            setTimeout(() => {
                if (this.backdropElement) this.backdropElement.style.removeProperty('display');
            }, 300);
        }
        
        // Múltiplas tentativas de restaurar body
        this._forceRestoreBodyInteraction();
        
        // Remover todos os modais órfãos do DOM
        document.querySelectorAll('.modern-modal').forEach(modal => {
            if (!modal.classList.contains('active')) {
                modal.style.display = 'none';
                setTimeout(() => modal.remove(), 500);
            }
        });
        
        console.log('🚑 Emergency cleanup completed - body interaction restored');
        return true;
    }

    /**
     * Força a restauração da interação do body (múltiplas tentativas)
     */
    /* (removido: duplicata antiga de _forceRestoreBodyInteraction) */

    /**
     * Audit pós-fechamento para remover overlays órfãos ou elementos que bloqueiam interação.
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-modal', 'true');
                const headingId = `${id}-title`;
                modal.setAttribute('aria-labelledby', headingId);
                if (ariaLabel) modal.setAttribute('aria-label', ariaLabel);
                if (describedBy) modal.setAttribute('aria-describedby', describedBy);
     */
    _postCloseAudit() {
        try {
            // 1. Remover backdrops órfãos visíveis
            document.querySelectorAll('.modern-modal-backdrop').forEach(bd => {
                if (!this.modalStack.length) {
                    bd.style.opacity = '0';
                    bd.style.visibility = 'hidden';
                    setTimeout(() => { if (bd.parentElement && !this.modalStack.length) bd.style.removeProperty('display'); }, 300);
                }
            });

            // 2. Normalizar pointer-events de body se algum overlay deixou travado
            if (!this.modalStack.length) {
                document.body.style.pointerEvents = 'auto';
                ['overflow','overflowY','overflowX'].forEach(p => {
                    if (getComputedStyle(document.body)[p] === 'hidden') {
                        document.body.style[p] = 'auto';
                    }
                });
            }

            // 3. Detectar elementos full-screen que possam estar bloqueando
            if (!this.modalStack.length) {
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const blockers = [...document.querySelectorAll('div,section')]
                    .filter(el => {
                        if (!el.isConnected) return false;
                        const cs = getComputedStyle(el);
                        if (cs.pointerEvents === 'auto') return false;
                        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
                        const r = el.getBoundingClientRect();
                        const covers = r.width >= vw * 0.9 && r.height >= vh * 0.9 && r.top <= 5 && r.left <= 5;
                        if (!covers) return false;
                            const baseFooter = showFooter ? `
                                <div class="modern-modal-footer">
                                    ${footerContent}
                                </div>
                            ` : '';
                        // Evitar mexer em elementos do jogo conhecidos (canvas, main game container)
                        const id = (el.id||'').toLowerCase();
                        if (id.includes('game') || id.includes('root')) return false;
                        return true;
                    });
                blockers.forEach(el => {
                    el.style.pointerEvents = 'none';
                });
            }
            // Watchdog: garante limpeza final após breve delay
            setTimeout(() => {
                if (!this.modalStack.length) {
                    document.body.classList.remove('mm-open');
                    if (getComputedStyle(document.body).overflow === 'hidden') {
                        document.body.style.overflow = 'auto';
                        setTimeout(() => document.body.style.removeProperty('overflow'), 80);
                    }
                    // Remover listeners globais de bloqueio se não há mais modais
                    if (this._scrollBlockers) {
                        this._scrollBlockers.forEach(off => { try { off(); } catch {} });
                        this._scrollBlockers = null;
                    }
                }
            }, 500);
        } catch (err) {
            console.warn('Post close audit error', err);
        }
    }

    /**
     * Observa mudanças de conteúdo e recalcula viewport se necessário.
     */
    _attachResizeObserver(modalElement) {
        if (!modalElement || !modalElement.isConnected) return;
        const bodyEl = modalElement.querySelector('.modern-modal-body');
        if (!bodyEl) return;
        if (bodyEl._mmObserverAttached) return;
        const ro = new MutationObserver((muts) => {
            // Evitar spam: debounce simples
            if (bodyEl._mmResizeTimer) clearTimeout(bodyEl._mmResizeTimer);
            bodyEl._mmResizeTimer = setTimeout(() => {
                try { this._adjustModalViewport(modalElement); this._autoFixScroll(modalElement); } catch {}
            }, 60);
        });
        ro.observe(bodyEl, { childList: true, subtree: true, characterData: true });
        bodyEl._mmObserverAttached = true;
        bodyEl._mmObserver = ro;
    }

    /**
     * Corrige automaticamente se o scroll deveria existir mas não está presente.
     */
    _autoFixScroll(modalElement) {
        if (!modalElement) return;
        const bodyEl = modalElement.querySelector('.modern-modal-body');
        if (!bodyEl) return;
        const needsScroll = bodyEl.scrollHeight > bodyEl.clientHeight + 4;
        const cs = getComputedStyle(bodyEl);
        if (needsScroll && !(cs.overflowY === 'auto' || cs.overflowY === 'scroll')) {
            bodyEl.style.overflowY = 'auto';
        }
        // Se ainda sem scroll, tentar forçar max-height com base no viewport
        if (needsScroll && bodyEl.scrollHeight <= window.innerHeight && !bodyEl.style.maxHeight) {
            bodyEl.style.maxHeight = Math.round(window.innerHeight * 0.82) + 'px';
        }
    }

    /**
     * API pública para recalcular manualmente (debug / scripts externos)
     */
    recalcAllModals() {
        this.modalStack.forEach(m => { this._adjustModalViewport(m); this._autoFixScroll(m); });
    }

    /**
     * Configura isolamento de scroll: impede que wheel/touch move "escape" para o fundo.
     */
    _setupScrollIsolation(modalElement) {
        let bodyEl = modalElement.querySelector('.modern-modal-body');
        // Fallback: alguns modais (ex notificações legado) podem ter .notification-modal
        if (!bodyEl) {
            const notif = modalElement.querySelector('.notification-modal');
            if (notif) {
                // Normalizar estilo para se comportar como conteúdo interno
                notif.style.position = 'relative';
                notif.style.width = '100%';
                notif.style.height = 'auto';
                notif.style.maxHeight = 'none';
                // Criar wrapper body se necessário
                const wrapper = document.createElement('div');
                wrapper.className = 'modern-modal-body mm-scrollable';
                // Mover filhos do notif para wrapper (mantém notif como container neutro)
                while (notif.firstChild) wrapper.appendChild(notif.firstChild);
                notif.appendChild(wrapper);
                bodyEl = wrapper;
            }
        }
        if (!bodyEl) return;
        if (!this._scrollBlockers) this._scrollBlockers = [];

        const isScrollable = (el) => {
            if (!el) return false;
            const cs = getComputedStyle(el);
            const oy = cs.overflowY;
            return (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 2;
        };

    const target = bodyEl;
        target.classList.add('mm-scrollable');
        target.style.overscrollBehavior = 'contain';

        // Função que trava propagação para fundo
        const wheelHandler = (e) => {
            const scrollable = isScrollable(target);
            if (!scrollable) return; // deixa navegador tentar; fallback de altura ajusta depois
            const delta = e.deltaY;
            const atTop = target.scrollTop <= 0;
            const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;
            if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
                // bloquear propagação para fundo
                e.preventDefault();
            }
        };
        const touchState = { startY: 0, lastY:0 };
        const touchStart = (e) => {
            if (e.touches && e.touches.length) {
                touchState.startY = touchState.lastY = e.touches[0].clientY;
            }
        };
        const touchMove = (e) => {
            if (!e.touches || !e.touches.length) return;
            const y = e.touches[0].clientY;
            const diff = y - touchState.lastY;
            touchState.lastY = y;
            if (!isScrollable(target)) { e.preventDefault(); return; }
            const atTop = target.scrollTop <= 0;
            const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;
            if ((diff > 0 && atTop) || (diff < 0 && atBottom)) {
                e.preventDefault();
            }
        };
        const preventBackdrop = (e) => { e.preventDefault(); };

        // Listeners (passive:false para poder prevenir)
    target.addEventListener('wheel', wheelHandler, { passive: false });
        target.addEventListener('touchstart', touchStart, { passive: false });
        target.addEventListener('touchmove', touchMove, { passive: false });
        this.backdropElement.addEventListener('wheel', preventBackdrop, { passive: false });
        this.backdropElement.addEventListener('touchmove', preventBackdrop, { passive: false });

        // Guardar removers
    this._scrollBlockers.push(() => target.removeEventListener('wheel', wheelHandler, { passive: false }));
        this._scrollBlockers.push(() => target.removeEventListener('touchstart', touchStart, { passive: false }));
        this._scrollBlockers.push(() => target.removeEventListener('touchmove', touchMove, { passive: false }));
        this._scrollBlockers.push(() => this.backdropElement.removeEventListener('wheel', preventBackdrop, { passive: false }));
        this._scrollBlockers.push(() => this.backdropElement.removeEventListener('touchmove', preventBackdrop, { passive: false }));
    }

    /**
     * Diagnóstico: loga info de scroll das instâncias abertas.
     */
    debugScrollStatus() {
        const modals = document.querySelectorAll('.modern-modal.active');
        console.group('[ModalScrollDebug]');
        modals.forEach(m => {
            const body = m.querySelector('.modern-modal-body');
            if (!body) { console.log(m.id,'SEM BODY'); return; }
            const info = {
                id: m.id || '(sem id)',
                bodyClient: body.clientHeight,
                bodyScroll: body.scrollHeight,
                overflowY: getComputedStyle(body).overflowY,
                hasScroll: body.scrollHeight > body.clientHeight + 2,
                classes: body.className
            };
            console.log(info);
        });
        console.groupEnd();
    }
}

// Instância global - inicializada após DOM ready
(function initializeModalSystem() {
    if (window.modernModalSystem) {
        console.log('🎭 Modern Modal System já existe, ignorando reinicialização');
        return;
    }

    const initialize = () => {
        window.modernModalSystem = new ModernModalSystem();
        console.log('🎭 Modern Modal System inicializado');
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();

// Para compatibilidade, também adiciona ao objeto global
window.ModernModalSystem = ModernModalSystem;

/**
 * 🚑 FUNÇÃO DE EMERGÊNCIA GLOBAL
 * Se os botões ficarem travados após fechar modal, execute no console:
 * window.fixModalInteraction()
 */
window.fixModalInteraction = function() {
    console.log('🚑 Executando correção de emergência...');
    
    // Forçar limpeza do body
    document.body.style.overflow = '';
    document.body.style.removeProperty('overflow');
    
    // Esconder todos os backdrops órfãos
    const backdrops = document.querySelectorAll('.modern-modal-backdrop');
    backdrops.forEach(backdrop => {
        backdrop.style.opacity = '0';
        backdrop.style.visibility = 'hidden';
    });
    
    // Desativar todos os modais órfãos
    const modals = document.querySelectorAll('.modern-modal.active');
    modals.forEach(modal => {
        modal.classList.remove('active', 'mobile-full');
        modal.style.removeProperty('height');
        modal.style.removeProperty('max-height');
        modal.style.removeProperty('top');
        modal.style.removeProperty('left');
    });
    
    // Limpar pilha de modais
    if (window.modernModalSystem) {
        window.modernModalSystem.modalStack = [];
        window.modernModalSystem.activeModals.clear();
    }
    
    setTimeout(() => {
        document.body.style.overflow = 'auto';
        setTimeout(() => document.body.style.removeProperty('overflow'), 100);
    }, 150);
    
    console.log('✅ Correção aplicada! Tente clicar nos botões agora.');
};

// 🚑 FUNÇÃO GLOBAL DE EMERGÊNCIA (pode ser chamada do console)
window.fixModalsBug = function() {
    console.log('🚑 EMERGÊNCIA: Forçando limpeza de modais...');
    
    // Primeira abordagem: usar sistema se disponível
    if (window.modernModalSystem && window.modernModalSystem.emergencyCleanup) {
        return window.modernModalSystem.emergencyCleanup();
    }
    
    // Fallback manual crítico
    console.log('🔧 Aplicando correção manual...');
    document.body.style.overflow = '';
    document.body.style.removeProperty('overflow');
    document.body.style.overflowX = '';
    document.body.style.overflowY = '';
    
    // Forçar recálculo
    document.body.offsetHeight;
    
    // Esconder todos os modais e backdrops
    document.querySelectorAll('.modern-modal').forEach(m => {
        m.style.display = 'none';
        m.classList.remove('active', 'mobile-full');
    });
    document.querySelectorAll('.modern-modal-backdrop').forEach(b => {
        b.style.display = 'none';
        b.style.opacity = '0';
        b.style.visibility = 'hidden';
    });
    
    console.log('✅ Correção manual aplicada! Body overflow:', document.body.style.overflow);
    return true;
};

// Shortcut ainda mais rápido
window.fixModals = window.fixModalsBug;