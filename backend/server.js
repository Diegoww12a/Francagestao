import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
app.use(express.json());

// hash da senha "france2024"
const PASSWORD_HASH = '$2b$10$1PniIGPYIqjc1nKBiMFkq.NmsXxEhScGFDhCVLIjtwmH/yRW6rFhi';


app.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Senha obrigatória' });
  }

  const ok = await bcrypt.compare(password, PASSWORD_HASH);

  if (!ok) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  return res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Backend rodando na porta 3000');
});
