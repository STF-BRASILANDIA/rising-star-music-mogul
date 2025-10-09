// Interface Profissional de Gravação - Studio Manager Extension

class StudioRecordingPro {
    constructor(studioManager) {
        this.studioManager = studioManager;
        this.selectedCollab = null;
        this.selectedCollabs = []; // Array para múltiplos artistas
        this.sortOrder = { virality: 'desc', rating: 'desc', name: 'asc' }; // Estado de ordenação
        this.currentStudioIndex = 0;
        this.currentProducerIndex = 0;
    }

    getRecordingHTML() {
        const compositions = this.studioManager.compositions || [];
        const playerMoney = this.studioManager.getPlayerMoney();
        
        // Estúdios disponíveis
        const studios = [
            { id: 'own', name: 'Meu Estúdio', logo: '🏠', quality: this.studioManager.equipment?.tier || 'basic', cost: 0, description: 'Seu estúdio pessoal', multiplier: 1.0 },
            { id: 'home', name: 'Sunset Sound', logo: '🌅', quality: 'basic', cost: 200, description: 'Estúdio boutique em Hollywood', multiplier: 0.8 },
            { id: 'local', name: 'Capitol Studios', logo: '🏛️', quality: 'professional', cost: 800, description: 'Estúdio histórico de LA', multiplier: 1.2 },
            { id: 'commercial', name: 'Hit Factory', logo: '⚡', quality: 'premium', cost: 2000, description: 'Onde os sucessos nascem', multiplier: 1.5 },
            { id: 'abbey', name: 'Abbey Road', logo: '🎭', quality: 'legendary', cost: 8000, description: 'Lendário estúdio dos Beatles', multiplier: 2.0 },
            { id: 'electric', name: 'Electric Lady', logo: '⚡', quality: 'legendary', cost: 7500, description: 'Estúdio icônico de Jimi Hendrix', multiplier: 1.9 }
        ];
        
        // Produtores rankeados
        const producers = [
            { id: 'self', name: 'Produção Própria', skill: this.getPlayerSkill(), cost: 0, rating: '⭐', description: 'Baseado na sua habilidade', avatar: '👤' },
            { id: 'amateur', name: 'Timbaland Jr.', skill: 0.3, cost: 500, rating: '⭐⭐', description: 'Novo talento emergente', avatar: '🎧' },
            { id: 'local', name: 'Metro Boomin', skill: 0.5, cost: 1500, rating: '⭐⭐⭐', description: 'Producer trap de Atlanta', avatar: '🎹' },
            { id: 'pro', name: 'Pharrell Williams', skill: 0.7, cost: 4000, rating: '⭐⭐⭐⭐', description: 'Hitmaker multigenero', avatar: '🎤' },
            { id: 'star', name: 'Dr. Dre', skill: 0.85, cost: 12000, rating: '⭐⭐⭐⭐⭐', description: 'Lenda do West Coast', avatar: '🎵' },
            { id: 'legend', name: 'Max Martin', skill: 0.95, cost: 25000, rating: '👑', description: 'Rei do Pop moderno', avatar: '👑' }
        ];
        
        return `
            <style>
                .recording-interface-pro {
                    max-width: 800px;
                    margin: 0 auto;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    background: rgba(0,0,0,0.3);
                    border-radius: 16px;
                    overflow: hidden;
                }
                
                .recording-header-pro {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    position: relative;
                    overflow: hidden;
                }
                
                .recording-header-pro::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                    pointer-events: none;
                }
                
                .studio-icon {
                    font-size: 2.5rem;
                    z-index: 1;
                    position: relative;
                }
                
                .header-content {
                    flex: 1;
                    z-index: 1;
                    position: relative;
                }
                
                .header-content h2 {
                    margin: 0;
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: white;
                }
                
                .header-content p {
                    margin: 6px 0 0;
                    opacity: 0.9;
                    font-size: 0.95rem;
                    color: white;
                }
                
                .money-display {
                    background: rgba(255,255,255,0.25);
                    backdrop-filter: blur(10px);
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-weight: 700;
                    margin-top: 10px;
                    display: inline-block;
                    color: white;
                    font-size: 1rem;
                    z-index: 1;
                    position: relative;
                }
                
                .recording-sections {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .section-card {
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 12px;
                    padding: 16px;
                    transition: all 0.3s ease;
                }
                
                .section-card:hover {
                    background: rgba(255,255,255,0.12);
                    border-color: rgba(255,255,255,0.25);
                }
                
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .section-header h3 {
                    margin: 0;
                    color: #fff;
                    font-size: 1.1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .pro-select {
                    width: 100%;
                    padding: 14px 16px;
                    border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 12px;
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    color: #fff;
                    font-size: 15px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                
                .pro-select:focus {
                    outline: none;
                    border-color: #667eea;
                    background: rgba(255,255,255,0.15);
                }

                .pro-select option {
                    background: #2c2c2c;
                    color: #fff;
                    padding: 8px;
                }
                
                .studio-grid, .producer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 12px;
                }

                /* Studio & Producer Carousel Styles - Compact */
                .studio-carousel-container,
                .producer-carousel-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 6px;
                    border: 1px solid rgba(255,255,255,0.08);
                    min-height: 48px;
                }

                .carousel-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    color: #ccc;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .carousel-btn:hover {
                    background: rgba(255,255,255,0.15);
                    color: #fff;
                    border-color: rgba(255,255,255,0.3);
                }

                .carousel-btn:active {
                    transform: scale(0.95);
                }

                .studio-display,
                .producer-display {
                    flex: 1;
                    text-align: center;
                    min-width: 180px;
                }

                .studio-card-carousel,
                .producer-card-carousel {
                    background: linear-gradient(135deg, rgba(44,44,44,0.8) 0%, rgba(26,26,26,0.8) 100%);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 6px;
                    padding: 8px 12px;
                    color: white;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }

                .studio-card-carousel.selected,
                .producer-card-carousel.selected {
                    border-color: rgba(76, 175, 80, 0.5);
                    background: linear-gradient(135deg, rgba(44,44,44,0.9) 0%, rgba(26,26,26,0.9) 100%);
                }

                .studio-info-left,
                .producer-info-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                }

                .studio-logo,
                .producer-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 5px;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    flex-shrink: 0;
                    color: white;
                    box-shadow: 0 1px 4px rgba(76, 175, 80, 0.3);
                }

                .studio-logo i,
                .producer-avatar i {
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
                }

                /* Cores específicas para tipos de estúdio */
                .studio-logo.basic {
                    background: linear-gradient(135deg, #607D8B, #546E7A);
                }

                .studio-logo.professional {
                    background: linear-gradient(135deg, #2196F3, #1976D2);
                }

                .studio-logo.premium {
                    background: linear-gradient(135deg, #9C27B0, #7B1FA2);
                }

                .studio-logo.legendary {
                    background: linear-gradient(135deg, #FF9800, #F57C00);
                    box-shadow: 0 2px 12px rgba(255, 152, 0, 0.4);
                }

                /* Cores específicas para níveis de produtor */
                .producer-avatar.basic {
                    background: linear-gradient(135deg, #607D8B, #546E7A);
                }

                .producer-avatar.professional {
                    background: linear-gradient(135deg, #2196F3, #1976D2);
                }

                .producer-avatar.premium {
                    background: linear-gradient(135deg, #9C27B0, #7B1FA2);
                }

                .producer-avatar.legendary {
                    background: linear-gradient(135deg, #FF9800, #F57C00);
                    box-shadow: 0 2px 12px rgba(255, 152, 0, 0.4);
                }

                .studio-name,
                .producer-name {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #fff;
                    margin: 0;
                    line-height: 1.2;
                }

                .studio-rating,
                .producer-rating {
                    color: #FF9500;
                    font-size: 0.75rem;
                    font-weight: 500;
                    margin: 0;
                    line-height: 1.2;
                }

                .studio-cost,
                .producer-cost {
                    color: #FFD700;
                    font-weight: 600;
                    font-size: 0.8rem;
                    white-space: nowrap;
                    margin: 0;
                    line-height: 1.2;
                }

                .studio-details,
                .producer-details {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 1px;
                    flex: 1;
                }

                .studio-info-right,
                .producer-info-right {
                    text-align: right;
                }
                
                .studio-card, .producer-card {
                    background: rgba(255,255,255,0.08);
                    border: 2px solid transparent;
                    border-radius: 10px;
                    padding: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: block;
                    position: relative;
                    overflow: hidden;
                }
                
                .studio-card::before, .producer-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .studio-card:hover:not(.disabled)::before, 
                .producer-card:hover:not(.disabled)::before {
                    opacity: 1;
                }
                
                .studio-card:hover:not(.disabled), .producer-card:hover:not(.disabled) {
                    border-color: #667eea;
                    background: rgba(255,255,255,0.12);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                }
                
                .studio-card.disabled, .producer-card.disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                
                .studio-card input, .producer-card input {
                    display: none;
                }
                
                .studio-card input:checked + .studio-info,
                .producer-card input:checked + .producer-info {
                    background: rgba(76, 175, 80, 0.2);
                    border: 2px solid #4CAF50;
                }
                
                .studio-info, .producer-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    position: relative;
                    z-index: 1;
                }
                
                .studio-icon-large {
                    font-size: 2rem;
                    min-width: 50px;
                    text-align: center;
                }
                

                
                .studio-details, .producer-details {
                    flex: 1;
                }
                
                .studio-name, .producer-name {
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 3px;
                    font-size: 1rem;
                    line-height: 1.2;
                }
                
                .studio-quality, .producer-skill {
                    color: #4CAF50;
                    font-size: 0.9rem;
                    margin-bottom: 3px;
                    font-weight: 600;
                }
                
                .studio-cost, .producer-cost {
                    color: #FFD700;
                    font-weight: 700;
                    font-size: 0.95rem;
                    margin-bottom: 3px;
                }
                
                .studio-desc, .producer-desc {
                    color: #ccc;
                    font-size: 0.8rem;
                    line-height: 1.3;
                }
                
                .collab-display {
                    text-align: center;
                    padding: 16px;
                    border: 2px dashed rgba(255,255,255,0.3);
                    border-radius: 10px;
                    color: #ccc;
                    transition: all 0.3s ease;
                }
                
                .collab-display:hover {
                    border-color: rgba(255,255,255,0.5);
                }
                
                .cost-breakdown {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .cost-item {
                    display: flex;
                    justify-content: space-between;
                    color: #fff;
                    font-size: 1rem;
                }
                
                .cost-total {
                    display: flex;
                    justify-content: space-between;
                    color: #FFD700;
                    font-weight: 700;
                    font-size: 1.3rem;
                    border-top: 2px solid rgba(255,255,255,0.2);
                    padding-top: 12px;
                    margin-top: 12px;
                }
                
                .quality-preview {
                    margin-top: 20px;
                }
                
                .quality-bar {
                    height: 24px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 12px;
                    overflow: hidden;
                    margin-bottom: 12px;
                    position: relative;
                }
                
                .quality-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #4CAF50, #8BC34A, #FFD700, #FF9800);
                    transition: width 0.5s ease;
                    border-radius: 12px;
                }
                
                .quality-text {
                    text-align: center;
                    color: #fff;
                    font-weight: 600;
                    font-size: 1.1rem;
                }
                
                .recording-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    padding: 16px 20px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    background: rgba(0,0,0,0.2);
                }
                
                .btn-secondary, .btn-primary {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-secondary {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                    border: 2px solid rgba(255,255,255,0.3);
                }
                
                .btn-secondary:hover {
                    background: rgba(255,255,255,0.2);
                    border-color: rgba(255,255,255,0.5);
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border: 2px solid transparent;
                    min-width: 180px;
                }
                
                .btn-primary:hover:not(:disabled) {
                    background: linear-gradient(135deg, #45a049, #3d8b40);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                }
                
                .btn-primary:disabled {
                    background: #666;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                
                @media (max-width: 768px) {
                    .recording-interface-pro {
                        max-width: 100%;
                        margin: 0;
                        border-radius: 0;
                    }
                    
                    .recording-header-pro {
                        padding: 16px;
                    }
                    
                    .recording-sections {
                        padding: 12px;
                        gap: 12px;
                    }
                    
                    .section-card {
                        padding: 12px;
                    }
                    
                    .studio-grid, .producer-grid {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }
                    
                    .recording-actions {
                        padding: 12px;
                        flex-direction: column;
                    }
                    
                    .btn-primary, .btn-secondary {
                        width: 100%;
                    }
                    
                    .artists-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    
                    .featured-artists-browser {
                        min-height: 70vh;
                        max-height: 85vh;
                    }
                    
                    .artists-list {
                        max-height: 50vh;
                        overflow-y: auto;
                    }
                    
                    .featured-header {
                        padding: 12px;
                    }
                    
                    .featured-header h2 {
                        font-size: 1.2rem;
                        margin: 0 0 12px;
                    }
                    
                    .filter-tabs {
                        flex-direction: row;
                        gap: 4px;
                        justify-content: center;
                        flex-wrap: wrap;
                    }
                    
                    .filter-tab {
                        padding: 6px 12px;
                        font-size: 0.75rem;
                        border-radius: 12px;
                        min-width: auto;
                        flex: 1;
                        max-width: 90px;
                    }
                    
                    .featured-artist-card {
                        padding: 6px 10px;
                        flex-direction: row;
                        text-align: left;
                        gap: 6px;
                        min-height: auto;
                        align-items: center;
                    }

                    .artist-label-genre {
                        justify-content: flex-start;
                        flex-wrap: wrap;
                        gap: 3px;
                    }
                    
                    .artist-trending {
                        order: 0;
                        margin: 0;
                        min-width: 35px;
                        flex-shrink: 0;
                        text-align: center;
                    }

                    .artist-main-info {
                        flex: 1;
                        order: 1;
                        text-align: center;
                        margin: 0 8px;
                    }
                    
                    .artist-rating {
                        order: 2;
                        margin: 0;
                        min-width: 35px;
                        flex-shrink: 0;
                        text-align: center;
                    }
                    /* garantir a info no centro (entre trending e rating) */
                    .artist-main-info { order: 1; }
                    
                    .artist-name {
                        font-size: 0.85rem;
                        margin-bottom: 0px; /* encostar os metadados no nome */
                        font-weight: 700;
                        line-height: 1.1;
                    }
                    
                    .artist-label {
                        font-size: 0.65rem;
                    }
                    
                    .artist-genre {
                        font-size: 0.6rem;
                        padding: 1px 4px;
                    }
                    
                    .artist-price {
                        font-size: 0.72rem;
                        margin-top: 0px; /* valor mais próximo do nome */
                        font-weight: 600;
                        line-height: 1.1;
                    }
                    
                    .trending-number,
                    .rating-number {
                        font-size: 0.9rem;
                        font-weight: 700;
                        line-height: 1;
                    }
                    
                    .trending-label,
                    .rating-label {
                        font-size: 0.55rem;
                        margin-top: 1px;
                        line-height: 1;
                    }
                    
                    .finish-selection-btn {
                        bottom: 6px !important;
                        right: 6px !important;
                        padding: 4px 10px !important; /* botão ainda menor no mobile */
                        font-size: 10px !important;
                        border-radius: 12px !important;
                        min-width: auto !important;
                    }
                }

                /* Featured Artists Browser */
                .featured-artists-browser {
                    background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
                    color: white;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    border-radius: 0;
                    overflow: hidden;
                    min-height: 600px;
                }

                .featured-header {
                    padding: 20px;
                    text-align: center;
                    background: rgba(0,0,0,0.3);
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .featured-header h2 {
                    margin: 0 0 20px;
                    font-size: 1.8rem;
                    font-weight: 300;
                    letter-spacing: 2px;
                    color: rgba(255,255,255,0.6);
                }

                .filter-tabs {
                    display: flex;
                    justify-content: center;
                    gap: 0;
                }

                .filter-tab {
                    padding: 10px 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-radius: 20px;
                }

                .filter-tab.active {
                    background: #F1C40F;
                    color: #000;
                }

                .filter-tab:not(.active) {
                    background: #E74C3C;
                    color: #fff;
                    margin: 0 6px; /* menos espaçamento entre tabs */
                }

                .filter-tab:not(.active):nth-child(3) {
                    background: #9B59B6;
                }

                .artists-list {
                    padding: 0;
                    max-height: 450px;
                    overflow-y: auto;
                }
                
                /* Botão "Procurar Artistas" mais compacto dentro do cabeçalho da seção */
                .collab-section .section-header #openCollabBrowserBtn {
                    padding: 6px 10px;
                    font-size: 12px;
                    border-radius: 8px;
                }
                @media (max-width: 768px) {
                    .collab-section .section-header #openCollabBrowserBtn {
                        padding: 4px 8px;
                        font-size: 11px;
                        border-radius: 8px;
                    }
                }

                .artists-list::-webkit-scrollbar {
                    width: 6px;
                }

                .artists-list::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.1);
                }

                .artists-list::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.3);
                    border-radius: 3px;
                }

                .featured-artist-card {
                    display: flex;
                    align-items: center;
                    padding: 15px 20px;
                    background: rgba(45, 45, 45, 0.8);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .featured-artist-card:hover {
                    background: rgba(60, 60, 60, 0.9);
                    transform: translateX(5px);
                }

                .featured-artist-card:nth-child(odd) {
                    background: rgba(40, 40, 40, 0.8);
                }

                .featured-artist-card:nth-child(odd):hover {
                    background: rgba(55, 55, 55, 0.9);
                }

                .featured-artist-card.selected {
                    background: rgba(76, 175, 80, 0.3) !important;
                    border-left: 4px solid #4CAF50;
                }

                .featured-artist-card.selected:hover {
                    background: rgba(76, 175, 80, 0.4) !important;
                }

                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .artist-trending {
                    min-width: 80px;
                    text-align: center;
                    margin-right: 20px;
                }

                .trending-number {
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #4CAF50;
                    line-height: 1;
                }

                .trending-label {
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.6);
                    font-weight: 500;
                    letter-spacing: 1px;
                    margin-top: 2px;
                }

                .artist-main-info {
                    flex: 1;
                    text-align: center;
                }

                .artist-name {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 4px; /* aproximar metadados do nome */
                    letter-spacing: 1px;
                    cursor: text;
                    border: 1px solid transparent;
                    padding: 2px 4px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    text-align: center;
                }

                .artist-name:hover {
                    border-color: rgba(255,255,255,0.3);
                    background: rgba(255,255,255,0.05);
                }

                .artist-name:focus {
                    outline: none;
                    border-color: #4CAF50;
                    background: rgba(255,255,255,0.1);
                }

                .artist-label-genre {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin-bottom: 2px; /* subir label/gênero */
                    flex-wrap: wrap;
                }

                .artist-label {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.6);
                    font-weight: 400;
                    letter-spacing: 0.5px;
                }

                .genre-separator {
                    color: rgba(255,255,255,0.3);
                    font-size: 0.8rem;
                }

                .artist-genre {
                    font-size: 0.8rem;
                    color: #9B59B6;
                    font-weight: 600;
                    background: rgba(155, 89, 182, 0.2);
                    padding: 2px 8px;
                    border-radius: 10px;
                    border: 1px solid rgba(155, 89, 182, 0.3);
                }

                .artist-price {
                    font-size: 0.95rem;
                    color: #E74C3C;
                    font-weight: 600;
                    text-align: center;
                    margin-top: 0px; /* valor mais colado no nome/metadados */
                }

                .artist-rating {
                    min-width: 80px;
                    text-align: center;
                    margin-left: 20px;
                }

                .rating-number {
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #4CAF50;
                    line-height: 1;
                }

                .rating-label {
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.6);
                    font-weight: 500;
                    letter-spacing: 1px;
                    margin-top: 2px;
                }

                .featured-footer {
                    padding: 15px;
                    text-align: center;
                    background: rgba(0,0,0,0.4);
                    border-top: 1px solid rgba(255,255,255,0.1);
                }

                .name-editing-note {
                    color: rgba(255,255,255,0.5);
                    font-size: 0.85rem;
                    letter-spacing: 1px;
                    font-weight: 400;
                }

                .selected-collab {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(76, 175, 80, 0.2);
                    border: 2px solid #4CAF50;
                    border-radius: 10px;
                    padding: 12px;
                }

                .collab-avatar {
                    font-size: 2rem;
                    min-width: 50px;
                    text-align: center;
                }

                .collab-info {
                    flex: 1;
                }

                .collab-name {
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 3px;
                    font-size: 1rem;
                    line-height: 1.2;
                }

                .collab-details {
                    color: #ccc;
                    font-size: 0.85rem;
                    margin-bottom: 6px;
                    line-height: 1.2;
                }

                .collab-cost {
                    color: #FFD700;
                    font-weight: 700;
                    font-size: 0.95rem;
                }

                /* Multiple Collaborations Display */
                .multiple-collabs {
                    background: rgba(76, 175, 80, 0.15);
                    border: 2px solid #4CAF50;
                    border-radius: 10px;
                    padding: 12px;
                }

                .collabs-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .collabs-count {
                    color: #4CAF50;
                    font-weight: 700;
                    font-size: 0.95rem;
                }

                .collabs-total {
                    color: #FFD700;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .collabs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    max-height: 120px;
                    overflow-y: auto;
                }

                .collab-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255,255,255,0.05);
                    padding: 6px 10px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }

                .collab-item:hover {
                    background: rgba(255,255,255,0.1);
                }

                .collab-avatar-small {
                    font-size: 1.2rem;
                    min-width: 30px;
                    text-align: center;
                }

                .collab-name-small {
                    flex: 1;
                    color: #fff;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .collab-genre-small {
                    color: #9B59B6;
                    font-weight: 500;
                    font-size: 0.8rem;
                    background: rgba(155, 89, 182, 0.2);
                    padding: 2px 6px;
                    border-radius: 8px;
                    border: 1px solid rgba(155, 89, 182, 0.3);
                }

                .collab-cost-small {
                    color: #FFD700;
                    font-weight: 600;
                    font-size: 0.85rem;
                }

                .remove-collab-btn {
                    background: none;
                    border: none;
                    color: #E74C3C;
                    cursor: pointer;
                    font-size: 0.8rem;
                    padding: 2px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .remove-collab-btn:hover {
                    background: rgba(231, 76, 60, 0.2);
                }
            </style>
            
            <div class="recording-interface-pro">
                <div class="recording-header-pro">
                    <div class="studio-icon">🎛️</div>
                    <div class="header-content">
                        <h2>Sessão de Gravação</h2>
                        <p>Configure sua produção profissional</p>
                        <div class="money-display">💰 $${playerMoney.toLocaleString()}</div>
                    </div>
                </div>

                <div class="recording-sections">
                    <!-- Seleção de Composição -->
                    <div class="section-card composition-section">
                        <div class="section-header">
                            <h3><i class="fas fa-music"></i> Selecionar Faixa</h3>
                        </div>
                        <select id="selectedComposition" class="pro-select">
                            <option value="">Escolha uma composição para gravar...</option>
                            ${compositions.map(comp => {
                                const quality = Math.round(comp.quality * 100);
                                return `<option value="${comp.id}" data-quality="${comp.quality}" data-genre="${comp.genre}">
                                    "${comp.title}" (${comp.genre}) - ${quality}% qualidade base
                                </option>`;
                            }).join('')}
                        </select>
                    </div>

                    <!-- Seleção de Estúdio -->
                    <div class="section-card studio-section">
                        <div class="section-header">
                            <h3><i class="fas fa-building"></i> Escolher Estúdio</h3>
                        </div>
                        <div class="studio-carousel-container">
                            <button class="carousel-btn studio-prev" title="Estúdio anterior">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <div class="studio-display">
                                <div class="studio-card-carousel selected" data-studio-index="0">
                                    <div class="studio-info-left">
                                        <div class="studio-logo basic"><i class="fas fa-home"></i></div>
                                        <div class="studio-details">
                                            <div class="studio-name">${studios[0].name}</div>
                                            <div class="studio-rating">${Math.round(studios[0].multiplier * 100)} Rating</div>
                                        </div>
                                    </div>
                                    <div class="studio-info-right">
                                        <div class="studio-cost">
                                            ${studios[0].cost > 0 ? 'R$ ' + studios[0].cost.toLocaleString('pt-BR') : 'Gratuito'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="carousel-btn studio-next" title="Próximo estúdio">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Seleção de Produtor -->
                    <div class="section-card producer-section">
                        <div class="section-header">
                            <h3><i class="fas fa-user-tie"></i> Escolher Produtor</h3>
                        </div>
                        <div class="producer-carousel-container">
                            <button class="carousel-btn producer-prev" title="Produtor anterior">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <div class="producer-display">
                                <div class="producer-card-carousel selected" data-producer-index="0">
                                    <div class="producer-info-left">
                                        <div class="producer-avatar ${producers[0].skill >= 0.9 ? 'legendary' : producers[0].skill >= 0.7 ? 'premium' : producers[0].skill >= 0.5 ? 'professional' : 'basic'}"><i class="fas fa-user"></i></div>
                                        <div class="producer-details">
                                            <div class="producer-name">${producers[0].name}</div>
                                            <div class="producer-rating">${Math.round(producers[0].skill * 100)} Skill</div>
                                        </div>
                                    </div>
                                    <div class="producer-info-right">
                                        <div class="producer-cost">
                                            ${producers[0].cost > 0 ? 'R$ ' + producers[0].cost.toLocaleString('pt-BR') : 'Gratuito'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="carousel-btn producer-next" title="Próximo produtor">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Seleção de Colaboração -->
                    <div class="section-card collab-section">
                        <div class="section-header">
                            <h3><i class="fas fa-users"></i> Colaboração</h3>
                            <button id="openCollabBrowserBtn" class="btn-secondary btn-compact">
                                <i class="fas fa-search"></i> Procurar Artistas
                            </button>
                        </div>
                        <div id="selectedCollabDisplay" class="collab-display">
                            <div class="no-collab-selected">
                                <i class="fas fa-user-plus"></i>
                                <span>Nenhuma colaboração selecionada</span>
                                <br><small>Clique em "Procurar Artistas" para encontrar colaboradores</small>
                            </div>
                        </div>
                    </div>

                    <!-- Resumo Final -->
                    <div class="section-card summary-section">
                        <div class="section-header">
                            <h3><i class="fas fa-calculator"></i> Resumo da Sessão</h3>
                        </div>
                        <div class="cost-breakdown" id="costBreakdown">
                            <div class="cost-item">
                                <span>Estúdio:</span>
                                <span id="studioCost">$0</span>
                            </div>
                            <div class="cost-item">
                                <span>Produtor:</span>
                                <span id="producerCostDisplay">$0</span>
                            </div>
                            <div class="cost-item" id="collabCostItem" style="display: none;">
                                <span>Colaboração:</span>
                                <span id="collabCost">$0</span>
                            </div>
                            <div class="cost-total">
                                <span>Total:</span>
                                <span id="totalCost">$0</span>
                            </div>
                        </div>
                        <div class="quality-preview" id="qualityPreview">
                            <div class="quality-bar">
                                <div class="quality-fill" style="width: 0%"></div>
                            </div>
                            <div class="quality-text">Qualidade Estimada: <span id="estimatedQuality">--</span></div>
                        </div>
                    </div>
                </div>
                
                <div class="recording-actions">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                    <button class="btn-primary" id="startRecordingBtn">🎵 Iniciar Gravação</button>
                </div>
            </div>
        `;
    }

