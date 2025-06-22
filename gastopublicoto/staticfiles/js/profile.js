$(document).ready(function(){
    $('#cpf').mask('999.999.999-99');
    $('#phone').mask('(99) 99999-9999');
});

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');

    // Função para alternar entre os temas claro e escuro
    function toggleDarkMode() {
        body.classList.toggle('dark-mode-variables');
        darkModeToggle.querySelectorAll('span').forEach(span => span.classList.toggle('active'));
        profileForm.classList.toggle('dark-mode');
        passwordForm.classList.toggle('dark-mode');
    }

    // Adiciona o evento de clique ao botão de alternância de modo claro/escuro
    darkModeToggle.addEventListener('click', toggleDarkMode);
});