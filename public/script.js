/**
 * Mostra uma seção específica e esconde as demais.
 * Esta função é útil para páginas que contêm múltiplas seções (como index.html).
 * @param {string} sectionId - ID da seção a ser mostrada.
 */
function showSection(sectionId) {
    // Esconde todas as seções marcadas com a classe 'content-section'.
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Mostra a seção solicitada.
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        section.style.display = 'block';
    }
    
    // Armazena a última seção visitada no localStorage para persistência.
    localStorage.setItem('lastVisitedSection', sectionId);
}

/**
 * Configura a navegação do menu principal.
 * Atribui event listeners aos links do menu que possuem o atributo 'data-section'.
 */
function setupMenuNavigation() {
    const menuLinks = document.querySelectorAll('.menu a[data-section]');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Impede o comportamento padrão do link.
            const sectionId = this.getAttribute('data-section'); // Obtém o ID da seção do atributo.
            showSection(sectionId); // Chama a função para mostrar a seção.
        });
    });
}

/**
 * Configura a funcionalidade de logout do sistema.
 * Limpa o token de autenticação e redireciona para a página de login.
 */
function setupLogout() {
    const logoutLink = document.querySelector('.logout a');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault(); // Impede o comportamento padrão do link.
            
            // Limpa todos os dados de autenticação e sessão do armazenamento local e de sessão.
            localStorage.removeItem('userToken');
            sessionStorage.clear(); // Limpa todas as chaves da sessão
            localStorage.removeItem('lastVisitedSection'); // Limpa a última seção visitada
            
            // Redireciona o usuário para a página de login.
            window.location.href = 'login.html';
        });
    }
}

// REMOVIDO: Funcoes displayGeneralMessage, displayInputError, clearAllMessages

/**
 * Configura o formulário de perfil, que agora também é usado para o "Primeiro Acesso" (cadastro).
 * Lida com a submissão do formulário, coleta dados e os envia para o backend.
 */
function setupProfileForm() {
    // Seleciona o formulário pelo seu ID específico 'primeiroAcessoForm'.
    const primeiroAcessoForm = document.getElementById('primeiroAcessoForm'); 
    
    if (primeiroAcessoForm) { // Verifica se o formulário existe na página atual.
        primeiroAcessoForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Impede o recarregamento padrão da página ao submeter o formulário.

            // Coleta todos os valores dos campos do formulário em um objeto.
            const formData = {
                nome: document.getElementById('nome').value,
                cpf: document.getElementById('cpf').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value,
                senha: document.getElementById('senha').value, // A senha será hasheada no backend.
                orgao: document.getElementById('orgao').value,
                setor: document.getElementById('setor').value,
                cargo: document.getElementById('cargo').value
            };

            // Validacoes (agora usando alert() novamente)
            if (!formData.nome) { alert('Nome é obrigatório.'); return; }
            if (!formData.cpf) { alert('CPF é obrigatório.'); return; }
            if (!formData.email) { alert('Email é obrigatório.'); return; }
            if (!formData.email.includes('@') || !formData.email.includes('.')) {
                alert('Email inválido.');
                return;
            }
            if (!formData.senha || formData.senha.length < 6) {
                alert('Senha deve ter no mínimo 6 caracteres.');
                return;
            }
            if (!formData.orgao) { alert('Órgão é obrigatório.'); return; }
            if (!formData.setor) { alert('Setor é obrigatório.'); return; }
            if (!formData.cargo) { alert('Cargo é obrigatório.'); return; }


            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // ATENCAO: Ajuste esta URL conforme o ambiente:
            // Para TESTE LOCAL: 'http://localhost:5000/api/sign-up'
            // Para PRODUCAO (Render): 'https://painel-despesas.onrender.com/api/sign-up'
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const backendURL = 'https://painel-despesas.onrender.com/api/sign-up'; // ATUALMENTE CONFIGURADO PARA TESTE LOCAL
            
            try {
                // Envia os dados para o backend usando a Fetch API.
                const response = await fetch(backendURL, {
                    method: 'POST', // Usa o método POST para enviar dados.
                    headers: {
                        'Content-Type': 'application/json' // Informa ao servidor que o corpo da requisição é JSON.
                    },
                    body: JSON.stringify(formData) // Converte o objeto JS para uma string JSON.
                });

                // Tenta analisar a resposta do backend como JSON.
                const data = await response.json(); 

                if (response.ok) { // 'response.ok' é true para status 2xx (sucesso).
                    alert('Cadastro realizado. Aguardar Aprovação'); 
                    setTimeout(() => {
                        window.location.href = 'login.html'; 
                    }, 2000); 
                } else {
                    // Se o backend retornou um erro (status 4xx ou 5xx).
                    // Exibe a mensagem de erro fornecida pelo backend, se disponível.
                    alert(`Erro no cadastro: ${data.message || 'Ocorreu um erro desconhecido.'}`);
                    console.error('Erro no cadastro (resposta do servidor):', data);
                }
            } catch (error) {
                // Captura erros de rede (ex: servidor offline, sem conexão) ou outros problemas na requisição.
                alert('Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.');
                console.error('Erro na requisição de cadastro (frontend):', error);
            }
        });
    }
}

/**
 * Configura o formulário de alteração de senha (dentro de Perfil, index.html).
 */