    getPlayerSkill() {
        // Busca skill de produção do jogador
        const player = this.studioManager.gameEngine?.gameData?.player;
        return (player?.skills?.production || 0) / 100; // Converte de 0-100 para 0-1
    }

    setupCarousels() {
        // Carrega dados dos estúdios e produtores
        const studios = [
            { id: 'own', name: 'Meu Estúdio', logo: '<i class="fas fa-home"></i>', quality: this.studioManager.equipment?.tier || 'basic', cost: 0, description: 'Seu estúdio pessoal', multiplier: 1.0 },
            { id: 'home', name: 'Sunset Sound', logo: '<i class="fas fa-sun"></i>', quality: 'basic', cost: 200, description: 'Estúdio boutique em Hollywood', multiplier: 0.8 },
            { id: 'local', name: 'Capitol Studios', logo: '<i class="fas fa-university"></i>', quality: 'professional', cost: 800, description: 'Estúdio histórico de LA', multiplier: 1.2 },
            { id: 'commercial', name: 'Hit Factory', logo: '<i class="fas fa-bolt"></i>', quality: 'premium', cost: 2500, description: 'Estúdio premium de NY', multiplier: 1.5 },
            { id: 'abbey', name: 'Abbey Road', logo: '<i class="fas fa-road"></i>', quality: 'legendary', cost: 8000, description: 'Lendário estúdio dos Beatles', multiplier: 2.0 },
            { id: 'electric', name: 'Electric Lady', logo: '<i class="fas fa-female"></i>', quality: 'legendary', cost: 7500, description: 'Estúdio icônico de Jimi Hendrix', multiplier: 1.9 }
        ];

        const producers = [
            { id: 'self', name: 'Produção Própria', skill: this.getPlayerSkill(), cost: 0, rating: '⭐', description: 'Baseado na sua habilidade', avatar: '<i class="fas fa-user"></i>' },
            { id: 'amateur', name: 'Timbaland Jr.', skill: 0.3, cost: 500, rating: '⭐⭐', description: 'Novo talento emergente', avatar: '<i class="fas fa-headphones"></i>' },
            { id: 'local', name: 'Metro Boomin', skill: 0.5, cost: 1500, rating: '⭐⭐⭐', description: 'Producer trap de Atlanta', avatar: '<i class="fas fa-music"></i>' },
            { id: 'pro', name: 'Pharrell Williams', skill: 0.7, cost: 4000, rating: '⭐⭐⭐⭐', description: 'Hitmaker multigenero', avatar: '<i class="fas fa-microphone"></i>' },
            { id: 'star', name: 'Dr. Dre', skill: 0.85, cost: 12000, rating: '⭐⭐⭐⭐⭐', description: 'Lenda do West Coast', avatar: '<i class="fas fa-crown"></i>' },
            { id: 'legend', name: 'Max Martin', skill: 0.95, cost: 25000, rating: '👑', description: 'Rei do Pop moderno', avatar: '<i class="fas fa-trophy"></i>' }
        ];

        // Event listeners para estúdios
        const studioPrev = document.querySelector('.studio-prev');
        const studioNext = document.querySelector('.studio-next');
        
        if (studioPrev) {
            studioPrev.addEventListener('click', () => {
                this.currentStudioIndex = (this.currentStudioIndex - 1 + studios.length) % studios.length;
                this.updateStudioDisplay(studios[this.currentStudioIndex]);
            });
        }

        if (studioNext) {
            studioNext.addEventListener('click', () => {
                this.currentStudioIndex = (this.currentStudioIndex + 1) % studios.length;
                this.updateStudioDisplay(studios[this.currentStudioIndex]);
            });
        }

        // Event listeners para produtores
        const producerPrev = document.querySelector('.producer-prev');
        const producerNext = document.querySelector('.producer-next');
        
        if (producerPrev) {
            producerPrev.addEventListener('click', () => {
                this.currentProducerIndex = (this.currentProducerIndex - 1 + producers.length) % producers.length;
                this.updateProducerDisplay(producers[this.currentProducerIndex]);
            });
        }

        if (producerNext) {
            producerNext.addEventListener('click', () => {
                this.currentProducerIndex = (this.currentProducerIndex + 1) % producers.length;
                this.updateProducerDisplay(producers[this.currentProducerIndex]);
            });
        }
    }

