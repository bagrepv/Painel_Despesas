
document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
e.preventDefault(); 

  const email = document.getElementById('email_recuperacao').value;
  const novaSenha = document.getElementById('nova-senha_recuperacao').value;
  const confirmarSenha = document.getElementById('confirmar-senha_recuperacao').value;

  if (novaSenha !== confirmarSenha) {
    alert('As novas senhas nao coincidem!');
    return;
  }

  if (novaSenha.length < 6) {
    alert('A nova senha deve ter pelo menos 6 caracteres!');
    return;
  }

  const data = { email, novaSenha };
  
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // ATENCAO: Para TESTE LOCAL, use 'http://localhost:5000/api/reset-password'
  // LEMBRE-SE DE MUDAR DE VOLTA PARA A URL DO RENDER ANTES DE FAZER O PUSH PARA O GITHUB!
  //const backendURL = 'https://painel-despesas.onrender.com/api/reset-password'; 

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

    if (response.ok) { // Se o status for 2xx
      alert('Senha alterada com sucesso! Voce ja pode logar com a nova senha.');
      window.location.href = 'login.html'; // Redireciona para a pagina de login
    } else {
      alert(`Erro ao alterar senha: ${result.message || 'Ocorreu um erro desconhecido.'}`);
      console.error('Erro ao alterar senha:', result);
    }
  } catch (error) {
    alert('Nao foi possivel conectar ao servidor. Tente novamente mais tarde.');
    console.error('Erro de conexao:', error);
  }
});
