// TESTE TEMPORÁRIO - Desabilitar todos os novos sistemas
// Execute este código no console para testar se algum dos novos sistemas está causando o problema

console.log('🧪 INICIANDO TESTE DE ISOLAMENTO...');

// 1. Desabilitar ConfigManager
if (window.configManager) {
    console.log('❌ Desabilitando ConfigManager...');
    window.configManager.observers = [];
    window.configManager = null;
}

// 2. Desabilitar DebugManager  
if (window.debugManager) {
    console.log('❌ Desabilitando DebugManager...');
    window.debugManager = null;
    window.dlog = null;
}

// 3. Desabilitar ToastManager
if (window.toastManager) {
    console.log('❌ Desabilitando ToastManager...');
    window.toastManager = null;
}

// 4. Desabilitar Utils
if (window.Utils) {
    console.log('❌ Desabilitando Utils...');
    window.Utils = null;
    window.u = null;
}

// 5. Aplicar CSS anti-cursor ultra-agressivo
const testStyle = document.createElement('style');
testStyle.id = 'test-anti-cursor';
testStyle.textContent = `
    /* TESTE ANTI-CURSOR */
    * {
        -webkit-user-select: none !important;
        user-select: none !important;
        caret-color: transparent !important;
    }
    
    input, textarea {
        -webkit-user-select: text !important;
        user-select: text !important;
        caret-color: auto !important;
    }
`;
document.head.appendChild(testStyle);

console.log('✅ TESTE CONCLUÍDO - Novos sistemas desabilitados, CSS teste aplicado');
console.log('🔍 Teste agora se o cursor de texto desapareceu');
console.log('💡 Para reverter, recarregue a página');