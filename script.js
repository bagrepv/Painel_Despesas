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
 * Configura o formulário de perfil
 */
function setupProfileForm() {
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('nome').value;
            const cpf = document.getElementById('cpf').value;
            const senha = document.getElementById('senha').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;
            const orgao = document.getElementById('orgao').value;
            const setor = document.getElementById('setor').value;
            const cargo = document.getElementById('cargo').value;
            const data = {
                nome,
                cpf,
                senha,
                email,
                telefone,
                orgao,
                setor,
                cargo,
            };
            
            fetch('http://localhost:5000/api/sign-up', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(res => {
                    console.log(res)
                }).catch(error => {
                    alert("Erro ao logar.");
                });
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
    // Verifica autenticação
    checkAuthentication();
    
    // Configura componentes
    setupMenuNavigation();
    setupLogout();
    setupProfileForm();
    setupPasswordForm();
    setupFirstAccessLink();
    setupFormMasks();
    
    // Mostra a última seção visitada ou o dashboard por padrão
    const lastSection = localStorage.getItem('lastVisitedSection') || 'dashboard-content';
    showSection(lastSection);
});

document.addEventListener('DOMContentLoaded', function() {
    // Verifica se é primeiro acesso
    if (localStorage.getItem('firstAccess') === 'true') {
        showSection('profile-content');
        localStorage.removeItem('firstAccess'); // Opcional: remove a flag após uso
        
        // Destaca campos obrigatórios
        document.querySelectorAll('#profile-content input[required]').forEach(input => {
            input.style.border = '2px solid #FFA500';
        });
    }
    
    // Restante do seu código...
});