    updateStudioDisplay(studio) {
        const display = document.querySelector('.studio-card-carousel');
        if (display) {
            display.innerHTML = `
                <div class="studio-info-left">
                    <div class="studio-logo ${studio.quality}">${studio.logo}</div>
                    <div class="studio-details">
                        <div class="studio-name">${studio.name}</div>
                        <div class="studio-rating">${Math.round(studio.multiplier * 100)} Rating</div>
                    </div>
                </div>
                <div class="studio-info-right">
                    <div class="studio-cost">
                        ${studio.cost > 0 ? 'R$ ' + studio.cost.toLocaleString('pt-BR') : 'Gratuito'}
                    </div>
                </div>
            `;
            display.setAttribute('data-studio-index', this.currentStudioIndex);
        }
    }

    updateProducerDisplay(producer) {
        const display = document.querySelector('.producer-card-carousel');
        if (display) {
            // Determinar classe de qualidade baseada na skill
            let qualityClass = 'basic';
            if (producer.skill >= 0.9) qualityClass = 'legendary';
            else if (producer.skill >= 0.7) qualityClass = 'premium';
            else if (producer.skill >= 0.5) qualityClass = 'professional';
            
            display.innerHTML = `
                <div class="producer-info-left">
                    <div class="producer-avatar ${qualityClass}">${producer.avatar}</div>
                    <div class="producer-details">
                        <div class="producer-name">${producer.name}</div>
                        <div class="producer-rating">${Math.round(producer.skill * 100)} Skill</div>
                    </div>
                </div>
                <div class="producer-info-right">
                    <div class="producer-cost">
                        ${producer.cost > 0 ? 'R$ ' + producer.cost.toLocaleString('pt-BR') : 'Gratuito'}
                    </div>
                </div>
            `;
            display.setAttribute('data-producer-index', this.currentProducerIndex);
        }
    }

