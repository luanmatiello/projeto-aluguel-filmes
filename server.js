const express = require('express'); // framework pra rodar o servidor
const sqlite3 = require('sqlite3').verbose(); // banco de dados que vamos usar na atividade
const bodyParser = require('body-parser'); // pra conseguir pegar os dados enviados pelo form HTML
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração pro express entender os dados do POST (do formulário)
app.use(bodyParser.urlencoded({ extended: true }));

// Define a pasta 'public' como a raiz pros arquivos estáticos (CSS, imagens e os HTMLs do front)
app.use(express.static('public'));

// Rota principal: carrega o index.html quando entra no site
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Criando a conexão com o arquivo do banco de dados (conforme pedido na atividade)
const db = new sqlite3.Database('dados.db');

// Cria a tabela de alunos logo que o servidor inicia, caso ela ainda não exista
db.run(`
CREATE TABLE IF NOT EXISTS alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  email TEXT
)
`);

// ------------------------------------------------------------------
// ROTA DE CADASTRO (INSERÇÃO)
// ------------------------------------------------------------------
app.post('/cadastrar', (req, res) => {
  const { nome, email } = req.body; // pega o que foi digitado lá no form do orcamento.html

  // Insere os dados no banco
  db.run(
    'INSERT INTO alunos (nome, email) VALUES (?, ?)',
    [nome, email],
    function (err) {
      if (err) {
        return res.send('Erro ao cadastrar aluno');
      }

      // Mensagem de sucesso simples mantendo as cores do site, com link pra voltar
      res.send(`
        <h1 style="color: white; background: #111; font-family: Arial; text-align:center;">Cadastro realizado com sucesso!</h1>
        <div style="text-align: center;"><a href="/" style="color: red;">Voltar para o site</a></div>
      `);
    }
  );
});

// ------------------------------------------------------------------
// ROTA DE CONSULTA (LISTAGEM)
// ------------------------------------------------------------------
// O fetch do nosso front-end chama essa rota pra montar a tabela dinamicamente
app.get('/api/alunos', (req, res) => {
  db.all('SELECT * FROM alunos', [], (err, rows) => {
    if (err) {
      return res.status(500).send('Erro ao buscar alunos');
    }
    res.json(rows); // devolve os dados em JSON pro front ler e criar as linhas
  });
});

// ------------------------------------------------------------------
// ROTA DE DELEÇÃO (EXCLUSÃO)
// ------------------------------------------------------------------
// Recebe o ID do aluno pela URL e apaga do banco
app.delete('/api/alunos/:id', (req, res) => {
  const id = req.params.id; // pega o ID que veio na requisição

  db.run('DELETE FROM alunos WHERE id = ?', id, function (err) {
    if (err) {
      return res.status(500).send('Erro ao excluir aluno');
    }
    res.send('Aluno excluído com sucesso');
  });
});

// Liga o servidor
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});
