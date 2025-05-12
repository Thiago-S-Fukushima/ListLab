// Criando o arquivo do servidor
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

app.use(express.json()); // Para lidar com JSON em requisições POST/PUT

app.use(express.static(path.join(__dirname + '/ListLab/HTML')));



// Use o bodyParser apenas para POST/PUT

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'seu-segredo',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    }
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thiago@123',
    database: 'Tarefas'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados!');
});

app.get('/', (req, res) => {
    res.send('servidor está funcionando!');
});

// Rota para cadastro de usuario.
app.post('/register', (req, res) => {
    const { username, senha } = req.body;

    if (!username || !senha) {
        return res.status(400).send('Usuário e senha são obrigatórios.');
    }

    console.log(`Registrando usuário: ${username}`); // Log para depuração

    bcrypt.hash(senha, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Erro ao criptografar a senha:', err);
            return res.status(500).send('Erro interno ao criptografar a senha.');
        }

        const query = 'INSERT INTO usuarios (username, senha) VALUES (?, ?)';
        db.query(query, [username, hashedPassword], (err, result) => {
            if (err) {
                console.error('Erro ao inserir no banco:', err);
                return res.status(500).send('Erro ao registrar usuário.');
            }

            console.log('Usuário registrado com sucesso!'); // Log para depuração
            res.send('Usuário registrado com sucesso!');
        });
    });
});


// Rota de login.
app.get('/login', (req, res) => {
    res.send('Login page');
});


app.post('/login', (req, res) => {
    const { username, senha } = req.body;

    db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, result) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).send('Erro interno no servidor.');
        }
        if (result.length === 0) {
            return res.status(401).send('Usuário não encontrado.');
        }

        const usuario = result[0];
        bcrypt.compare(senha, usuario.senha, (err, result) => {
            if (err) return res.status(500).send('Erro ao verificar senha.');
            if (!result) return res.status(401).send('Senha incorreta.');

            req.session.userId = usuario.id;

            console.log('sessão criada:', req.session);
            res.send('Login bem sucedido!');
        });
    });
});

// Oculta erro de favicon.ico no console
app.get('/favicon.ico', (req, res) => res.status(204));


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
})

// Rota para adicionar tarefas.
app.post('/task', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Você precisa estar logado para adicionar tarefas.');
    }

    const { descricao } = req.body;
    const userId = req.session.userId;

    const query = 'INSERT INTO task (user_id, descricao, done) VALUES (?, ?, ?)';
    db.query(query, [userId, descricao, false], (err, result) => {
        if (err) throw err;
        res.send('Tarefa criada com sucesso!');
    });
});

// Rota para listar tarefas do usuario logado.

app.get('/task', (req, res) => {
    const userId = req.session.userId;
    if (!req.session.userId) {
        return res.status(401).send('Você precisa estar logado para ver suas tarefas.');
    }

    
    const query = 'SELECT * FROM task WHERE user_id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Erro ao buscar tarefas:', err);
            return res.status(500).send('Erro ao buscar tarefas.');
        }
        res.json(result);
    });
});

//Add logout
app.post ('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Erro ao deslogar');
        res.send('Logout realizado com sucesso');
    });
});

// Atualizar status da tarefa (concluir ou desmarcar)
app.put('/task/:id', (req, res) => {
    const { id } = req.params;
    const { done } = req.body;

    if (!req.session.userId) {
        return res.status(401).send('Você precisa estar logado para atualizar tarefas.');
    }

    const query = 'UPDATE task SET done = ? WHERE id = ? AND user_id = ?';
    db.query(query, [done, id, req.session.userId], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar tarefa:', err);
            return res.status(500).send('Erro ao atualizar tarefa.');
        }
        res.send('Tarefa atualizada com sucesso!');
    });
});

// Deletar uma tarefa
app.delete('/task/:id', (req, res) => {
    const { id } = req.params;

    if (!req.session.userId) {
        return res.status(401).send('Você precisa estar logado para excluir tarefas.');
    }

    const query = 'DELETE FROM task WHERE id = ? AND user_id = ?';
    db.query(query, [id, req.session.userId], (err, result) => {
        if (err) {
            console.error('Erro ao excluir tarefa:', err);
            return res.status(500).send('Erro ao excluir tarefa.');
        }
        res.send('Tarefa excluída com sucesso!');
    });
});
