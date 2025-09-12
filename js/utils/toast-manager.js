/**
 * Sistema Unificado de Notificações Toast
 * Consolida os diferentes sistemas de notificação do projeto
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.queue = [];
        this.activeToasts = new Set();
        this.maxToasts = 5;
        this.init();
    }

    init() {
        // Criar ou reutilizar container existente
        this.container = document.getElementById('notificationContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notificationContainer';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Exibe um toast
     * @param {string|object} message - Mensagem ou objeto com propriedades
     * @param {string} type - Tipo: 'info', 'success', 'warning', 'error', 'award', 'collaboration'
     * @param {number} duration - Duração em ms (0 = permanente até clique)
     * @param {object} options - Opções extras: { title, actions, data }
     */
    show(message, type = 'info', duration = 5000, options = {}) {
        // Normalizar entrada
        let toast;
        if (typeof message === 'object') {
            toast = {
                title: message.title || options.title,
                message: message.message || message.body || '',
                type: message.type || type,
                duration: message.duration || duration,
                actions: message.actions || options.actions || [],
                data: message.data || options.data || {}
            };
        } else {
            toast = {
                title: options.title,
                message: message,
                type: type,
                duration: duration,
                actions: options.actions || [],
                data: options.data || {}
            };
        }

        toast.id = this.generateId();
        toast.timestamp = Date.now();

        // Adicionar à fila ou exibir imediatamente
        if (this.activeToasts.size >= this.maxToasts) {
            this.queue.push(toast);
        } else {
            this.renderToast(toast);
        }

        return toast.id;
    }

    renderToast(toast) {
        const element = document.createElement('div');
        element.className = `notification ${toast.type}`;
        element.dataset.toastId = toast.id;
        
        // Estrutura do toast
        let html = '';
        
        if (toast.title) {
            html += `<div class="notification-title">${this.escapeHtml(toast.title)}</div>`;
        }
        
        html += `<div class="notification-text-block">`;
        html += this.escapeHtml(toast.message);
        html += `</div>`;

        // Ações (se houver)
        if (toast.actions && toast.actions.length > 0) {
            html += `<div class="notification-actions">`;
            toast.actions.forEach(action => {
                html += `<button class="notification-action-btn" data-action="${action.id || action.action}">
                    ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                    ${this.escapeHtml(action.label || action.text)}
                </button>`;
            });
            html += `</div>`;
        }

        element.innerHTML = html;

        // Event listeners
        this.attachToastEvents(element, toast);

        // Adicionar ao DOM com animação
        this.container.appendChild(element);
        this.activeToasts.add(toast.id);

        // Trigger animação
        requestAnimationFrame(() => {
            element.classList.add('show');
        });

        // Auto-remove (se não for permanente)
        if (toast.duration > 0) {
            setTimeout(() => {
                this.remove(toast.id);
            }, toast.duration);
        }
    }

    attachToastEvents(element, toast) {
        // Clique no toast inteiro
        element.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-action-btn')) {
                return; // Deixar botões handlearem seus próprios clicks
            }
            this.handleToastClick(toast);
            this.remove(toast.id);
        });

        // Clique em ações específicas
        element.querySelectorAll('.notification-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const actionId = btn.dataset.action;
                this.handleActionClick(toast, actionId);
            });
        });
    }

    handleToastClick(toast) {
        // Emitir evento customizado para componentes interessados
        window.dispatchEvent(new CustomEvent('toastClick', {
            detail: { toast }
        }));

        // Log para debug
        console.log('🔔 Toast clicado:', toast);
    }

    handleActionClick(toast, actionId) {
        // Emitir evento customizado
        window.dispatchEvent(new CustomEvent('toastAction', {
            detail: { toast, actionId }
        }));

        // Log para debug
        console.log('🔔 Ação do toast:', actionId, toast);

        // Auto-remove após ação (opcional)
        this.remove(toast.id);
    }

    remove(toastId) {
        const element = this.container.querySelector(`[data-toast-id="${toastId}"]`);
        if (!element) return;

        // Animação de saída
        element.classList.remove('show');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.activeToasts.delete(toastId);
            this.processQueue();
        }, 300);
    }

    processQueue() {
        if (this.queue.length > 0 && this.activeToasts.size < this.maxToasts) {
            const nextToast = this.queue.shift();
            this.renderToast(nextToast);
        }
    }

    clear() {
        this.queue = [];
        this.activeToasts.forEach(id => this.remove(id));
    }

    generateId() {
        return 'toast_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Métodos de conveniência
    info(message, duration, options) {
        return this.show(message, 'info', duration, options);
    }

    success(message, duration, options) {
        return this.show(message, 'success', duration, options);
    }

    warning(message, duration, options) {
        return this.show(message, 'warning', duration, options);
    }

    error(message, duration, options) {
        return this.show(message, 'error', duration, options);
    }

    award(message, duration, options) {
        return this.show(message, 'award', duration, options);
    }

    collaboration(message, duration, options) {
        return this.show(message, 'collaboration', duration, options);
    }
}

// Instância global
window.toastManager = new ToastManager();

// Aliases para compatibilidade com código existente
window.showNotification = (message, type, duration, options) => {
    return window.toastManager.show(message, type, duration, options);
};

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastManager;
}

console.log('🔔 ToastManager carregado e disponível globalmente');