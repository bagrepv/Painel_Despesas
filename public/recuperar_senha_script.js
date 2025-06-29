// Este script contem a logica para a pagina de recuperacao de senha.

// Funcao auxiliar para exibir mensagens gerais (sucesso, erro, aviso)
function displayMessage(type, message) {
    const generalMessageDiv = document.getElementById('general-message');
    generalMessageDiv.textContent = message;
    generalMessageDiv.className = `message-display ${type}`; // Adiciona a classe de tipo (success, error, warning)
    generalMessageDiv.style.display = 'block'; // Torna visivel
    
    // Opcional: Esconder a mensagem apos alguns segundos
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            generalMessageDiv.style.display = 'none';
        }, 5000); // Esconde apos 5 segundos
    }
}

// Funcao auxiliar para exibir erros de validacao por campo
function displayInputError(fieldId, message) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    // Opcional: Adicionar borda vermelha ao input
    const inputElement = document.getElementById(fieldId);
    if (inputElement) {
        inputElement.style.borderColor = '#dc3545';
    }
}

// Funcao auxiliar para limpar todas as mensagens e erros de campo
function clearMessages() {
    document.getElementById('general-message').style.display = 'none';
    document.getElementById('general-message').textContent = '';

    const errorDivs = document.querySelectorAll('.input-error-message');
    errorDivs.forEach(div => {
        div.style.display = 'none';
        div.textContent = '';
    });

    const inputElements = document.querySelectorAll('.password-form input');
    inputElements.forEach(input => {
        input.style.borderColor = '#ccc'; // Volta para a cor padrao
    });
}


document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
  e.preventDefault(); // Impede o envio padrao do formulario

  clearMessages(); // Limpa mensagens anteriores antes de cada submissao

  const email = document.getElementById('email_recuperacao').value;
  const novaSenha = document.getElementById('nova-senha_recuperacao').value;
  const confirmarSenha = document.getElementById('confirmar-senha_recuperacao').value;

  // Validacoes (agora usando displayInputError)
  if (!email) {
    displayInputError('email_recuperacao', 'Por favor, digite seu email.');
    return;
  }
  // Exemplo de validacao de formato de email (simples)
  if (!email.includes('@') || !email.includes('.')) {
      displayInputError('email_recuperacao', 'Email invalido.');
      return;
  }

  if (novaSenha !== confirmarSenha) {
    displayInputError('confirmar-senha_recuperacao', 'As novas senhas nao coincidem!');
    displayInputError('nova-senha_recuperacao', 'As senhas nao coincidem!'); // Mensagem tambem na nova senha
    return;
  }

  if (novaSenha.length < 6) {
    displayInputError('nova-senha_recuperacao', 'A nova senha deve ter pelo menos 6 caracteres!');
    return;
  }

  const data = { email, novaSenha };
  
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // ATENCAO: Ajuste esta URL conforme o ambiente:
  // Para TESTE LOCAL: 'http://localhost:5000/api/reset-password'
  // Para PRODUCAO (Render): 'https://painel-despesas.onrender.com/api/reset-password'
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const backendURL = 'https://painel-despesas.onrender.com/api/reset-password'; // Mude para http://localhost:5000 para teste local

  try {
    const response = await fetch(backendURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) { // Se o status for 2xx (sucesso)
      displayMessage('success', 'Senha alterada com sucesso! Voce ja pode logar com a nova senha.');
      // Opcional: Redirecionar apos um pequeno delay para o usuario ler a mensagem
      setTimeout(() => {
          window.location.href = 'login.html'; 
      }, 2000); // Redireciona apos 2 segundos
    } else {
      displayMessage('error', `Erro ao alterar senha: ${result.message || 'Ocorreu um erro desconhecido.'}`);
      console.error('Erro ao alterar senha:', result);
    }
  } catch (error) {
    displayMessage('error', 'Nao foi possivel conectar ao servidor. Verifique sua conexao ou tente novamente mais tarde.');
    console.error('Erro de conexao:', error);
  }
});
