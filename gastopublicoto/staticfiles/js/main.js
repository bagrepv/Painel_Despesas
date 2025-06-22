document.addEventListener('DOMContentLoaded', () => {
    const sideMenu = document.querySelector('aside');
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const darkMode = document.querySelector('.dark-mode');
    const logoImage = document.querySelector('.logo img');
    const body = document.body;
        const footer = document.querySelector('footer');

    menuBtn.addEventListener('click', () => {
        sideMenu.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        sideMenu.style.display = 'none';
    });

    darkMode.addEventListener('click', () => {
        body.classList.toggle('dark-mode-variables');
        darkMode.querySelectorAll('span').forEach(span => span.classList.toggle('active'));
        footer.classList.toggle('dark-mode'); // Adicione esta linha

        // Altera dinamicamente a imagem da logo com base no modo claro/escuro
        const isDarkMode = body.classList.contains('dark-mode-variables');
        logoImage.src = isDarkMode ? '../../static/img/LogoDGGP3.png' : '../../static/img/LogoDGGP3Black.png';
    });

    // Adicione aqui outras partes do seu código JavaScript, se necessário.
});