function setupPasswordForm() {
    const passwordForm = document.querySelector('.password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) { // Adicionado 'async'
            e.preventDefault(); // Impede o recarregamento padrão da página.
            
            const currentPass = document.getElementById('senha-atual').value;
            const newPass = document.getElementById('nova-senha').value;
            const confirmPass = document.getElementById('confirmar-senha').value;
            
            // Validacoes
            if (!currentPass) { alert('Senha atual é obrigatória.'); return; }
            if (!newPass) { alert('Nova senha é obrigatória.'); return; }
            if (!confirmPass) { alert('Confirmação de senha é obrigatória.'); return; }

            if (newPass !== confirmPass) {
                alert('As senhas não coincidem!');
                return;
            }
            
            if (newPass.length < 6) {
                alert('A senha deve ter pelo menos 6 caracteres!');
                return;
            }

            // AQUI VOCE ADICIONARIA A LOGICA DE ENVIO PARA O BACKEND PARA ATUALIZAR A SENHA DO PERFIL
            // Por enquanto, apenas um feedback local
            alert('Senha alterada com sucesso (apenas localmente)!');
            this.reset(); // Limpa os campos do formulário.
        });
    }
}

/**
 * Configura o link "Primeiro acesso" para navegação interna na página (se aplicável).
 * Este é um link que pode levar à seção de perfil/cadastro dentro da mesma página.
 */
function setupFirstAccessLink() {
    const firstAccessLink = document.getElementById('go-to-profile');
    if (firstAccessLink) {
        firstAccessLink.addEventListener('click', function(e) {
            e.preventDefault(); // Impede o comportamento padrão do link.
            showSection('profile-content'); // Assume que existe uma seção com ID 'profile-content'.
            
            // Rola suavemente para a seção visualizada.
            document.getElementById('profile-content').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Aplica máscaras de formatação para campos de formulário (CPF e telefone).
 */
function setupFormMasks() {
    // Máscara para CPF.
    const cpfField = document.getElementById('cpf');
    if (cpfField) {
        cpfField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito.
            value = value.replace(/(\d{3})(\d)/, '$1.$2'); // Adiciona o primeiro ponto.
            value = value.replace(/(\d{3})(\d)/, '$1.$2'); // Adiciona o segundo ponto.
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona o traço.
            e.target.value = value;
        });
    }
    
    // Máscara para telefone.
    const phoneField = document.getElementById('telefone');
    if (phoneField) {
        phoneField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito.
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2'); // Adiciona parênteses e espaço para DDD.
            value = value = value.replace(/(\d)(\d{4})$/, '$1-$2'); // Adiciona o traço para os últimos 4 dígitos.
            e.target.value = value;
        });
    }
}

/**
 * Verifica o estado de autenticação do usuário e redireciona conforme necessário.
 * Esta função é importante para proteger rotas e garantir a experiência correta do usuário.
 */
function checkAuthentication() {
    console.log("checkAuthentication: Iniciando verificação de autenticação."); // Log 1
    const userToken = localStorage.getItem('userToken');
    console.log("checkAuthentication: userToken =", userToken); // Log 2
    const isLoginPage = window.location.pathname.includes('login.html');
    console.log("checkAuthentication: isLoginPage =", isLoginPage); // Log 3
    const isPrimeiroAcessoPage = window.location.pathname.includes('primeiro_acesso.html');
    console.log("checkAuthentication: isPrimeiroAcessoPage =", isPrimeiroAcessoPage); // Log 4

    // Redireciona para a página de login se o usuário não está autenticado
    // E não está na página de login OU na página de primeiro acesso.
    if (!userToken && !isLoginPage && !isPrimeiroAcessoPage) { 
        console.log("checkAuthentication: Redirecionando para login.html (Usuário não autenticado em página protegida)."); // Log 5
        window.location.href = 'login.html';
        return;
    }
    
    // Opcional: Redireciona para a página principal (index) se já está autenticado
    // e tentar acessar a página de login OU a página de primeiro acesso.
    if (userToken && (isLoginPage || isPrimeiroAcessoPage)) { 
        console.log("checkAuthentication: Redirecionando para index.html (Usuário autenticado em página de login/cadastro)."); // Log 6
        window.location.href = 'index.html';
    }
    console.log("checkAuthentication: Nenhuma regra de redirecionamento aplicada."); // Log 7
}

// =============================================
// INICIALIZAÇÃO PRINCIPAL DA APLICAÇÃO
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded: DOM completamente carregado."); // Log 8
    
    // Verifica autenticação (útil para todas as páginas que usam este script, como index.html).
    checkAuthentication(); // Esta chamada ativa a depuração da função

    console.log("DOMContentLoaded: Chamando funções de setup."); // Log 9
    // Configura todas as funcionalidades interativas da aplicação.
    setupMenuNavigation();
    setupLogout();
    setupProfileForm(); 
    setupPasswordForm();
    setupFirstAccessLink();
    setupFormMasks();
    
    // Lógica específica para a página 'primeiro_acesso.html' para exibir o modal.
    console.log("DOMContentLoaded: Verificando hash para modal de primeiro acesso."); // Log 10
    if (window.location.hash === '#modal-perfil') {
        const modalPerfil = document.getElementById('modal-perfil');
        if (modalPerfil) {
            console.log("DOMContentLoaded: Exibindo modal de perfil."); // Log 11
            modalPerfil.style.display = 'flex'; // Exibe o modal se o hash estiver presente.
        } else {
            console.log("DOMContentLoaded: Modal de perfil não encontrado no DOM."); // Log 12
        }
    }

    // Configura o botão de fechar do modal de primeiro acesso.
    const closeBtn = document.querySelector('#modal-perfil .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalPerfil = document.getElementById('modal-perfil');
            if (modalPerfil) {
                console.log("Modal de perfil: Fechando modal."); // Log 13
                modalPerfil.style.display = 'none'; // Esconde o modal.
                history.replaceState(null, '', window.location.pathname); // Limpa o hash da URL.
            }
        });
    }
});