    // Modal de seleção de artistas para colaboração
    openCollabBrowser() {
        const artists = this.generateGameArtists();
        
        const html = `
            <div class="featured-artists-browser">
                <div class="featured-header">
                    <h2>🎤 FEATURED ARTISTS</h2>
                    <div class="filter-tabs">
                        <span class="filter-tab active" data-filter="virality">VIRALITY</span>
                        <span class="filter-tab" data-filter="name">NAME</span>
                        <span class="filter-tab" data-filter="rating">RATING</span>
                    </div>
                </div>
                <div class="artists-list">
                    ${artists.map(artist => `
                        <div class="featured-artist-card" data-artist='${JSON.stringify(artist)}' data-virality="${artist.hype}" data-rating="${artist.rating}">
                            <div class="artist-trending">
                                <div class="trending-number">${artist.hype}</div>
                                <div class="trending-label">TRENDING</div>
                            </div>
                            <div class="artist-main-info">
                                <div class="artist-name" contenteditable="true" data-original="${artist.name}">${artist.name.toUpperCase()}</div>
                                <div class="artist-label-genre">
                                    <span class="artist-label">${artist.label}</span>
                                    <span class="genre-separator">|</span>
                                    <span class="artist-genre">${artist.genre}</span>
                                </div>
                                <div class="artist-price">R$ ${(artist.cost * 5.5).toLocaleString('pt-BR', {minimumFractionDigits: 3})}</div>
                            </div>
                            <div class="artist-rating">
                                <div class="rating-number">${artist.rating * 20 + Math.floor(Math.random() * 15)}</div>
                                <div class="rating-label">RATING</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const modal = window.modernModalSystem.createModal({
            id: 'collab-browser-modal',
            title: null,
            content: html,
            size: 'large'
        });
        
        window.modernModalSystem.openModal(modal);
        this.setupFeaturedArtistEvents(modal);
    }

