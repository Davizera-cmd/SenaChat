/**
 * Sistema Global de Acessibilidade
 * Injeta e controla o painel de acessibilidade em todas as páginas
 */

(function() {
    'use strict';

    const PAINEL_HTML_PATH = './assets/html/painel-acessibilidade.html';
    const STORAGE_KEY = 'senachat-acessibilidade';
    
    // Estado da acessibilidade
    let estadoAtual = {
        tema: null, // será definido pela detecção do sistema
        contraste: false,
        scaleFactor: 1,
        filtroDaltonismo: 'none'
    };

    // Detecta preferência do sistema
    function detectarTemaDoSistema() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'claro';
        }
        return 'escuro';
    }

    // Carrega preferências salvas ou usa padrão do sistema
    function carregarPreferencias() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                estadoAtual = JSON.parse(saved);
            } catch (e) {
                console.error('[Acessibilidade] Erro ao carregar preferências:', e);
            }
        }
        
        // Se não há tema salvo, usa a preferência do sistema
        if (!estadoAtual.tema) {
            estadoAtual.tema = detectarTemaDoSistema();
        }
        
        aplicarEstado();
    }

    // Salva preferências
    function salvarPreferencias() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoAtual));
    }

    // Aplica o estado atual
    function aplicarEstado() {
        // Aplica tema
        if (estadoAtual.tema === 'claro') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Aplica escala de fonte
        document.documentElement.style.setProperty('--scale-factor', estadoAtual.scaleFactor);

        // Aplica filtro de daltonismo
        aplicarFiltroDaltonismoCSS(estadoAtual.filtroDaltonismo);

        // Aplica alto contraste
        if (estadoAtual.contraste) {
            document.body.classList.add('alto-contraste');
        } else {
            document.body.classList.remove('alto-contraste');
        }
    }
    
    async function carregarPainelAcessibilidade() {
        try {
            const response = await fetch(PAINEL_HTML_PATH);
            const html = await response.text();
            
            const container = document.createElement('div');
            container.innerHTML = html;
            document.body.appendChild(container.firstElementChild);
            
            inicializarPainel();
            atualizarUIParaEstadoAtual();
        } catch (error) {
            console.error('[Acessibilidade] Erro ao carregar painel:', error);
        }
    }

    // Atualiza a UI do painel para refletir o estado atual
    function atualizarUIParaEstadoAtual() {
        // Atualiza tema
        const opcoesTema = document.querySelectorAll('[data-opcao^="tema-"]');
        opcoesTema.forEach(opt => {
            const isTemaEscuro = opt.dataset.opcao === 'tema-escuro';
            const isTemaClaro = opt.dataset.opcao === 'tema-claro';
            const isAtivo = (isTemaEscuro && estadoAtual.tema === 'escuro') || 
                           (isTemaClaro && estadoAtual.tema === 'claro');
            
            opt.classList.toggle('ativo', isAtivo);
            const status = opt.querySelector('.opcao-acessibilidade_status');
            if (status) status.textContent = isAtivo ? 'Ativo' : 'Inativo';
        });

        // Atualiza alto contraste
        const altoContraste = document.querySelector('[data-opcao="alto-contraste"]');
        if (altoContraste) {
            altoContraste.classList.toggle('ativo', estadoAtual.contraste);
            const status = altoContraste.querySelector('.opcao-acessibilidade_status');
            if (status) status.textContent = estadoAtual.contraste ? 'Ativo' : 'Inativo';
        }

        // Atualiza filtro daltonismo
        const opcoesDaltonismo = document.querySelectorAll('[data-opcao^="daltonismo-"]');
        opcoesDaltonismo.forEach(opt => {
            const tipo = opt.dataset.opcao.replace('daltonismo-', '');
            const isAtivo = (tipo === 'desativar' && estadoAtual.filtroDaltonismo === 'none') ||
                           estadoAtual.filtroDaltonismo === tipo;
            opt.classList.toggle('ativo', isAtivo);
        });

        // Atualiza descrição do tamanho da fonte
        atualizarDescricaoFonte();
    }

    function inicializarPainel() {
        const painel = document.getElementById('painelAcessibilidade');
        const botoesAbrir = document.querySelectorAll('.botao-acessibilidade');
        const botaoFechar = painel.querySelector('.painel-acessibilidade_fechar');
        const conteudo = painel.querySelector('.painel-acessibilidade_conteudo');
        const opcoes = painel.querySelectorAll('.opcao-acessibilidade');

        function abrirPainel() {
            painel.classList.add('ativo');
        }

        function fecharPainel() {
            painel.classList.remove('ativo');
        }

        botoesAbrir.forEach(botao => {
            botao.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirPainel();
            });
        });

        botaoFechar.addEventListener('click', fecharPainel);

        document.addEventListener('click', (e) => {
            if (painel.classList.contains('ativo') && 
                !conteudo.contains(e.target) && 
                !Array.from(botoesAbrir).some(btn => btn.contains(e.target))) {
                fecharPainel();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && painel.classList.contains('ativo')) {
                fecharPainel();
            }
        });

        opcoes.forEach(opcao => {
            opcao.addEventListener('click', () => {
                const tipo = opcao.dataset.opcao;
                handleOpcaoClick(tipo, opcao);
            });
        });
    }

    function handleOpcaoClick(tipo, elemento) {
        console.log(`[Acessibilidade] Opção clicada: ${tipo}`);
        
        switch(tipo) {
            case 'tema-escuro':
                alterarTema('escuro');
                break;
            case 'tema-claro':
                alterarTema('claro');
                break;
            case 'alto-contraste':
                toggleAltoContraste();
                break;
            case 'fonte-aumentar':
                ajustarFonte('+');
                break;
            case 'fonte-diminuir':
                ajustarFonte('-');
                break;
            case 'fonte-resetar':
                ajustarFonte('reset');
                break;
            case 'daltonismo-protanopia':
                aplicarFiltroDaltonismo('protanopia');
                break;
            case 'daltonismo-deuteranopia':
                aplicarFiltroDaltonismo('deuteranopia');
                break;
            case 'daltonismo-tritanopia':
                aplicarFiltroDaltonismo('tritanopia');
                break;
            case 'daltonismo-desativar':
                aplicarFiltroDaltonismo('none');
                break;
            case 'resetar-tudo':
                resetarTudo();
                break;
        }
    }

    function alterarTema(tema) {
        estadoAtual.tema = tema;
        aplicarEstado();
        salvarPreferencias();
        atualizarUIParaEstadoAtual();
    }

    function toggleAltoContraste() {
        estadoAtual.contraste = !estadoAtual.contraste;
        aplicarEstado();
        salvarPreferencias();
        atualizarUIParaEstadoAtual();
    }

    function ajustarFonte(acao) {
        if (acao === '+') {
            // Se já está no máximo, volta ao normal
            if (estadoAtual.scaleFactor >= 1.5) {
                estadoAtual.scaleFactor = 1;
            } else {
                estadoAtual.scaleFactor = Math.min(
                    Math.round((estadoAtual.scaleFactor + 0.1) * 10) / 10, 
                    1.5
                );
            }
        } else if (acao === '-') {
            // Se já está no mínimo, volta ao normal
            if (estadoAtual.scaleFactor <= 0.8) {
                estadoAtual.scaleFactor = 1;
            } else {
                estadoAtual.scaleFactor = Math.max(
                    Math.round((estadoAtual.scaleFactor - 0.1) * 10) / 10, 
                    0.8
                );
            }
        } else if (acao === 'reset') {
            estadoAtual.scaleFactor = 1;
        }
        
        aplicarEstado();
        salvarPreferencias();
        atualizarDescricaoFonte();
        
        console.log('[Acessibilidade] Fonte ajustada:', estadoAtual.scaleFactor);
    }

    function atualizarDescricaoFonte() {
        const descricoes = document.querySelectorAll('[data-opcao^="fonte-"] .opcao-acessibilidade_descricao');
        descricoes.forEach(desc => {
            let texto = 'Tamanho: ';
            if (estadoAtual.scaleFactor > 1) {
                const porcentagem = Math.round((estadoAtual.scaleFactor - 1) * 100);
                texto += `+${porcentagem}%`;
            } else if (estadoAtual.scaleFactor < 1) {
                const porcentagem = Math.round((1 - estadoAtual.scaleFactor) * 100);
                texto += `-${porcentagem}%`;
            } else {
                texto += 'Normal';
            }
            desc.textContent = texto;
        });
    }

    function aplicarFiltroDaltonismo(tipo) {
        estadoAtual.filtroDaltonismo = tipo;
        aplicarEstado();
        salvarPreferencias();
        atualizarUIParaEstadoAtual();
    }

    function aplicarFiltroDaltonismoCSS(tipo) {
        // Remove filtros anteriores
        document.body.classList.remove('filtro-protanopia', 'filtro-deuteranopia', 'filtro-tritanopia');
        
        // Aplica novo filtro se não for 'none'
        if (tipo !== 'none') {
            document.body.classList.add(`filtro-${tipo}`);
        }
    }

    function resetarTudo() {
        estadoAtual = {
            tema: detectarTemaDoSistema(),
            contraste: false,
            scaleFactor: 1,
            filtroDaltonismo: 'none'
        };
        
        aplicarEstado();
        salvarPreferencias();
        atualizarUIParaEstadoAtual();
    }

    // Carrega preferências ao iniciar
    carregarPreferencias();

    // Injeta filtros SVG para daltonismo
    function injetarFiltrosSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('style', 'position: absolute; width: 0; height: 0;');
        svg.setAttribute('aria-hidden', 'true');
        
        svg.innerHTML = `
            <defs>
                <!-- Protanopia -->
                <filter id="protanopia-filter">
                    <feColorMatrix type="matrix" values="
                        0.567, 0.433, 0,     0, 0
                        0.558, 0.442, 0,     0, 0
                        0,     0.242, 0.758, 0, 0
                        0,     0,     0,     1, 0"/>
                </filter>
                
                <!-- Deuteranopia -->
                <filter id="deuteranopia-filter">
                    <feColorMatrix type="matrix" values="
                        0.625, 0.375, 0,   0, 0
                        0.7,   0.3,   0,   0, 0
                        0,     0.3,   0.7, 0, 0
                        0,     0,     0,   1, 0"/>
                </filter>
                
                <!-- Tritanopia -->
                <filter id="tritanopia-filter">
                    <feColorMatrix type="matrix" values="
                        0.95, 0.05,  0,     0, 0
                        0,    0.433, 0.567, 0, 0
                        0,    0.475, 0.525, 0, 0
                        0,    0,     0,     1, 0"/>
                </filter>
            </defs>
        `;
        
        document.body.insertBefore(svg, document.body.firstChild);
    }

    injetarFiltrosSVG();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', carregarPainelAcessibilidade);
    } else {
        carregarPainelAcessibilidade();
    }

    // Observa mudanças na preferência do sistema
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
            // Só atualiza se o usuário não tiver uma preferência salva explícita
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved || !JSON.parse(saved).tema) {
                estadoAtual.tema = e.matches ? 'claro' : 'escuro';
                aplicarEstado();
                atualizarUIParaEstadoAtual();
            }
        });
    }

    window.Acessibilidade = {
        abrir: () => {
            const painel = document.getElementById('painelAcessibilidade');
            if (painel) painel.classList.add('ativo');
        },
        fechar: () => {
            const painel = document.getElementById('painelAcessibilidade');
            if (painel) painel.classList.remove('ativo');
        },
        getEstado: () => estadoAtual,
        setTema: (tema) => alterarTema(tema)
    };
})();
