/**
 * Rising Star: Music Mogul - Save Mode Manager
 * Gerencia os modos de salvamento: Local vs Sincronizado
 */

export class SaveModeManager {
    constructor() {
        this.currentMode = this.loadSaveMode();
    }
    
    loadSaveMode() {
        return localStorage.getItem('risingstar_save_mode') || 'local';
    }
    
    setSaveMode(mode) {
        localStorage.setItem('risingstar_save_mode', mode);
        this.currentMode = mode;
        console.log(`💾 Modo de save alterado para: ${mode}`);
    }
    
    getCurrentMode() {
        return this.currentMode;
    }
    
    showSaveModeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>💾 Escolha seu Modo de Save</h2>
                </div>
                <div class="modal-body">
                    <div class="save-mode-options">
                        <div class="save-mode-option ${this.currentMode === 'local' ? 'selected' : ''}" data-mode="local">
                            <div class="mode-header">
                                <h3>🔒 Save Local</h3>
                                <div class="mode-status">Ativo</div>
                            </div>
                            <div class="mode-description">
                                <p><strong>✅ Vantagens:</strong></p>
                                <ul>
                                    <li>Funciona 100% offline</li>
                                    <li>Dados ficam no seu dispositivo</li>
                                    <li>Privacidade total</li>
                                    <li>Velocidade máxima</li>
                                </ul>
                                <p><strong>❌ Limitações:</strong></p>
                                <ul>
                                    <li>Save por dispositivo</li>
                                    <li>Não sincroniza entre PC/celular</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="save-mode-option ${this.currentMode === 'cloud' ? 'selected' : ''}" data-mode="cloud">
                            <div class="mode-header">
                                <h3>☁️ Save Sincronizado</h3>
                                <div class="mode-status">Disponível</div>
                            </div>
                            <div class="mode-description">
                                <p><strong>✅ Vantagens:</strong></p>
                                <ul>
                                    <li>Sincroniza entre dispositivos</li>
                                    <li>Joga no PC, continua no celular</li>
                                    <li>Backup automático na nuvem</li>
                                    <li>Nunca perde o save</li>
                                </ul>
                                <p><strong>❌ Requisitos:</strong></p>
                                <ul>
                                    <li>Conexão com internet</li>
                                    <li>Conta Google (anônima)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mode-explanation">
                        <h3>🤔 Como Funciona?</h3>
                        <div class="explanation-grid">
                            <div class="explanation-item">
                                <h4>💾 Save Local:</h4>
                                <p>Seus saves ficam apenas no dispositivo atual. Se você fechar o navegador e reabrir, <strong>os saves continuam lá</strong>. Mas se você trocar de dispositivo, terá que começar do zero.</p>
                            </div>
                            <div class="explanation-item">
                                <h4>☁️ Save Sincronizado:</h4>
                                <p>Seus saves são salvos localmente E na nuvem. Você pode jogar no PC, fechar, e continuar <strong>do mesmo ponto</strong> no celular. Funciona offline, sincroniza quando conecta.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="menu-btn" onclick="this.closest('.modal').remove()">
                        Cancelar
                    </button>
                    <button class="menu-btn new-game" onclick="SaveModeManager.instance.applySaveMode()">
                        Aplicar Modo
                    </button>
                </div>
            </div>
        `;
        
        // Add click handlers for mode selection
        modal.querySelectorAll('.save-mode-option').forEach(option => {
            option.addEventListener('click', () => {
                modal.querySelectorAll('.save-mode-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        document.body.appendChild(modal);
        
        // Store reference for apply method
        SaveModeManager.instance = this;
    }
    
    applySaveMode() {
        const modal = document.querySelector('.modal');
        const selectedOption = modal.querySelector('.save-mode-option.selected');
        
        if (selectedOption) {
            const newMode = selectedOption.getAttribute('data-mode');
            const oldMode = this.currentMode;
            
            this.setSaveMode(newMode);
            
            let message = '';
            if (newMode === 'cloud' && oldMode === 'local') {
                message = '☁️ Modo sincronizado ativado!\n\n✨ Seus saves locais serão mantidos e você poderá sincronizar com a nuvem quando quiser.';
            } else if (newMode === 'local' && oldMode === 'cloud') {
                message = '🔒 Modo local ativado!\n\n💾 Seus saves continuarão funcionando offline. Saves da nuvem ficam disponíveis quando reconectar.';
            } else {
                message = `✅ Modo ${newMode === 'local' ? 'Local' : 'Sincronizado'} já estava ativo!`;
            }
            
            alert(message);
        }
        
        modal.remove();
        
        // Reload the page to apply changes
        if (confirm('🔄 Recarregar a página para aplicar as mudanças?')) {
            window.location.reload();
        }
    }
    
    static showInfoModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>❓ Save Local vs Sincronizado</h2>
                </div>
                <div class="modal-body">
                    <div class="info-section">
                        <h3>🔍 Teste Prático:</h3>
                        <ol>
                            <li><strong>Crie um save</strong> no jogo</li>
                            <li><strong>Feche o navegador</strong> completamente</li>
                            <li><strong>Reabra</strong> e vá em "Carregar Jogo"</li>
                            <li><strong>✅ Seu save estará lá!</strong></li>
                        </ol>
                    </div>
                    
                    <div class="comparison-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Recurso</th>
                                    <th>💾 Local</th>
                                    <th>☁️ Sincronizado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Persiste após fechar navegador</td>
                                    <td>✅ Sim</td>
                                    <td>✅ Sim</td>
                                </tr>
                                <tr>
                                    <td>Funciona offline</td>
                                    <td>✅ Sim</td>
                                    <td>✅ Sim</td>
                                </tr>
                                <tr>
                                    <td>Sincroniza entre dispositivos</td>
                                    <td>❌ Não</td>
                                    <td>✅ Sim</td>
                                </tr>
                                <tr>
                                    <td>Backup na nuvem</td>
                                    <td>❌ Não</td>
                                    <td>✅ Sim</td>
                                </tr>
                                <tr>
                                    <td>Privacidade</td>
                                    <td>✅ Total</td>
                                    <td>🔒 Anônima</td>
                                </tr>
                                <tr>
                                    <td>Velocidade</td>
                                    <td>⚡ Máxima</td>
                                    <td>🌐 Depende da internet</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="recommendation">
                        <h3>💡 Recomendação:</h3>
                        <p><strong>Use Local</strong> se você joga sempre no mesmo dispositivo.</p>
                        <p><strong>Use Sincronizado</strong> se você quer jogar no PC e celular.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="menu-btn" onclick="this.closest('.modal').remove()">
                        Entendi
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

// Make it globally available
window.SaveModeManager = SaveModeManager;