    generateGameArtists() {
        // Simula artistas do jogo com diferentes níveis - inspirado em artistas reais
        return [
            { name: 'Droke', genre: 'Hip-Hop', rating: 5, hype: 105, cost: 25000, avatar: '🎤', tier: 'legendary', label: 'OVO Sound Records' },
            { name: 'Taylor Swife', genre: 'Pop', rating: 5, hype: 91, cost: 22000, avatar: '👩‍🎤', tier: 'legendary', label: 'Big Machine Records' },
            { name: 'Ed Sheerun', genre: 'Pop/Folk', rating: 5, hype: 119, cost: 28000, avatar: '🎸', tier: 'legendary', label: 'Atlantic Records' },
            { name: 'Morgan Wallin', genre: 'Country', rating: 4, hype: 94, cost: 18000, avatar: '🤠', tier: 'star', label: 'Big Loud Records' },
            { name: 'Khaled', genre: 'Hip-Hop', rating: 4, hype: 72, cost: 12000, avatar: '🎧', tier: 'star', label: 'We The Best Music' },
            { name: 'The Weekend', genre: 'R&B', rating: 5, hype: 86, cost: 16000, avatar: '🎹', tier: 'star', label: 'XO Records' },
            { name: 'Harry Stoles', genre: 'Pop/Rock', rating: 4, hype: 102, cost: 20000, avatar: '🎤', tier: 'star', label: 'Columbia Records' },
            { name: 'Juice Wold', genre: 'Hip-Hop', rating: 4, hype: 93, cost: 15000, avatar: '🎤', tier: 'star', label: 'Grade A Productions' },
            { name: 'Kandrick Lamar', genre: 'Hip-Hop', rating: 5, hype: 93, cost: 25000, avatar: '�', tier: 'legendary' },
            { name: 'Lee Bryce', genre: 'Country', rating: 3, hype: 73, cost: 8000, avatar: '🤠', tier: 'professional', label: 'Independente' }
        ].sort((a, b) => b.hype - a.hype); // Ordenar por trending/virality
    }

