import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();

// Permitir múltiplas origens
const allowedOrigins = [
  'https://diegoww12a.github.io',
  'https://franca-dashboard.netlify.app/'
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // para ferramentas como Postman
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'O CORS não permite esta origem';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

// hash da senha
const PASSWORD_HASH = '$2b$10$qaGbujCq83U2wIHuj5w/Cu9yx1oRkb66HXNF1gKyJLyd7NP2wFaVm';

app.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Senha obrigatória' });
  const ok = await bcrypt.compare(password, PASSWORD_HASH);
  if (!ok) return res.status(401).json({ error: 'Senha incorreta' });
  return res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Backend rodando na porta ' + PORT);
});
