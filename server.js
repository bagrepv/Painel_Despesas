import express from 'express';
import cors from 'cors';
import db from './db.js'; 
import bcrypt from 'bcrypt'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import nodemailer from 'nodemailer'; 
import dotenv from 'dotenv'; 

// Carrega as variaveis de ambiente do .env (apenas para desenvolvimento local)
// Em producao (Render), as variaveis sao injetadas diretamente pelo ambiente.
dotenv.config(); 

const app = express();

// Middlewares
// Permite requisicoes de diferentes origens (essencial para frontend/backend em dominios diferentes)
app.use(cors()); 
// Habilita o Express a parsear JSON do corpo das requisicoes (req.body)
app.use(express.json());

// =============================================
// Configuracao para Servir Arquivos Estaticos (Frontend)
// =============================================
// __dirname nao esta disponivel diretamente com 'import', entao precisamos calcula-lo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// O Express servira arquivos estaticos da pasta 'public'.
// Certifique-se de que todos os seus arquivos de frontend (HTML, CSS, JS, imagens, PDFs)
// estejam DENTRO de uma pasta chamada 'public' na raiz do seu projeto.
app.use(express.static(path.join(__dirname, 'public')));

const transporter = nodemailer.createTransport({
    service: 'gmail', // Ex: 'gmail', 'outlook', 'hotmail', ou configuracao SMTP personalizada
    auth: {
        user: process.env.EMAIL_USER, // Seu email de envio (configurado nas variaveis de ambiente do Render)
        pass: process.env.EMAIL_PASS  // Sua senha de aplicacao/app password (configurado nas variaveis de ambiente do Render)
    }
});

// Email do administrador para receber notificacoes de novas solicitacoes de acesso
const ADMIN_EMAIL = 'coradojoquebede@gmail.com'; // NOVO: Defina o email do administrador aqui

// Rota de Login de Usuario
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Seleciona o usuario, incluindo o status para verificacao de ativacao
        const [users] = await db.query(`
            SELECT id, nome, email, senha, status FROM usuarios WHERE email = ?
        `, [email]); 

        const user = users[0];

        // Se o usuario nao foi encontrado
        if (!user) {
            return res.status(401).json({ message: 'E-mail ou senha invalidos.' });
        }
        // Se a conta do usuario nao esta ativa (pendente de aprovacao)
        if (user.status !== 'ativo') {
            return res.status(403).json({ message: 'Sua conta ainda nao foi ativada. Verifique seu email ou aguarde aprovacao.' });
        }

        // Compara a senha fornecida com a senha hasheada do banco de dados
        const passwordMatch = await bcrypt.compare(password, user.senha);

        // Se as senhas nao coincidem
        if (!passwordMatch) {
            return res.status(401).json({ message: 'E-mail ou senha invalidos.' });
        }

        // Se o login for bem-sucedido, remove a senha do objeto do usuario antes de enviar para o frontend por seguranca
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

        // Hashea a senha antes de salvar no banco de dados
        const hashSenha = await bcrypt.hash(senha, 10);

        // Verifica se o email ja esta cadastrado para evitar duplicidade
        const [existingUsers] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'E-mail ja cadastrado. Tente outro.' });
        }

        // Salva o novo usuario no banco de dados com status 'pendente'
        await db.query(`
            INSERT INTO usuarios (nome, cpf, email, telefone, orgao, setor, cargo, senha, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente')
        `, [
            nome, cpf, email, telefone, orgao, setor, cargo, hashSenha
        ]);

        // Envia email de notificacao para o administrador sobre a nova solicitacao de acesso
        const mailOptions = {
            from: process.env.EMAIL_USER, // Email configurado nas variaveis de ambiente
            to: ADMIN_EMAIL, // Email do administrador definido acima
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
                <p>Link de Aprovacao: <a href="https://gastopublicoto.com.br/admin/aprovar-usuario?email=${email}">Aprovar Usuario</a></p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar email de notificacao:', error);
            } else {
                console.log('Email de notificacao enviado:', info.response);
            }
        });

        // Responde ao frontend que a solicitacao foi enviada e esta aguardando aprovacao
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

        // Verifica se o usuario existe pelo email
        const [users] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'E-mail nao encontrado.' });
        }

        // Hashea a nova senha antes de atualizar no banco de dados
        const hashNovaSenha = await bcrypt.hash(novaSenha, 10);

        // Atualiza a senha do usuario no banco de dados
        await db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hashNovaSenha, user.id]);

        res.json({ message: 'Senha atualizada com sucesso!' });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao redefinir a senha.' });
    }
});

// =============================================
// NOVO: Rota para Aprovar Usuario (via link do email de notificacao)
// =============================================
app.get('/admin/aprovar-usuario', async (req, res) => {
    try {
        const { email } = req.query; // Pega o email do usuario a ser aprovado dos parametros da URL

        // Verifica se o email foi fornecido na URL
        if (!email) {
            return res.status(400).send('Email do usuario nao fornecido para aprovacao.');
        }

        // Atualiza o status do usuario para 'ativo' no banco de dados
        const [result] = await db.query('UPDATE usuarios SET status = ? WHERE email = ?', ['ativo', email]);

        // Se nenhum registro foi afetado, o usuario nao foi encontrado ou ja estava ativo
        if (result.affectedRows === 0) {
            return res.status(404).send('Usuario nao encontrado ou ja esta ativo.');
        }

        // Responde com uma pagina HTML simples de confirmacao para o navegador do administrador
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Aprovacao de Usuario</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; margin: 0; }
                    .container { background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
                    h1 { color: #28a745; margin-bottom: 20px; }
                    p { color: #555; margin-bottom: 20px; }
                    a { color: #007bff; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Usuario Aprovado com Sucesso!</h1>
                    <p>A conta para o email <strong>${email}</strong> foi ativada.</p>
                    <p>O usuario ja pode fazer login no sistema.</p>
                    <p><a href="https://gastopublicoto.com.br/login.html">Ir para a pagina de Login</a></p>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('Erro ao aprovar usuario:', error);
        res.status(500).send('Ocorreu um erro ao aprovar o usuario.');
    }
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
