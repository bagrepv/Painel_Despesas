// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definição do esquema (schema) do usuário
const UserSchema = new mongoose.Schema({
    nome: { 
        type: String, 
        required: [true, 'O nome é obrigatório'] 
    },
    cpf: { 
        type: String, 
        required: [true, 'O CPF é obrigatório'],
        unique: true,
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'O e-mail é obrigatório'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'E-mail inválido']
    },
    telefone: {
        type: String,
        trim: true
    },
    orgao: { 
        type: String, 
        required: [true, 'O órgão é obrigatório'] 
    },
    setor: { 
        type: String, 
        required: [true, 'O setor é obrigatório'] 
    },
    cargo: { 
        type: String, 
        required: [true, 'O cargo é obrigatório'] 
    },
    password: { 
        type: String, 
        required: [true, 'A senha é obrigatória'],
        minlength: [6, 'A senha deve ter no mínimo 6 caracteres'],
        select: false // Não retorna a senha em consultas
    },
    primeiroAcesso: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Middleware para criptografar a senha antes de salvar
UserSchema.pre('save', async function(next) {
    // Só criptografa se a senha foi modificada
    if (!this.isModified('password')) return next();
    
    try {
        // Gera o hash da senha
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Método para comparar senhas (usado no login)
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Exporta o modelo
module.exports = mongoose.model('User', UserSchema);