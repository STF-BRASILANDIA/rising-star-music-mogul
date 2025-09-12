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
                overflow: hidden !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
            }

            body .modern-modal.active {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translate(-50%, -50%) scale(1) !important;
            }

            body .modern-modal .modern-modal-header {
                padding: 20px 80px 16px 24px !important;
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
                padding: 0 40px 0 0 !important;
                display: block !important;
                text-align: center !important;
                max-width: calc(100% - 80px) !important;
                position: relative !important;
                line-height: 1.2 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
            }

            body .modern-modal .modern-modal-close {
                position: absolute !important;
                top: 12px !important; /* um pouco mais pra cima */
                right: 16px !important;
                width: 36px !important;
                height: 36px !important;
                border-radius: 50% !important;
                border: 1px solid rgba(0, 0, 0, 0.08) !important;
                background: rgba(255, 255, 255, 0.65) !important; /* mais visível em light */
                color: #000 !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: all 0.2s ease !important;
                font-size: 20px !important; /* X mais legível */
                font-weight: 700 !important;
                z-index: 10 !important;
                line-height: 1 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18) !important;
            }

            body .modern-modal .modern-modal-close:hover {
                background: rgba(255, 255, 255, 0.8) !important;
                transform: scale(1.07) !important;
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22) !important;
            }

            body .modern-modal .modern-modal-body {
                padding: 0 !important;
                overflow-y: auto !important;
                max-height: calc(90vh - 140px) !important;
                background: transparent !important;
            }

            body .modern-modal .modern-modal-footer {
                padding: 16px 24px 24px !important;
                border-top: 1px solid rgba(255, 255, 255, 0.3) !important;
                background: rgba(255, 255, 255, 0.9) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border-radius: 0 0 20px 20px !important;
                display: flex !important;
                gap: 12px !important;
                justify-content: flex-end !important;
            }

            /* Tamanhos de modais */
            body .modern-modal.notif-modal {
                width: 800px !important;
                max-width: 92vw !important;
            }

            /* 📱 Responsividade iOS/macOS */
            @media (max-width: 768px) {
                body .modern-modal {
                    width: 95vw !important;
                    height: 90vh !important;
                    max-width: none !important;
                    max-height: none !important;
                    border-radius: 16px !important;
                }
                
                body .modern-modal .modern-modal-header {
                    padding: 20px 20px 16px !important;
                }
                
                body .modern-modal .modern-modal-title {
                    font-size: 18px !important;
                }
            }

            /* 🌙 Dark mode support */
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
                
                body .modern-modal .modern-modal-close:hover {
                    background: rgba(255, 255, 255, 0.28) !important;
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
    }

    /**
     * Abre um modal
     */
    openModal(modalElement) {
        if (!modalElement) return;

        // Adiciona à pilha
        this.modalStack.push(modalElement);
        this.activeModals.add(modalElement);

        // Mostra backdrop
        this.showBackdrop();

        // Ativa modal
        modalElement.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Setup close button
        const closeBtn = modalElement.querySelector('.modern-modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal(modalElement);
        }

        console.log('🎭 Modal opened:', modalElement.id || 'unnamed');
    }

    /**
     * Fecha um modal específico
     */
    closeModal(modalElement) {
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
     * Cria um modal dinamicamente
     */
    createModal(options = {}) {
        const {
            id = 'dynamic-modal-' + Date.now(),
            title = 'Modal',
            content = '',
            size = 'medium',
            showFooter = false,
            footerContent = ''
        } = options;

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = `modern-modal ${size}`;

        modal.innerHTML = `
            <div class="modern-modal-header">
                <h2 class="modern-modal-title">${title}</h2>
                <button class="modern-modal-close" type="button">×</button>
            </div>
            <div class="modern-modal-body">
                ${content}
            </div>
            ${showFooter ? `
                <div class="modern-modal-footer">
                    ${footerContent}
                </div>
            ` : ''}
        `;

        // Adiciona event listener para o botão de fechar
        const closeBtn = modal.querySelector('.modern-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modal));
        }

        document.body.appendChild(modal);
        return modal;
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