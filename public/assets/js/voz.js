/* ========================================
   Página de Voz - Controller (UI apenas)
   Responsabilidades:
   - Controlar interações da UI
   - Gerenciar animações visuais
   - Delegar lógica de áudio para GeminiService
   ======================================== */

import GeminiService from './services/gemini-service.js';

(function() {
    'use strict';

    // ========================================
    // Elementos do DOM
    // ========================================
    
    const botaoMicrofone = document.getElementById('botaoMicrofone');
    const indicadorAudio = document.getElementById('indicadorAudio');
    const statusGravacao = document.getElementById('statusGravacao');
    const botaoVoltar = document.querySelector('.botao-voltar');
    const textoInicial = document.querySelector('.texto-inicial');

    // ========================================
    // Serviço Gemini
    // ========================================
    
    const geminiService = new GeminiService();
    
    geminiService.onStatusChange = atualizarStatus;
    geminiService.onError = mostrarErro;
    geminiService.onAudioReceived = (duracao) => {
        // Callback para quando áudio for recebido
    };

    // ========================================
    // Estado da UI
    // ========================================
    
    let estaGravando = false;
    let jaMandouPrimeiroAudio = false;

    // ========================================
    // Inicialização
    // ========================================
    
    async function inicializar() {
        botaoMicrofone.addEventListener('click', alternarGravacao);
        botaoVoltar.addEventListener('click', voltarParaInicio);

        atualizarStatus('Inicializando...');
        await geminiService.inicializarSessao();

        if (window.AureaAnimacao) {
            const audioContext = geminiService.getOutputAudioContext();
            if (audioContext) {
                window.AureaAnimacao.conectarAudioContext(audioContext, geminiService);
            }
        }
    }

    // ========================================
    // Controles de Gravação
    // ========================================
    
    async function alternarGravacao() {
        if (estaGravando) {
            pararGravacao();
        } else {
            await iniciarGravacao();
        }
    }

    async function iniciarGravacao() {
        const sucesso = await geminiService.iniciarGravacao();
        
        if (sucesso) {
            estaGravando = true;
            botaoMicrofone.classList.add('gravando');
            indicadorAudio.classList.add('ativo');
            
            if (!jaMandouPrimeiroAudio && textoInicial) {
                textoInicial.classList.add('oculto');
                jaMandouPrimeiroAudio = true;
            }
        }
    }

    function pararGravacao() {
        geminiService.pararGravacao();
        
        estaGravando = false;
        botaoMicrofone.classList.remove('gravando');
        indicadorAudio.classList.remove('ativo');
    }

    // ========================================
    // Navegação
    // ========================================
    
    function voltarParaInicio() {
        if (estaGravando) {
            pararGravacao();
        }
        window.location.href = './paginainicial.html';
    }

    // Feedback Visual    
    function atualizarStatus(mensagem) {
        statusGravacao.textContent = mensagem;
        statusGravacao.style.color = '';
    }

    function mostrarErro(mensagem) {
        statusGravacao.textContent = mensagem;
        statusGravacao.style.color = 'rgba(239, 68, 68, 0.9)';
        
        setTimeout(() => {
            atualizarStatus('Toque para falar');
        }, 3000);
    }

    // Inicialização da Página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

})();

