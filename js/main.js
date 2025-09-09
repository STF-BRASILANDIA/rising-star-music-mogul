/**
 * Rising Star: Music Mogul - Main Application Entry Point
 * Ponto de entrada principal da aplicação
 */

import { RisingStarGame } from './core/game-engine.js';

// Debug commands - available in console
window.debugGame = function() {
    console.log('🔍 Debug Game State:');
    console.log('- Game exists:', !!window.game);
    console.log('- Game state:', window.game?.gameState);
    console.log('- Player exists:', !!window.game?.gameData?.player);
    console.log('- Player data:', window.game?.gameData?.player);
    console.log('- Interface Manager:', !!window.game?.systems?.interfaceManager);
    console.log('- Main Menu:', !!window.game?.systems?.mainMenu);
};

// Global game instance
let game = null;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎵 Rising Star: Music Mogul starting...');
    
    try {
        // Show loading screen
        showLoadingScreen();
        
        // Initialize game engine
        game = new RisingStarGame();
        
        // Make game instance globally available for debugging
        window.game = game;
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorScreen('Erro ao inicializar o jogo. Recarregue a página.');
    }
});

// Service Worker registration - DISABLED FOR DEBUGGING
/* 
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', registration);
        } catch (error) {
            console.log('❌ Service Worker registration failed:', error);
        }
    });
}
*/
console.log('⚠️ Service Worker temporarily disabled for debugging');

// Loading screen management
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        
        // Animate loading bar
        const progressBar = loadingScreen.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = '0%';
            setTimeout(() => {
                progressBar.style.transition = 'width 2s ease-in-out';
                progressBar.style.width = '100%';
            }, 100);
        }
        
        // Update loading text
        const loadingTexts = [
            'Carregando universo musical...',
            'Inicializando artistas...',
            'Configurando gravadoras...',
            'Preparando estúdios...',
            'Sintonizando tendências...',
            'Conectando com a indústria...',
            'Quase pronto...'
        ];
        
        let textIndex = 0;
        const loadingText = loadingScreen.querySelector('.loading-text');
        
        const textInterval = setInterval(() => {
            if (loadingText && textIndex < loadingTexts.length) {
                loadingText.textContent = loadingTexts[textIndex];
                textIndex++;
            } else {
                clearInterval(textInterval);
            }
        }, 500);
        
        // Store interval reference for cleanup
        loadingScreen.textInterval = textInterval;
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        // Clear text interval if it exists
        if (loadingScreen.textInterval) {
            clearInterval(loadingScreen.textInterval);
        }
        
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

