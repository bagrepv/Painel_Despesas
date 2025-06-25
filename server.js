import express from 'express';
import cors from 'cors';
import db from './db.js'; // Módulo de conexão com o banco de dados
import bcrypt from 'bcrypt'; // Para hash e comparação de senhas

const app = express();

// Middlewares
// Permite requisições de diferentes origens (essencial para frontend/backend em domínios diferentes)
app.use(cors()); 
// Habilita o Express a parsear JSON do corpo das requisições (req.body)
app.use(express.json());

// =============================================
// Rotas da API
// =============================================

// Rota de Login de Usuário
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body; // Pega email e senha do corpo da requisição

        // 1. Busca o usuário pelo email no banco de dados.
        //    IMPORTANTE: Usa placeholder '?' para PREVENIR SQL INJECTION.
        //    Retorna a senha hasheada para comparação.
        const [users] = await db.query(`
            SELECT id, nome, email, senha FROM usuarios WHERE email = ?
        `, [email]); // O array '[email]' passa o valor para o placeholder

        const user = users[0]; // Pega o primeiro (e único) usuário encontrado

        // 2. Verifica se o usuário foi encontrado
        if (!user) {
            // Se o usuário não existe, retorna erro 401 (Não Autorizado)
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // 3. Compara a senha fornecida (texto puro) com a senha hasheada do banco.
        //    Utiliza bcrypt.compare() que é a forma CORRETA de comparar senhas hasheadas.
        const passwordMatch = await bcrypt.compare(password, user.senha);

        if (!passwordMatch) {
            // Se as senhas não coincidem, retorna erro 401
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // 4. Se chegou aqui, o login foi bem-sucedido.
        //    Remove a senha do objeto do usuário antes de enviar para o frontend por segurança.
        const { senha, ...userData } = user; 
        res.json(userData); // Retorna os dados do usuário (sem a senha)

    } catch (error) {
        // Captura qualquer erro que ocorra durante o processo (DB, bcrypt, etc.)
        console.error('Erro no login:', error);
        // Retorna erro 500 (Erro Interno do Servidor) para o frontend
        res.status(500).json({ message: 'Ocorreu um erro ao tentar logar.' });
    }
});

// Rota de Cadastro de Novo Usuário (Primeiro Acesso)
app.post('/api/sign-up', async (req, res) => {
    try {
        const {
            nome,
            cpf,
            senha,
            email,
            telefone,
            orgao,
            setor,
            cargo,
        } = req.body; // Pega todos os dados do corpo da requisição

        // 1. Hashea a senha usando bcrypt para armazenar de forma segura.
        const hashSenha = await bcrypt.hash(senha, 10); // 10 é o saltRounds (complexidade do hash)

        // 2. Opcional, mas RECOMENDADO: Verifica se o e-mail já existe no banco
        const [existingUsers] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            // Se o e-mail já existe, retorna erro 409 (Conflito)
            return res.status(409).json({ message: 'E-mail já cadastrado. Tente outro.' });
        }

        // 3. Insere o novo usuário no banco de dados.
        //    IMPORTANTE: Usa placeholders '?' para PREVENIR SQL INJECTION.
        //    Os valores são passados como um array separado.
        await db.query(`
            INSERT INTO usuarios (
                nome,
                cpf,
                email,
                telefone,
                orgao,
                setor,
                cargo,
                senha
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            nome,
            cpf,
            email,
            telefone,
            orgao,
            setor,
            cargo,
            hashSenha // Salva a senha hasheada
        ]);

        // 4. Retorna uma mensagem de sucesso para o frontend
        //    Status 201 (Created) é o padrão para criação de recursos.
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

    } catch (error) {
        // Captura qualquer erro que ocorra durante o processo (DB, bcrypt, etc.)
        console.error('Erro no cadastro:', error);
        // Retorna erro 500 (Erro Interno do Servidor) para o frontend
        res.status(500).json({ message: 'Ocorreu um erro ao tentar cadastrar o usuário.' });
    }
});

// =============================================
// Inicialização do Servidor
// =============================================
// Define a porta: usa a variável de ambiente PORT (para Render) ou 5000 (para local)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

