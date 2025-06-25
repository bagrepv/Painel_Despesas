/**
 * Mostra uma seção específica e esconde as demais
 * @param {string} sectionId - ID da seção a ser mostrada
 */
function showSection(sectionId) {
    // Esconde todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Mostra a seção solicitada
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        section.style.display = 'block';
    }
    
    // Armazena a última seção visitada
    localStorage.setItem('lastVisitedSection', sectionId);
}

/**
 * Configura a navegação do menu principal
 */
function setupMenuNavigation() {
    const menuLinks = document.querySelectorAll('.menu a[data-section]');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

/**
 * Configura o logout do sistema
 */
function setupLogout() {
    const logoutLink = document.querySelector('.logout a');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Limpa os dados de autenticação
            localStorage.removeItem('userToken');
            sessionStorage.clear();
            localStorage.removeItem('lastVisitedSection');
            
            // Redireciona para a página de login
            window.location.href = 'login.html';
        });
    }
}

/**
 * Configura o formulário de perfil (AGORA USADO PARA O PRIMEIRO ACESSO TAMBÉM)
 */
function setupProfileForm() {
    // Seleciona o formulário AGORA PELO ID CORRETO usado em primeiro_acesso.html
    const primeiroAcessoForm = document.getElementById('primeiroAcessoForm'); 
    
    if (primeiroAcessoForm) { // Verifica se o formulário existe na página
        primeiroAcessoForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Impede o recarregamento da página

            // Coleta todos os dados dos campos do formulário
            const formData = {
                nome: document.getElementById('nome').value,
                cpf: document.getElementById('cpf').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value,
                senha: document.getElementById('senha').value, // A senha será hasheada no backend
                orgao: document.getElementById('orgao').value,
                setor: document.getElementById('setor').value,
                cargo: document.getElementById('cargo').value
            };

            // URL do seu endpoint de cadastro no backend (Render)
            // Lembre-se: Para testar LOCALMENTE o backend, mude para 'http://localhost:5000/api/sign-up'
            const backendURL = 'https://painel-despesas.onrender.com/api/sign-up'; 

            try {
                // Envia os dados para o backend usando a Fetch API
                const response = await fetch(backendURL, {
                    method: 'POST', // Método HTTP POST para enviar dados
                    headers: {
                        'Content-Type': 'application/json' // Indica que o corpo da requisição é JSON
                    },
                    body: JSON.stringify(formData) // Converte o objeto JS para uma string JSON
                });

                const data = await response.json(); // Tenta analisar a resposta como JSON

                if (response.ok) { // Verifica se a resposta foi um sucesso (status 2xx)
                    alert('Cadastro realizado com sucesso! Você pode fazer login agora.');
                    // Redireciona para a página de login após o cadastro
                    window.location.href = 'login.html';
                } else {
                    // Se o backend retornou um erro (ex: e-mail já existe, validação)
                    alert(`Erro no cadastro: ${data.message || 'Ocorreu um erro desconhecido.'}`);
                    console.error('Erro no cadastro (resposta do servidor):', data);
                }
            } catch (error) {
                // Captura erros de rede ou outros problemas na requisição
                alert('Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.');
                console.error('Erro na requisição de cadastro (frontend):', error);
            }
        });
    }
}

/**
 * Configura o formulário de senha
 */
function setupPasswordForm() {
    const passwordForm = document.querySelector('.password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPass = document.getElementById('senha-atual').value;
            const newPass = document.getElementById('nova-senha').value;
            const confirmPass = document.getElementById('confirmar-senha').value;
            
            if (newPass !== confirmPass) {
                alert('As senhas não coincidem!');
                return;
            }
            
            if (newPass.length < 6) {
                alert('A senha deve ter pelo menos 6 caracteres!');
                return;
            }
            
            alert('Senha alterada com sucesso!');
            this.reset();
        });
    }
}

/**
 * Configura o link "Primeiro acesso"
 */
function setupFirstAccessLink() {
    // Este link é para navegação interna, se houver um link na mesma página
    // que leva à seção de perfil/cadastro.
    const firstAccessLink = document.getElementById('go-to-profile');
    if (firstAccessLink) {
        firstAccessLink.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('profile-content');
            
            // Rola suavemente para o topo da seção
            document.getElementById('profile-content').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Aplica máscara para campos de formulário
 */
function setupFormMasks() {
    // Máscara para CPF
    const cpfField = document.getElementById('cpf');
    if (cpfField) {
        cpfField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // Máscara para telefone
    const phoneField = document.getElementById('telefone');
    if (phoneField) {
        phoneField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            e.target.value = value;
        });
    }
}

/**
 * Verifica a autenticação do usuário
 */
function checkAuthentication() {
    const userToken = localStorage.getItem('userToken');
    const isLoginPage = window.location.pathname.includes('login.html');
    // Redireciona se não autenticado e não está na página de login
    if (!userToken && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }
    
    // Redireciona se já autenticado e está na página de login
    if (userToken && isLoginPage) {
        window.location.href = 'index.html';
    }
}

// =============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    // Verifica autenticação (se este script for usado em outras páginas, como index.html)
    checkAuthentication();
    
    // Configurações gerais de navegação e formulários
    setupMenuNavigation();
    setupLogout();
    setupProfileForm(); // <-- Esta função agora está correta para o primeiro acesso
    setupPasswordForm();
    setupFirstAccessLink();
    setupFormMasks();
    
    // Mostra a última seção visitada ou o dashboard por padrão
    // Isso provavelmente é para a página 'index.html' ou similar, não para 'primeiro_acesso.html'
    const lastSection = localStorage.getItem('lastVisitedSection') || 'dashboard-content';
    // showSection(lastSection); // Removido, pois primeiro_acesso.html abre um modal
});

// Este bloco está duplicado e o que manipula a abertura do modal de primeiro acesso
// deveria ser mais genérico para a página 'primeiro_acesso.html'
document.addEventListener('DOMContentLoaded', function() {
    // Se o modal estiver sendo aberto via #modal-perfil na URL
    if (window.location.hash === '#modal-perfil') {
        const modalPerfil = document.getElementById('modal-perfil');
        if (modalPerfil) {
            modalPerfil.style.display = 'flex'; // Exibe o modal
        }
    }

    // Configura o botão de fechar do modal
    const closeBtn = document.querySelector('#modal-perfil .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalPerfil = document.getElementById('modal-perfil');
            if (modalPerfil) {
                modalPerfil.style.display = 'none';
                history.replaceState(null, '', window.location.pathname); // Limpa o hash da URL
            }
        });
    }

    // Código relacionado ao primeiro acesso de perfil, se a página for para isso
    // if (localStorage.getItem('firstAccess') === 'true') {
    //     showSection('profile-content'); // Isso esperaria uma seção com ID 'profile-content'
    //     localStorage.removeItem('firstAccess'); // Opcional: remove a flag após uso
        
    //     // Destaca campos obrigatórios - isso é mais CSS do que JS, mas ok
    //     document.querySelectorAll('#profile-content input[required]').forEach(input => {
    //         input.style.border = '2px solid #FFA500';
    //     });
    // }
});
