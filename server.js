import express from 'express';
import cors from 'cors';
import db from './db.js'; // Módulo de conexão com o banco de dados
import bcrypt from 'bcrypt'; // Para hash e comparação de senhas
import path from 'path'; // Módulo nativo do Node.js para lidar com caminhos de arquivos
import { fileURLToPath } from 'url'; // Para resolver __dirname em módulos ES

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json());

// =========================================================
// NOVO: SERVIR ARQUIVOS ESTÁTICOS DO FRONTEND
// =========================================================

// __dirname não está disponível diretamente com 'import', então precisamos calculá-lo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// O Express servirá arquivos estáticos da pasta 'public'.
// Certifique-se de que seus arquivos login.html, primeiro_acesso.html, index.html,
// style.css, login.css, primeiro_acesso.css, script.js, e suas imagens/PDFs
// estejam DENTRO de uma pasta chamada 'public' na raiz do seu projeto.
app.use(express.static(path.join(__dirname, 'public')));

// =========================================================
// Rotas da API
// =========================================================

// Rota de Login de Usuário
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query(`
            SELECT id, nome, email, senha FROM usuarios WHERE email = ?
        `, [email]);

        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.senha);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        const { senha, ...userData } = user; 
        res.json(userData);

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao tentar logar.' });
    }
});

// Rota de Cadastro de Novo Usuário (Primeiro Acesso)
app.post('/api/sign-up', async (req, res) => {
    try {
        const {
            nome, cpf, senha, email, telefone, orgao, setor, cargo,
        } = req.body;

        const hashSenha = await bcrypt.hash(senha, 10);

        const [existingUsers] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'E-mail já cadastrado. Tente outro.' });
        }

        await db.query(`
            INSERT INTO usuarios (nome, cpf, email, telefone, orgao, setor, cargo, senha)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            nome, cpf, email, telefone, orgao, setor, cargo, hashSenha
        ]);

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao tentar cadastrar o usuário.' });
    }
});

// NOVO: Rota para Alteracao/Redefinicao de Senha
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, novaSenha } = req.body;

        // 1. Verificar se o usuario existe pelo email
        const [users] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'E-mail nao encontrado.' });
        }

        // 2. Hashear a nova senha
        const hashNovaSenha = await bcrypt.hash(novaSenha, 10);

        // 3. Atualizar a senha no banco de dados
        //    IMPORTANTE: Sempre use WHERE para evitar atualizar todos os usuarios!
        await db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hashNovaSenha, user.id]);

        res.json({ message: 'Senha atualizada com sucesso!' });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao redefinir a senha.' });
    }
});


// =========================================================
// ROTA PARA SERVIR O ARQUIVO HTML PRINCIPAL (se necessário)
// Geralmente, o express.static já resolve para /
// Mas se o Render não encontra a raiz ou se você quer uma landing page específica
// descomente esta rota. Seus HTMLs já devem estar na pasta 'public'.
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });
// =========================================================

// Porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