function showErrorScreen(message) {
    hideLoadingScreen();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-screen';
    errorDiv.innerHTML = `
        <div class="error-content">
            <div class="error-icon">⚠️</div>
            <h2>Ops! Algo deu errado</h2>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn-primary">
                Recarregar Página
            </button>
        </div>
    `;
    
    // Add error screen styles
    const style = document.createElement('style');
    style.textContent = `
        .error-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: var(--font-family);
        }
        
        .error-content {
            text-align: center;
            max-width: 400px;
            padding: var(--spacing-xl);
            background-color: var(--bg-secondary);
            border-radius: var(--border-radius-large);
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-lg);
        }
        
        .error-icon {
            font-size: 4rem;
            margin-bottom: var(--spacing-lg);
        }
        
        .error-content h2 {
            color: var(--text-primary);
            margin-bottom: var(--spacing-md);
            font-size: var(--font-size-xl);
        }
        
        .error-content p {
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xl);
            line-height: 1.5;
        }
        
        .error-content .btn-primary {
            padding: var(--spacing-md) var(--spacing-xl);
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-size: var(--font-size-md);
            font-weight: 500;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .error-content .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(errorDiv);
}

// Global error handlers
window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
    if (game) {
        game.systems.dataManager?.saveStatistic('error', {
            message: event.error?.message || 'Unknown error',
            stack: event.error?.stack,
            filename: event.filename,
            lineno: event.lineno,
            timestamp: Date.now()
        });
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    if (game) {
        game.systems.dataManager?.saveStatistic('promise_rejection', {
            reason: event.reason?.toString() || 'Unknown rejection',
            timestamp: Date.now()
        });
    }
});

// Visibility change handling (pause/resume game)
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            game.pauseGame();
            console.log('🎮 Game paused (tab hidden)');
        } else {
            game.resumeGame();
            console.log('🎮 Game resumed (tab visible)');
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (!game) return;
    
    // Only handle shortcuts if game is playing and no input is focused
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.contentEditable === 'true'
    );
    
    if (game.isPlaying() && !isInputFocused) {
        switch (event.code) {
            case 'Escape':
                event.preventDefault();
                game.systems.interfaceManager?.togglePauseMenu();
                break;
                
            case 'KeyS':
                if (event.ctrlKey) {
                    event.preventDefault();
                    game.saveGame();
                }
                break;
                
            case 'Space':
                if (event.ctrlKey) {
                    event.preventDefault();
                    const currentSpeed = game.getGameSpeed();
                    const newSpeed = currentSpeed === 1 ? 2 : currentSpeed === 2 ? 0.5 : 1;
                    game.setGameSpeed(newSpeed);
                    console.log(`🎮 Game speed: ${newSpeed}x`);
                }
                break;
                
            case 'KeyP':
                event.preventDefault();
                if (game.isPlaying()) {
                    game.pauseGame();
                } else if (game.isPaused()) {
                    game.resumeGame();
                }
                break;
        }
    }
});

// Performance monitoring
let performanceMetrics = {
    frameCount: 0,
    lastFpsUpdate: Date.now(),
    fps: 0
};

function updatePerformanceMetrics() {
    performanceMetrics.frameCount++;
    const now = Date.now();
    
    if (now - performanceMetrics.lastFpsUpdate >= 1000) {
        performanceMetrics.fps = performanceMetrics.frameCount;
        performanceMetrics.frameCount = 0;
        performanceMetrics.lastFpsUpdate = now;
        
        // Log performance warning if FPS is too low
        if (performanceMetrics.fps < 30 && game?.isPlaying()) {
            console.warn(`⚠️ Low FPS detected: ${performanceMetrics.fps}`);
        }
    }
    
    requestAnimationFrame(updatePerformanceMetrics);
}

// Start performance monitoring
requestAnimationFrame(updatePerformanceMetrics);

// Development helpers (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.dev = {
        game: () => game,
        
        // Quick save/load
        save: () => game?.saveGame(),
        load: () => game?.systems.dataManager?.loadGame(),
        
        // Debug information
        getPerformance: () => performanceMetrics,
        getTrends: () => game?.systems.aiSimulation?.state.currentTrends,
        getMarketMood: () => game?.systems.aiSimulation?.getMarketMood(),
        
        // Skip time
        skipDays: (days) => {
            if (game) {
                const msToAdd = days * 24 * 60 * 60 * 1000;
                game.currentDate = new Date(game.currentDate.getTime() + msToAdd);
                console.log(`⏰ Skipped ${days} days to ${game.getFormattedDate()}`);
            }
        },
        
        // Add money (cheat)
        addMoney: (amount) => {
            if (game?.gameData.player) {
                game.gameData.player.money = (game.gameData.player.money || 0) + amount;
                console.log(`💰 Added $${amount} (Total: $${game.gameData.player.money})`);
            }
        },
        
        // Trigger events
        triggerEvent: (type) => {
            if (game) {
                game.systems.aiSimulation?.generateRandomEvent();
                console.log(`🎭 Triggered random event`);
            }
        },
        
        // Clear all data
        clearData: () => {
            if (confirm('Are you sure you want to clear all data?')) {
                game?.systems.dataManager?.clearAllData();
                location.reload();
            }
        }
    };
    
    console.log('🔧 Development helpers loaded. Type "dev" in console for available commands.');
}

// Avatar change functionality for game
function initGameAvatarChange() {
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const gamePhotoUpload = document.getElementById('gamePhotoUpload');
    
    if (changeAvatarBtn && gamePhotoUpload) {
        changeAvatarBtn.addEventListener('click', () => {
            gamePhotoUpload.click();
        });
        
        gamePhotoUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                console.log('📸 Foto selecionada - funcionalidade será implementada');
                // TODO: Implementar novo sistema de avatar quando character creator for recriado
            }
        });
    }
}

function updateGameAvatar(avatarDataUrl) {
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar && avatarDataUrl) {
        headerAvatar.src = avatarDataUrl;
        headerAvatar.style.display = 'block';
    }
}

// Initialize avatar change functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initGameAvatarChange();
});

// Export for use in other modules
export { game };
