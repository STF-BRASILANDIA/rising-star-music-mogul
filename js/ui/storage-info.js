/**
 * Rising Star: Music Mogul - Storage Information
 * Mostra informações sobre o armazenamento local
 */

import { SaveModeManager } from './save-mode-manager.js';

export class StorageInfo {
    static getStorageStatus() {
        const info = {
            localStorage: {
                available: this.isLocalStorageAvailable(),
                used: this.getLocalStorageUsage(),
                capacity: '5-10 MB típico'
            },
            indexedDB: {
                available: this.isIndexedDBAvailable(),
                used: 'Calculando...',
                capacity: 'Centenas de MB'
            },
            pwa: {
                installable: this.isPWAInstallable(),
                installed: this.isPWAInstalled(),
                offline: 'navigator' in window && 'serviceWorker' in navigator
            }
        };

        if (info.indexedDB.available) {
            this.getIndexedDBUsage().then(usage => {
                info.indexedDB.used = usage;
            });
        }

        return info;
    }

    static isLocalStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    static getLocalStorageUsage() {
        if (!this.isLocalStorageAvailable()) return 'N/A';
        
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        
        return this.formatBytes(total);
    }

    static isIndexedDBAvailable() {
        return 'indexedDB' in window;
    }

    static async getIndexedDBUsage() {
        if (!this.isIndexedDBAvailable()) return 'N/A';
        
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                return `${this.formatBytes(estimate.usage || 0)} / ${this.formatBytes(estimate.quota || 0)}`;
            }
            return 'Disponível';
        } catch {
            return 'Erro ao calcular';
        }
    }

    static isPWAInstallable() {
        return 'serviceWorker' in navigator && window.matchMedia('(display-mode: standalone)').matches === false;
    }

    static isPWAInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static showStorageModal() {
        const info = this.getStorageStatus();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-save"></i> Armazenamento Local</h2>
                </div>
                <div class="modal-body">
                    <div class="storage-section">
                        <h3>📁 LocalStorage</h3>
                        <p><strong>Status:</strong> ${info.localStorage.available ? '✅ Disponível' : '❌ Indisponível'}</p>
                        <p><strong>Usado:</strong> ${info.localStorage.used}</p>
                        <p><strong>Capacidade:</strong> ${info.localStorage.capacity}</p>
                        <p><em>Seus saves do jogo ficam aqui!</em></p>
                    </div>
                    
                    <div class="storage-section">
                        <h3>🗃️ IndexedDB</h3>
                        <p><strong>Status:</strong> ${info.indexedDB.available ? '✅ Disponível' : '❌ Indisponível'}</p>
                        <p><strong>Usado:</strong> ${info.indexedDB.used}</p>
                        <p><strong>Capacidade:</strong> ${info.indexedDB.capacity}</p>
                        <p><em>Para dados maiores e mais complexos</em></p>
                    </div>
                    
                    <div class="storage-section">
                        <h3>📱 PWA (App Mode)</h3>
                        <p><strong>Instalável:</strong> ${info.pwa.installable ? '✅ Sim' : '❌ Não'}</p>
                        <p><strong>Instalado:</strong> ${info.pwa.installed ? '✅ Sim' : '❌ Não'}</p>
                        <p><strong>Offline:</strong> ${info.pwa.offline ? '✅ Suportado' : '❌ Não'}</p>
                        <p><em>Instale como app no seu dispositivo!</em></p>
                    </div>
                    
                    <div class="storage-tips">
                        <h3><i class="fas fa-lightbulb"></i> Dicas:</h3>
                        <ul>
                            <li>🔄 Seus dados salvam automaticamente</li>
                            <li>📱 Funciona offline após instalar</li>
                            <li>💻 Sincroniza entre abas do mesmo navegador</li>
                            <li>🔒 Dados ficam apenas no seu dispositivo</li>
                        </ul>
                        
                        <div style="margin-top: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                            <p><strong>🧪 Teste o Save Local:</strong></p>
                            <button class="menu-btn" onclick="StorageInfo.testLocalSave()" style="margin: 0.5rem 0; padding: 8px 16px; font-size: 0.9rem;">
                                <i class="fas fa-save"></i> Criar Save de Teste
                            </button>
                            <button class="menu-btn" onclick="StorageInfo.showSavedData()" style="margin: 0.5rem 0; padding: 8px 16px; font-size: 0.9rem;">
                                📋 Ver Dados Salvos
                            </button>
                        </div>
                        
                        <div style="margin-top: 1rem; padding: 1rem; background: rgba(255, 71, 87, 0.1); border: 1px solid rgba(255, 71, 87, 0.2); border-radius: 6px;">
                            <p><strong><i class="fas fa-cog"></i> Configurar Modo de Save:</strong></p>
                            <button class="menu-btn" onclick="SaveModeManager.showInfoModal()" style="margin: 0.5rem 0.5rem 0.5rem 0; padding: 8px 16px; font-size: 0.9rem;">
                                ❓ Local vs Sincronizado
                            </button>
                            <button class="menu-btn new-game" onclick="new SaveModeManager().showSaveModeModal()" style="margin: 0.5rem 0; padding: 8px 16px; font-size: 0.9rem;">
                                <i class="fas fa-cog"></i> Escolher Modo
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="menu-btn" onclick="this.closest('.modal').remove()">Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-atualizar IndexedDB usage
        setTimeout(() => {
            this.getIndexedDBUsage().then(usage => {
                const usageElement = modal.querySelector('.storage-section:nth-child(2) p:nth-child(3)');
                if (usageElement) {
                    usageElement.innerHTML = `<strong>Usado:</strong> ${usage}`;
                }
            });
        }, 500);
    }
    
    static testLocalSave() {
        try {
            const testSave = {
                id: `test_${Date.now()}`,
                playerName: 'Jogador Teste',
                level: Math.floor(Math.random() * 50) + 1,
                money: Math.floor(Math.random() * 1000000),
                reputation: Math.floor(Math.random() * 100),
                lastPlayed: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem(`risingstar_save_${testSave.id}`, JSON.stringify({
                metadata: {
                    playerName: testSave.playerName,
                    level: testSave.level,
                    lastPlayed: testSave.lastPlayed,
                    createdAt: testSave.createdAt
                },
                gameData: testSave
            }));
            
            alert(`✅ Save criado com sucesso!\n\nJogador: ${testSave.playerName}\nLevel: ${testSave.level}\nDinheiro: $${testSave.money.toLocaleString()}\nReputação: ${testSave.reputation}%`);
        } catch (error) {
            alert(`❌ Erro ao criar save: ${error.message}`);
        }
    }
    
    static showSavedData() {
        const saves = [];
        for (let key in localStorage) {
            if (key.startsWith('risingstar_save_')) {
                try {
                    const data = JSON.parse(localStorage[key]);
                    saves.push({
                        key: key,
                        ...data.metadata
                    });
                } catch (error) {
                    console.warn('Save corrompido:', key);
                }
            }
        }
        
        if (saves.length === 0) {
            alert('📭 Nenhum save encontrado.\n\nCrie um save de teste primeiro!');
            return;
        }
        
        const savesList = saves.map(save => 
            `🎮 ${save.playerName} - Level ${save.level}\n📅 ${new Date(save.lastPlayed).toLocaleString()}`
        ).join('\n\n');
        
        alert(`💾 Saves encontrados (${saves.length}):\n\n${savesList}\n\n✨ Seus dados estão sendo salvos localmente!`);
    }
}

// Adicionar ao objeto global para debug
window.StorageInfo = StorageInfo;
