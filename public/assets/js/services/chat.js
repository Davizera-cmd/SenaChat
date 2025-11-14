// Espera todo o HTML carregar antes de executar o script
document.addEventListener("DOMContentLoaded", () => {

    // 1. Pegar os elementos do HTML
    const chatContainer = document.getElementById('chat-container');
    const input = document.getElementById('pergunta-input');
    const sendButton = document.getElementById('botao-enviar');
    // (O botão de microfone ainda não terá ação)
    // const micButton = document.getElementById('botao-microfone'); 

    // 2. Função principal para adicionar uma mensagem
    function adicionarMensagem(texto, tipo) {
        // 'tipo' pode ser 'usuario' ou 'bot'
        
        // Cria o elemento principal do balão
        const balaoMensagem = document.createElement('div');
        balaoMensagem.classList.add('mensagem-balao', tipo);

        // Adiciona o conteúdo (apenas o parágrafo de texto por enquanto)
        // (Respostas do 'bot' com o botão de áudio são mais complexas)
        if (tipo === 'bot') {
            // Se for bot, adicionamos o botão de áudio + parágrafo
            balaoMensagem.innerHTML = `
                <button class="botao-audio" title="Ouvir áudio">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 11.043c0-3.111-2.486-5.63-5.558-5.63-3.072 0-5.558 2.519-5.558 5.63 0 2.21 1.282 4.13 3.11 5.044v2.019H8.88a.794.794 0 0 0-.794.794c0 .44.356.794.794.794h6.48c.44 0 .794-.356.794-.794 0-.44-.356-.794-.794-.794h-2.228v-2.02c1.828-.913 3.11-2.833 3.11-5.043Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.556 3.393a.794.794 0 0 0-1.116 0c-1.07.973-1.74 2.308-1.74 3.78 0 .142.012.28.035.415.01.06.07.1.133.1.066 0 .125-.043.134-.108.02-.12.03-.243.03-.368 0-1.29 0.58-2.44 1.51-3.29a.794.794 0 0 0 1.116 0Z" />
                    </svg>
                </button>
                <p>${texto}</p>
            `;
        } else {
            // Se for usuário, é só o parágrafo
            balaoMensagem.innerHTML = `<p>${texto}</p>`;
        }

        // Adiciona o balão completo na área de chat
        chatContainer.appendChild(balaoMensagem);

        // Rola a tela para a nova mensagem
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // 3. Função para "enviar" a mensagem
    function enviarMensagemDoUsuario() {
        const texto = input.value.trim(); // Pega o texto do input

        // Se o texto não estiver vazio
        if (texto !== "") {
            // Adiciona o balão do usuário na tela
            adicionarMensagem(texto, 'usuario');
            
            // Limpa o campo de input
            input.value = "";

            // --- Simulação de Resposta do Bot ---
            // (Aqui é onde você chamaria o Gemini)
            // Por enquanto, vamos simular uma resposta após 1 segundo
            setTimeout(() => {
                simularRespostaBot(texto);
            }, 1000);
            // -------------------------------------
        }
    }

    // 4. Função que simula a resposta do bot
    function simularRespostaBot(pergunta) {
        // (Esta função será substituída pela chamada real da API)
        adicionarMensagem("Esta é uma resposta automática. A IA ainda não está conectada.", 'bot');
    }


    // 5. Adicionar os "Ouvintes" de eventos
    
    // Ouvinte para o clique no botão "Enviar"
    sendButton.addEventListener('click', enviarMensagemDoUsuario);

    // Ouvinte para a tecla "Enter" no campo de input
    input.addEventListener('keypress', (event) => {
        // Se a tecla pressionada foi "Enter"
        if (event.key === 'Enter') {
            event.preventDefault(); // Impede o "Enter" de pular linha
            enviarMensagemDoUsuario();
        }
    });

    // --- Fim do script ---
    console.log("Chat.js carregado com sucesso!");
});