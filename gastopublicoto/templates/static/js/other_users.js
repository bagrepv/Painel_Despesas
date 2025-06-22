const users = [
    { id: 1, username: "user1", firstName: "John", lastName: "Doe", email: "john@example.com", department: "TI" },
    { id: 2, username: "user2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", department: "RH" },
    // Adicione mais dados de usuários conforme necessário
];

const userTable = document.getElementById("user-table");

// Função para criar a tabela de usuários
function createTable() {
    userTable.innerHTML = ""; // Limpa a tabela antes de recriá-la

    for (const user of users) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.department}</td>
            <td class="action-buttons">
                <span class="edit-button" data-id="${user.id}" onclick="editUser(${user.id})">Editar</span>
                <span class="delete-button" data-id="${user.id}" onclick="deleteUser(${user.id})">Excluir</span>
            </td>
        `;
        userTable.appendChild(row);
    }
}

// Função para editar um usuário (exemplo)
function editUser(userId) {
    // Aqui você pode implementar a lógica para editar um usuário
    alert(`Editar usuário com ID ${userId}`);
}

// Função para excluir um usuário (exemplo)
function deleteUser(userId) {
    // Aqui você pode implementar a lógica para excluir um usuário
    alert(`Excluir usuário com ID ${userId}`);
}

// Chame a função para criar a tabela quando a página carregar
createTable();