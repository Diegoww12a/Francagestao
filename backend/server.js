import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();

// Permite apenas o seu frontend do GitHub Pages
app.use(cors({
  origin: 'https://diegoww12a.github.io'
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

// hash da senha
const PASSWORD_HASH = '$2b$10$qaGbujCq83U2wIHuj5w/Cu9yx1oRkb66HXNF1gKyJLyd7NP2wFaVm';

app.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) return res.status(400).json({ error: 'Senha obrigatória' });

  const ok = await bcrypt.compare(password, PASSWORD_HASH);

  if (!ok) return res.status(401).json({ error: 'Senha incorreta' });

  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log('Backend rodando na porta ' + PORT);
});
