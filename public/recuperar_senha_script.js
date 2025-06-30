// Exibe mensagens gerais de sucesso ou erro
function displayMessage(type, message) {
    const generalMessageDiv = document.getElementById('general-message');
    if (!generalMessageDiv) return;

    generalMessageDiv.textContent = message;
    generalMessageDiv.className = `message-display ${type}`;
    generalMessageDiv.style.display = 'block';
    generalMessageDiv.classList.remove('fade-out');

    // Esconde com animação após 5 segundos
    setTimeout(() => {
        generalMessageDiv.classList.add('fade-out');
        setTimeout(() => {
            generalMessageDiv.style.display = 'none';
        }, 500);
    }, 5000);
}

// Exibe erro abaixo de um campo específico
function displayInputError(fieldId, message) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    const inputElement = document.getElementById(fieldId);
    if (inputElement) {
        inputElement.style.borderColor = '#dc3545';
    }
}

// Limpa todos os erros e mensagens anteriores
function clearMessages() {
    const generalMessageDiv = document.getElementById('general-message');
    if (generalMessageDiv) {
        generalMessageDiv.style.display = 'none';
        generalMessageDiv.textContent = '';
        generalMessageDiv.classList.remove('fade-out');
    }

    const errorDivs = document.querySelectorAll('.input-error-message');
    errorDivs.forEach(div => {
        div.style.display = 'none';
        div.textContent = '';
    });

    const inputElements = document.querySelectorAll('.password-form input');
    inputElements.forEach(input => {
        input.style.borderColor = '#ccc';
    });
}

// Evento de envio do formulário
const form = document.getElementById('resetPasswordForm');
if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        clearMessages();

        const email = document.getElementById('email_recuperacao').value;
        const novaSenha = document.getElementById('nova-senha_recuperacao').value;
        const confirmarSenha = document.getElementById('confirmar-senha_recuperacao').value;

        // Validação
        if (!email) {
            displayInputError('email_recuperacao', 'Por favor, digite seu email.');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            displayInputError('email_recuperacao', 'Email inválido.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            displayInputError('nova-senha_recuperacao', 'As senhas não coincidem.');
            displayInputError('confirmar-senha_recuperacao', 'As senhas não coincidem.');
            return;
        }

        if (novaSenha.length < 6) {
            displayInputError('nova-senha_recuperacao', 'A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        const data = { email, novaSenha };

        const backendURL = 'https://painel-despesas.onrender.com/api/reset-password';

        try {
            const response = await fetch(backendURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                displayMessage('success', 'Senha alterada com sucesso! Você já pode logar com a nova senha.');

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                displayMessage('error', `Erro ao alterar senha: ${result.message || 'Erro desconhecido.'}`);
                console.error('Erro ao alterar senha:', result);
            }
        } catch (error) {
            displayMessage('error', 'Não foi possível conectar ao servidor. Tente novamente mais tarde.');
            console.error('Erro de conexão:', error);
        }
    });
}
