import express from 'express'
import cors from 'cors';
import db from './db.js'
import bcrypt from 'bcrypt';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.post('/api/login', async (req, res) => {
    const user = await db.query(`
      select id, nome, email from usuarios
      where email = '${req.body.email}' AND senha = '${req.body.password}'
    `)

  const userExists = user[0].length;

  if (!userExists) throw new Error('Usuário não cadastrado!')
    
  res.json(user[0][0]);
});

app.post('/api/sign-up', async (req, res) => {
  const {
      nome,
      cpf,
      senha,
      email,
      telefone,
      orgao,
      setor,
      cargo,
  } = req.body;

  const hashSenha = await bcrypt.hash(senha, 10);

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
      VALUES (
        "${nome}",
        "${cpf}",
        "${email}",
        "${telefone}",
        "${orgao}",
        "${setor}",
        "${cargo}",
        "${hashSenha}"
      )
  `)

  res.json(req.body)
})

// Porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
