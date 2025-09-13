/**
 * 🎮 SISTEMA DE MODAIS DO MENU - Rising Star: Music Mogul
 * Modais específicos para cada botão do menu principal
 * Usando o padrão Modern Modal System existente
 */

class MenuModals {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        this.bindEvents();
        console.log('🎭 Sistema de modais do menu inicializado');
    }

    bindEvents() {
        // Aguardar que o sistema de modal moderno esteja carregado
        const initializeButtons = () => {
            if (!window.modernModalSystem) {
                setTimeout(initializeButtons, 100);
                return;
            }

            // Botões do menu principal
            const buttons = [
                { id: 'loadGameBtn', modal: 'loadGame' },
                { id: 'testDashboardBtn', modal: 'testDashboard' },
                { id: 'helpBtn', modal: 'help' },
                { id: 'creditsBtn', modal: 'credits' }
            ];

            buttons.forEach(btn => {
                const element = document.getElementById(btn.id);
                if (element) {
                    // Interceptar clique para mostrar modal primeiro
                    element.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.showModal(btn.modal, btn.id);
                    });
                }
            });

            // Botão "Novo Jogo" executa diretamente sem modal
            const newGameBtn = document.getElementById('newGameBtn');
            if (newGameBtn) {
                // Preservar o comportamento original do botão
                console.log('🎮 Botão "Novo Jogo" mantém comportamento original (sem modal)');
            }

            console.log('🎭 Botões do menu vinculados ao sistema de modal');
        };

        initializeButtons();
    }

    showModal(type, buttonId) {
        if (!window.modernModalSystem) {
            console.error('Sistema de modal moderno não disponível');
            return;
        }

        const modalId = `menu-modal-${type}`;
        
        // 🚧 VERIFICAR SE JÁ EXISTE UM MODAL COM ESTE ID
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            console.log(`🎭 Modal ${type} já existe, apenas ativando:`, modalId);
            window.modernModalSystem.openModal(existingModal);
            this.activeModal = existingModal;
            return;
        }

        const modalData = this.getModalData(type, buttonId);
        
        // Criar modal usando o sistema existente
        const modal = window.modernModalSystem.createModal({
            id: modalId,
            title: modalData.title,
            content: modalData.content,
            size: modalData.size || 'medium',
            showFooter: modalData.showFooter || false,
            footerContent: modalData.footerContent || ''
        });

        // Adicionar classes específicas para estilo
        modal.classList.add('menu-modal', `menu-modal-${type}`);
        
        // Mostrar modal
        window.modernModalSystem.openModal(modal);
        this.activeModal = modal;
        
        // Bind eventos específicos do modal
        this.bindModalEvents(type, buttonId, modal);
        
        console.log(`🎭 Modal ${type} criado e exibido:`, modalId);
    }

    hideModal() {
        if (this.activeModal && window.modernModalSystem) {
            window.modernModalSystem.closeModal(this.activeModal);
            this.activeModal = null;
        }
    }

    getModalData(type, buttonId) {
        switch (type) {
            case 'loadGame':
                return this.getLoadGameModalData();
            case 'testDashboard':
                return this.getTestDashboardModalData();
            case 'help':
                return this.getHelpModalData();
            case 'credits':
                return this.getCreditsModalData();
            default:
                return { title: 'Modal', content: '<p>Modal não encontrado</p>' };
        }
    }

    getLoadGameModalData() {
        return {
            title: '<i class="fas fa-folder-open"></i> Carregar Jogo',
            size: 'large',
            content: `
                <div class="menu-modal-content">
                    <div class="save-slots" id="saveSlotsList">
                        <div class="loading-saves">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Carregando saves...</p>
                        </div>
                    </div>
                    
                    <div class="import-section">
                        <h3>Importar Save</h3>
                        <div class="import-options">
                            <button class="modern-btn secondary import-btn" onclick="window.menuModals.importFromFile()">
                                <i class="fas fa-file-upload"></i>
                                Importar de Arquivo
                            </button>
                            <button class="modern-btn secondary import-btn" onclick="window.menuModals.importFromCloud()">
                                <i class="fas fa-cloud-download-alt"></i>
                                Baixar da Nuvem
                            </button>
                        </div>
                    </div>
                </div>
            `
        };
    }

    getTestDashboardModalData() {
        return {
            title: '<i class="fas fa-flask"></i> Testar Dashboard',
            size: 'large',
            content: `
                <div class="menu-modal-content">
                    <div class="test-options">
                        <h3>Opções de Teste:</h3>
                        
                        <div class="test-option" data-test="quick">
                            <div class="test-icon">
                                <i class="fas fa-rocket"></i>
                            </div>
                            <div class="test-info">
                                <h4>Teste Rápido</h4>
                                <p>Inicie com personagem pré-configurado e dados de exemplo.</p>
                                <div class="test-features">
                                    <span class="feature"><i class="fas fa-clock"></i> 30 segundos</span>
                                    <span class="feature"><i class="fas fa-user"></i> Perfil automático</span>
                                    <span class="feature"><i class="fas fa-music"></i> 5 músicas exemplo</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="test-option" data-test="full">
                            <div class="test-icon">
                                <i class="fas fa-cogs"></i>
                            </div>
                            <div class="test-info">
                                <h4>Teste Completo</h4>
                                <p>Acesso total ao dashboard com todas as funcionalidades ativas.</p>
                                <div class="test-features">
                                    <span class="feature"><i class="fas fa-unlock-alt"></i> Todos os recursos</span>
                                    <span class="feature"><i class="fas fa-database"></i> Dados realistas</span>
                                    <span class="feature"><i class="fas fa-chart-line"></i> Analytics completos</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="test-option" data-test="debug">
                            <div class="test-icon">
                                <i class="fas fa-bug"></i>
                            </div>
                            <div class="test-info">
                                <h4>Modo Debug</h4>
                                <p>Dashboard com console de desenvolvedor e ferramentas de debug.</p>
                                <div class="test-features">
                                    <span class="feature"><i class="fas fa-terminal"></i> Console ativo</span>
                                    <span class="feature"><i class="fas fa-eye"></i> Logs visíveis</span>
                                    <span class="feature"><i class="fas fa-tools"></i> Dev tools</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        };
    }

    getHelpModalData() {
        return {
            title: '<i class="fas fa-question-circle"></i> Como Jogar',
            size: 'large',
            showFooter: true,
            footerContent: `
                <button class="modern-btn primary" onclick="window.menuModals.startTutorial()">
                    <i class="fas fa-graduation-cap"></i> Iniciar Tutorial
                </button>
            `,
            content: `
                <div class="menu-modal-content">
                    <div class="help-content">
                        <div class="help-card" data-section="basics">
                            <div class="help-icon">
                                <i class="fas fa-play"></i>
                            </div>
                            <div class="help-info">
                                <h3><i class="fas fa-play"></i> Primeiros Passos</h3>
                                <ul class="help-details">
                                    <li>Crie seu personagem e defina seu nome artístico</li>
                                    <li>Escolha sua localização e gênero musical inicial</li>
                                    <li>Distribua pontos de habilidade estrategicamente</li>
                                    <li>Comece criando suas primeiras músicas</li>
                                </ul>
                                <div class="help-extra" style="display: none;">
                                    <p><strong>Dicas avançadas:</strong></p>
                                    <ul>
                                        <li>Invista em habilidades que complementem seu gênero musical</li>
                                        <li>Considere o mercado local ao escolher seu estilo inicial</li>
                                        <li>Mantenha um equilíbrio entre criatividade e aspectos comerciais</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-card" data-section="music">
                            <div class="help-icon">
                                <i class="fas fa-music"></i>
                            </div>
                            <div class="help-info">
                                <h3><i class="fas fa-music"></i> Sistema Musical</h3>
                                <ul class="help-details">
                                    <li>Cada música tem qualidade baseada em suas habilidades</li>
                                    <li>Gêneros musicais afetam popularidade por região</li>
                                    <li>Colaborações aumentam alcance e qualidade</li>
                                    <li>Tendências musicais mudam dinamicamente</li>
                                </ul>
                                <div class="help-extra" style="display: none;">
                                    <p><strong>Sistema de qualidade:</strong></p>
                                    <ul>
                                        <li>Qualidade Bronze: 0-30 pontos</li>
                                        <li>Qualidade Prata: 31-60 pontos</li>
                                        <li>Qualidade Ouro: 61-85 pontos</li>
                                        <li>Qualidade Platina: 86-100 pontos</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-card" data-section="progression">
                            <div class="help-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="help-info">
                                <h3><i class="fas fa-chart-line"></i> Progressão</h3>
                                <ul class="help-details">
                                    <li>Ganhe XP através de atividades musicais</li>
                                    <li>Eventos aleatórios oferecem oportunidades</li>
                                    <li>Gerencie energia e inspiração cuidadosamente</li>
                                    <li>Construa relacionamentos com outros artistas</li>
                                </ul>
                                <div class="help-extra" style="display: none;">
                                    <p><strong>Recursos importantes:</strong></p>
                                    <ul>
                                        <li>Energia: Necessária para todas as atividades</li>
                                        <li>Inspiração: Melhora a criatividade musical</li>
                                        <li>Dinheiro: Para investimentos e despesas</li>
                                        <li>Fama: Aumenta oportunidades e público</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-card" data-section="financial">
                            <div class="help-icon">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="help-info">
                                <h3><i class="fas fa-dollar-sign"></i> Sistema Financeiro</h3>
                                <ul class="help-details">
                                    <li>Receitas vêm de streaming, shows e vendas</li>
                                    <li>Invista em equipamentos e marketing</li>
                                    <li>Contratos de gravadora oferecem estabilidade</li>
                                    <li>Gerencie despesas mensais cuidadosamente</li>
                                </ul>
                                <div class="help-extra" style="display: none;">
                                    <p><strong>Fontes de receita:</strong></p>
                                    <ul>
                                        <li>Streaming: Receita passiva por reproduções</li>
                                        <li>Shows: Receita ativa por apresentações</li>
                                        <li>Merchandising: Produtos personalizados</li>
                                        <li>Royalties: Direitos autorais e licenciamento</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        };
    }

    getCreditsModalData() {
        return {
            title: '<i class="fas fa-users"></i> Créditos',
            size: 'large',
            content: `
                <div class="menu-modal-content">
                    <div class="credits-content">
                        <div class="credits-section">
                            <h3><i class="fas fa-code"></i> Desenvolvimento</h3>
                            <div class="credit-item">
                                <h4>Programação Principal</h4>
                                <p>Sistema modular, IA de simulação, mecânicas de jogo</p>
                            </div>
                            <div class="credit-item">
                                <h4>Interface & UX</h4>
                                <p>Design responsivo, sistema de componentes, experiência móvel</p>
                            </div>
                        </div>
                        
                        <div class="credits-section">
                            <h3><i class="fas fa-paint-brush"></i> Design</h3>
                            <div class="credit-item">
                                <h4>Visual Design</h4>
                                <p>Tema glassmorphism, paleta de cores, iconografia</p>
                            </div>
                            <div class="credit-item">
                                <h4>Experiência do Usuário</h4>
                                <p>Fluxos de navegação, feedback visual, acessibilidade</p>
                            </div>
                        </div>
                        
                        <div class="credits-section">
                            <h3><i class="fas fa-database"></i> Sistema</h3>
                            <div class="credit-item">
                                <h4>Persistência de Dados</h4>
                                <p>Sistema de saves, backup automático, sincronização</p>
                            </div>
                            <div class="credit-item">
                                <h4>Inteligência Artificial</h4>
                                <p>Simulação de mercado, eventos dinâmicos, NPCs</p>
                            </div>
                        </div>
                        
                        <div class="credits-section">
                            <h3><i class="fas fa-heart"></i> Agradecimentos</h3>
                            <div class="credit-item">
                                <h4>Inspirações</h4>
                                <p>Music industry simulators, tycoon games, rhythm games</p>
                            </div>
                            <div class="credit-item">
                                <h4>Tecnologias</h4>
                                <p>Vanilla JavaScript, CSS3, Progressive Web App, FontAwesome</p>
                            </div>
                        </div>
                        
                        <div class="version-info">
                            <h3><i class="fas fa-info-circle"></i> Versão</h3>
                            <p><strong>Rising Star: Music Mogul v2.0</strong></p>
                            <p>Build: ${new Date().toISOString().split('T')[0]}</p>
                            <p>Arquitetura: Modular Progressive Web App</p>
                        </div>
                    </div>
                </div>
            `
        };
    }

    bindModalEvents(type, buttonId, modal) {
        // Eventos específicos de cada modal
        switch (type) {
            case 'loadGame':
                this.bindLoadGameEvents(modal);
                break;
            case 'testDashboard':
                this.bindTestDashboardEvents(modal);
                break;
            case 'help':
                this.bindHelpEvents(modal);
                break;
        }
    }

    bindLoadGameEvents(modal) {
        // Carregar lista de saves após o modal estar completamente carregado
        setTimeout(() => {
            this.loadSavesList();
        }, 100);
    }

    bindTestDashboardEvents(modal) {
        const testOptions = modal.querySelectorAll('.test-option');
        testOptions.forEach(option => {
            option.addEventListener('click', () => {
                const testMode = option.dataset.test;
                this.startDashboardTest(testMode);
            });
        });
    }

    bindHelpEvents(modal) {
        // Adicionar efeitos de interação aos cards
        const helpCards = modal.querySelectorAll('.help-card');
        helpCards.forEach(card => {
            card.addEventListener('click', () => {
                // Expandir/contrair apenas o conteúdo extra, mantendo o estilo
                const extraContent = card.querySelector('.help-extra');
                const arrow = card.querySelector('.help-info h3::after');
                
                if (extraContent) {
                    const isExpanded = extraContent.style.display !== 'none';
                    extraContent.style.display = isExpanded ? 'none' : 'block';
                    
                    // Atualizar estado visual da seta sem mudar o card
                    card.classList.toggle('expanded', !isExpanded);
                }
            });
        });
    }

    // Métodos de ação
    startDashboardTest(testMode) {
        console.log(`🧪 Iniciando teste do dashboard: ${testMode}`);
        this.hideModal();
        
        // Configurar dados de teste baseado no modo
        if (testMode === 'quick') {
            this.setupQuickTest();
        } else if (testMode === 'debug') {
            this.setupDebugMode();
        }
        
        // Disparar evento original do botão
        const testBtn = document.getElementById('testDashboardBtn');
        if (testBtn && testBtn.click) {
            // Remover interceptor temporariamente
            this.tempDisableInterceptor = true;
            setTimeout(() => {
                testBtn.click();
                this.tempDisableInterceptor = false;
            }, 100);
        }
    }

    async loadSavesList() {
        const container = document.getElementById('saveSlotsList');
        if (!container) return;
        
        try {
            // Buscar perfis salvos do sistema real
            let profiles = [];
            
            // Verificar se o data manager está disponível (global ou via game)
            const dm = window.dataManager || window.game?.systems?.dataManager;
            if (dm) {
                if (typeof dm.getAllProfiles === 'function') {
                    profiles = await dm.getAllProfiles();
                }
                // Fallback: tentar getSavedGames caso profiles esteja vazio
                if ((!profiles || profiles.length === 0) && typeof dm.getSavedGames === 'function') {
                    const saves = await dm.getSavedGames();
                    if (Array.isArray(saves) && saves.length > 0) {
                        profiles = saves.map(s => ({
                            id: s.id,
                            playerName: s.playerName || 'Artista',
                            lastPlayed: s.lastPlayed || new Date().toISOString(),
                            timestamp: s.timestamp || Date.now()
                        }));
                    }
                }
            }
            
            // Se não há saves ou data manager não está disponível, mostrar dados exemplo
            if (profiles.length === 0) {
                container.innerHTML = `
                    <div class="no-saves">
                        <i class="fas fa-inbox"></i>
                        <p>Nenhum save encontrado</p>
                        <small>Comece um novo jogo para criar seu primeiro save</small>
                    </div>
                `;
                return;
            }
            
            // Construir HTML dos saves
            let savesHTML = '';
            profiles.slice(0, 6).forEach((profile, index) => { // Máximo 6 saves
                const lastPlayedDate = new Date(profile.lastPlayed);
                const timeDiff = this.getTimeSince(lastPlayedDate);
                
                savesHTML += `
                    <div class="save-slot" data-slot="${profile.id}">
                        <div class="save-info">
                            <h4><i class="fas fa-user-circle"></i> ${profile.playerName || 'Artista'}</h4>
                            <p class="save-details">
                                <span class="save-meta">
                                    <i class="fas fa-calendar"></i> ${timeDiff}
                                </span>
                            </p>
                            <small class="save-id">ID: ${profile.id}</small>
                        </div>
                        <div class="save-actions">
                            <button class="modern-btn primary" onclick="window.menuModals.loadSave('${profile.id}')">
                                <i class="fas fa-play"></i> Carregar
                            </button>
                            <button class="modern-btn secondary" onclick="window.menuModals.deleteSave('${profile.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = savesHTML;
            
        } catch (error) {
            console.error('❌ Erro ao carregar saves:', error);
            
            // Fallback para dados exemplo
            container.innerHTML = `
                <div class="save-slot demo-save">
                    <div class="save-info">
                        <h4><i class="fas fa-user-circle"></i> MC Exemplo (Demo)</h4>
                        <p class="save-details">
                            <span class="save-meta">
                                <i class="fas fa-calendar"></i> Save de demonstração
                            </span>
                        </p>
                        <small class="save-id">Este é um save de exemplo</small>
                    </div>
                    <div class="save-actions">
                        <button class="modern-btn primary" onclick="window.menuModals.loadDemoSave()">
                            <i class="fas fa-play"></i> Teste Demo
                        </button>
                    </div>
                </div>
                <div class="no-saves">
                    <i class="fas fa-info-circle"></i>
                    <p>Sistema de saves não inicializado</p>
                    <small>Comece um novo jogo para ativar o sistema</small>
                </div>
            `;
        }
    }

    loadSave(slot) {
        console.log(`💾 Carregando save do slot: ${slot}`);
        this.hideModal();
        // Implementar carregamento real
    }

    startTutorial() {
        console.log('📚 Iniciando tutorial');
        this.hideModal();
        // Implementar tutorial
    }

    setupQuickTest() {
        // Configurar dados de teste rápido
        console.log('⚡ Configurando teste rápido');
    }

    setupDebugMode() {
        // Ativar modo debug
        console.log('🐛 Ativando modo debug');
        document.body.setAttribute('data-debug', 'true');
    }

    importFromFile() {
        console.log('📁 Importar de arquivo');
        // Implementar importação de arquivo
    }

    importFromCloud() {
        console.log('☁️ Importar da nuvem');
        // Implementar importação da nuvem
    }

    /**
     * Calcula tempo decorrido desde a última jogada
     */
    getTimeSince(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
            return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
        } else if (diffHours > 0) {
            return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
        } else {
            return 'Agora';
        }
    }

    /**
     * Carrega um save específico
     */
    async loadSave(profileId) {
        try {
            console.log(`🎮 Carregando save: ${profileId}`);
            
            // Preferir carregar via GameEngine (garante sincronização do estado)
            const game = window.game;
            if (game && game.systems?.dataManager && typeof game.loadGame === 'function') {
                const success = await game.loadGame(profileId);
                if (success) {
                    this.hideModal();
                    console.log('✅ Save carregado com sucesso via GameEngine');
                    return;
                }
            } else {
                // Fallback: usar DataManager direto
                const dm = window.dataManager || window.game?.systems?.dataManager;
                if (dm && typeof dm.loadGame === 'function') {
                    const gameData = await dm.loadGame(profileId);
                    if (gameData) {
                        this.hideModal();
                        console.log('✅ Save carregado (fallback DataManager)');
                        return;
                    }
                }
            }
            
            // Fallback se o sistema não estiver disponível
            alert('❌ Erro ao carregar save. Sistema de saves não está disponível.');
            
        } catch (error) {
            console.error('❌ Erro ao carregar save:', error);
            alert('❌ Erro ao carregar save. Tente novamente.');
        }
    }

    /**
     * Remove um save específico
     */
    async deleteSave(profileId) {
        if (!confirm('❓ Tem certeza que deseja excluir este save? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            console.log(`🗑️ Removendo save: ${profileId}`);
            
            if (window.dataManager) {
                // Implementar remoção se método existir
                if (typeof window.dataManager.deleteSave === 'function') {
                    await window.dataManager.deleteSave(profileId);
                    console.log('✅ Save removido com sucesso');
                    
                    // Recarregar lista
                    this.loadSavesList();
                    
                    // 🔄 ATUALIZAR STATUS DO BOTÃO CONTINUAR APÓS DELETAR
                    if (window.mainMenu && typeof window.mainMenu.checkContinueGameStatus === 'function') {
                        await window.mainMenu.checkContinueGameStatus();
                    }
                    
                    return;
                }
            }
            
            alert('❌ Função de remoção não está disponível no momento.');
            
        } catch (error) {
            console.error('❌ Erro ao remover save:', error);
            alert('❌ Erro ao remover save. Tente novamente.');
        }
    }

    /**
     * Carrega save de demonstração
     */
    loadDemoSave() {
        console.log('🎮 Carregando save demo');
        this.hideModal();
        
        // Redirecionar para teste rápido
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.location.href = 'js/ui/dashboard.html?mode=demo';
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.menuModals = new MenuModals();
});

// Exportar para uso global
window.MenuModals = MenuModals;