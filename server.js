import express from 'express';
import cors from 'cors';
import db from './db.js'; // Módulo de conexão com o banco de dados
import bcrypt from 'bcrypt'; // Para hash e comparação de senhas
import path from 'path'; // Módulo nativo do Node.js para lidar com caminhos de arquivos
import { fileURLToPath } from 'url'; // Para resolver __dirname em módulos ES
import nodemailer from 'nodemailer'; // NOVO: Importa Nodemailer
import dotenv from 'dotenv'; // NOVO: Para carregar variaveis de ambiente de .env (apenas para desenvolvimento local)

dotenv.config(); // Carrega as variaveis de ambiente do .env (apenas para desenvolvimento local)

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json());

// Configuracao para servir arquivos estaticos (Frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// Configuracao do Nodemailer
// =============================================
// Use as variaveis de ambiente para as credenciais do email
const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou 'outlook', 'hotmail', ou configuracao SMTP personalizada
    auth: {
        user: process.env.EMAIL_USER, // Seu email de envio (configurado nas variaveis de ambiente do Render)
        pass: process.env.EMAIL_PASS  // Sua senha de aplicacao/app password (configurado nas variaveis de ambiente do Render)
    }
});

// Email do administrador para receber notificacoes
const ADMIN_EMAIL = 'pvmatos89@gmail.com'; // NOVO: Defina o email do administrador aqui

// =============================================
// Rotas da API
// =============================================

// Rota de Login de Usuario
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // NOVO: Seleciona tambem o status do usuario
        const [users] = await db.query(`
            SELECT id, nome, email, senha, status FROM usuarios WHERE email = ?
        `, [email]); 

        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'E-mail ou senha invalidos.' });
        }
        // NOVO: Verifica se o usuario esta ativo
        if (user.status !== 'ativo') {
            return res.status(403).json({ message: 'Sua conta ainda nao foi ativada. Verifique seu email ou aguarde aprovacao.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.senha);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'E-mail ou senha invalidos.' });
        }

        const { senha, ...userData } = user; 
        res.json(userData);

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao tentar logar.' });
    }
});

// Rota de Cadastro de Novo Usuario (Primeiro Acesso)
app.post('/api/sign-up', async (req, res) => {
    try {
        const {
            nome, cpf, senha, email, telefone, orgao, setor, cargo,
        } = req.body;

        const hashSenha = await bcrypt.hash(senha, 10);

        const [existingUsers] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'E-mail ja cadastrado. Tente outro.' });
        }

        // Salva o usuario com status 'pendente'
        await db.query(`
            INSERT INTO usuarios (nome, cpf, email, telefone, orgao, setor, cargo, senha, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente')
        `, [
            nome, cpf, email, telefone, orgao, setor, cargo, hashSenha
        ]);

        // NOVO: Envia email para o administrador
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: ADMIN_EMAIL,
            subject: 'Nova solicitacao de acesso ao Painel DIGAP',
            html: `
                <p>Uma nova solicitacao de acesso foi recebida:</p>
                <ul>
                    <li><strong>Nome:</strong> ${nome}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>CPF:</strong> ${cpf}</li>
                    <li><strong>Telefone:</strong> ${telefone || 'Nao informado'}</li>
                    <li><strong>Orgao:</strong> ${orgao}</li>
                    <li><strong>Setor:</strong> ${setor}</li>
                    <li><strong>Cargo:</strong> ${cargo}</li>
                </ul>
                <p>Por favor, acesse o painel de administracao para aprovar ou rejeitar este usuario.</p>
                <p>Link de Aprovacao (Exemplo - precisa ser implementado): <a href="https://gastopublicoto.com.br/admin/aprovar-usuario?email=${email}">Aprovar Usuario</a></p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar email de notificacao:', error);
            } else {
                console.log('Email de notificacao enviado:', info.response);
            }
        });

        res.status(201).json({ message: 'Sua solicitacao de acesso foi enviada e esta aguardando aprovacao.' });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao tentar cadastrar o usuario.' });
    }
});

// Rota para Alteracao/Redefinicao de Senha
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, novaSenha } = req.body;

        const [users] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'E-mail nao encontrado.' });
        }

        const hashNovaSenha = await bcrypt.hash(novaSenha, 10);

        await db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hashNovaSenha, user.id]);

        res.json({ message: 'Senha atualizada com sucesso!' });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao redefinir a senha.' });
    }
});

// Porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