    setupFeaturedArtistEvents(modal) {
        // Eventos de clique nos cards de artistas
        const artistCards = modal.querySelectorAll('.featured-artist-card');
        artistCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Se clicou no nome (contenteditable), não seleciona o artista
                if (e.target.classList.contains('artist-name') || e.target.contentEditable === 'true') {
                    e.stopPropagation();
                    return;
                }
                
                const artistData = JSON.parse(card.dataset.artist);
                
                // Verificar se já está selecionado
                const isSelected = this.selectedCollabs.some(collab => collab.name === artistData.name);
                
                if (isSelected) {
                    // Remove da seleção
                    this.selectedCollabs = this.selectedCollabs.filter(collab => collab.name !== artistData.name);
                    card.classList.remove('selected');
                } else {
                    // Adiciona à seleção (máximo 10)
                    if (this.selectedCollabs.length < 10) {
                        this.selectedCollabs.push(artistData);
                        card.classList.add('selected');
                    } else {
                        // Feedback quando atingir o limite
                        this.showLimitMessage(modal);
                    }
                }
                
                // Atualizar contador e total
                this.updateSelectionCounter(modal);
                this.updateSelectionTotal(modal);
                
                // Manter compatibilidade com sistema existente (último selecionado)
                this.selectedCollab = this.selectedCollabs[this.selectedCollabs.length - 1] || null;
            });
            
            // Evento específico para edição de nome
            const nameElement = card.querySelector('.artist-name');
            if (nameElement) {
                nameElement.addEventListener('focus', (e) => {
                    e.stopPropagation();
                });
                
                nameElement.addEventListener('blur', (e) => {
                    // Salvar nome editado
                    const newName = e.target.textContent.trim();
                    if (newName && newName !== e.target.dataset.original) {
                        // Atualizar dados do artista
                        const artistData = JSON.parse(card.dataset.artist);
                        artistData.name = newName;
                        card.dataset.artist = JSON.stringify(artistData);
                        
                        // Atualizar na seleção se estiver selecionado
                        const selectedIndex = this.selectedCollabs.findIndex(collab => 
                            collab.name === e.target.dataset.original);
                        if (selectedIndex !== -1) {
                            this.selectedCollabs[selectedIndex].name = newName;
                        }
                    }
                });
            }
        });

        // Eventos de filtro com ordenação crescente/decrescente
        const filterTabs = modal.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                
                // Alternar ordem se já está ativo
                if (e.target.classList.contains('active')) {
                    if (filterType === 'virality' || filterType === 'rating') {
                        this.sortOrder[filterType] = this.sortOrder[filterType] === 'desc' ? 'asc' : 'desc';
                    } else if (filterType === 'name') {
                        this.sortOrder[filterType] = this.sortOrder[filterType] === 'asc' ? 'desc' : 'asc';
                    }
                } else {
                    // Remove active de todos
                    filterTabs.forEach(t => t.classList.remove('active'));
                    // Adiciona active ao clicado
                    e.target.classList.add('active');
                }
                
                this.sortArtistsList(modal, filterType);
            });
        });

        // Botão para finalizar seleção
        this.addFinishButton(modal);
    }

    sortArtistsList(modal, filterType) {
        const artistsList = modal.querySelector('.artists-list');
        const cards = Array.from(artistsList.querySelectorAll('.featured-artist-card'));
        
        cards.sort((a, b) => {
            let result = 0;
            
            switch(filterType) {
                case 'virality':
                case 'all': // Compatibilidade
                    result = parseInt(a.dataset.virality) - parseInt(b.dataset.virality);
                    return this.sortOrder.virality === 'desc' ? -result : result;
                    
                case 'rating':
                    result = parseInt(a.dataset.rating) - parseInt(b.dataset.rating);
                    return this.sortOrder.rating === 'desc' ? -result : result;
                    
                case 'name':
                    const nameA = JSON.parse(a.dataset.artist).name;
                    const nameB = JSON.parse(b.dataset.artist).name;
                    result = nameA.localeCompare(nameB);
                    return this.sortOrder.name === 'desc' ? -result : result;
                    
                default:
                    return 0;
            }
        });
        
        // Reordena os elementos
        cards.forEach(card => artistsList.appendChild(card));
        
        // Atualizar indicador de ordem no tab ativo
        this.updateSortIndicator(modal, filterType);
    }

    updateSortIndicator(modal, filterType) {
        // Mantemos apenas o destaque visual .active; não exibimos setas nos rótulos
        return;
    }

    showLimitMessage(modal) {
        const message = document.createElement('div');
        message.className = 'limit-message';
        message.textContent = 'Máximo de 10 artistas por música!';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #E74C3C;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    }

    updateSelectionCounter(modal) {
        let counter = modal.querySelector('.selection-counter');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'selection-counter';
            const header = modal.querySelector('.featured-header');
            header.appendChild(counter);
        }
        
        counter.textContent = `${this.selectedCollabs.length}/10 artistas selecionados`;
        counter.style.cssText = `
            color: #4CAF50;
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 10px;
        `;
    }

    updateSelectionTotal(modal) {
        let totalDisplay = modal.querySelector('.selection-total');
        if (!totalDisplay) {
            totalDisplay = document.createElement('div');
            totalDisplay.className = 'selection-total';
            const header = modal.querySelector('.featured-header');
            header.appendChild(totalDisplay);
        }
        
        const totalCost = this.selectedCollabs.reduce((sum, collab) => sum + collab.cost, 0);
        totalDisplay.textContent = `Total: R$ ${(totalCost * 5.5).toLocaleString('pt-BR', {minimumFractionDigits: 3})}`;
        totalDisplay.style.cssText = `
            color: #FFD700;
            font-size: 1rem;
            font-weight: 700;
            margin-top: 5px;
        `;
    }

    addFinishButton(modal) {
        const finishBtn = document.createElement('button');
        finishBtn.textContent = 'Finalizar Seleção';
        finishBtn.className = 'finish-selection-btn';
        finishBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 10px 20px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
            z-index: 1000;
        `;
        
        finishBtn.addEventListener('click', () => {
            this.finalizeSelection();
            modal.remove();
        });
        
        modal.appendChild(finishBtn);
    }

    finalizeSelection() {
        // Atualizar display com todos os colaboradores selecionados
        this.updateCollabDisplay();
    }

    updateCollabDisplay() {
        const display = document.getElementById('selectedCollabDisplay');
        if (!display) return;

        if (this.selectedCollabs && this.selectedCollabs.length > 0) {
            const totalCost = this.selectedCollabs.reduce((sum, collab) => sum + collab.cost, 0);
            
            display.innerHTML = `
                <div class="multiple-collabs">
                    <div class="collabs-header">
                        <span class="collabs-count">${this.selectedCollabs.length} artista${this.selectedCollabs.length > 1 ? 's' : ''} selecionado${this.selectedCollabs.length > 1 ? 's' : ''}</span>
                        <span class="collabs-total">Total: R$ ${(totalCost * 5.5).toLocaleString('pt-BR', {minimumFractionDigits: 3})}</span>
                        <button id="clearAllCollabs" class="btn-secondary">🗑️ Limpar Todos</button>
                    </div>
                    <div class="collabs-list">
                        ${this.selectedCollabs.map((collab, index) => `
                            <div class="collab-item">
                                <span class="collab-avatar-small">${collab.avatar}</span>
                                <span class="collab-name-small">${collab.name}</span>
                                <span class="collab-genre-small">${collab.genre}</span>
                                <span class="collab-cost-small">R$ ${(collab.cost * 5.5).toLocaleString('pt-BR', {minimumFractionDigits: 3})}</span>
                                <button class="remove-collab-btn" data-index="${index}">❌</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            // Eventos para remover colaborações individuais
            const removeBtns = display.querySelectorAll('.remove-collab-btn');
            removeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    this.selectedCollabs.splice(index, 1);
                    this.selectedCollab = this.selectedCollabs[this.selectedCollabs.length - 1] || null;
                    this.updateCollabDisplay();
                    this.updateCosts();
                });
            });

            // Evento para limpar todas as colaborações
            const clearBtn = document.getElementById('clearAllCollabs');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.selectedCollabs = [];
                    this.selectedCollab = null;
                    this.updateCollabDisplay();
                    this.updateCosts();
                });
            }
        } else {
            display.innerHTML = `
                <div class="no-collab-selected">
                    <i class="fas fa-user-plus"></i>
                    <span>Nenhuma colaboração selecionada</span>
                    <br><small>Clique em "Procurar Artistas" para encontrar colaboradores (máximo 10)</small>
                </div>
            `;
        }
    }
}

// Export para uso no StudioManager
window.StudioRecordingPro = StudioRecordingPro;

// Debug helper: abre rapidamente o modal FEATURED ARTISTS
window.testFeaturedArtistsModal = function() {
    try {
        const rec = new StudioRecordingPro({});
        rec.openCollabBrowser();
        console.log('✅ testFeaturedArtistsModal: modal aberto');
        return rec;
    } catch (e) {
        console.error('❌ testFeaturedArtistsModal erro:', e);
    }
}