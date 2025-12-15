import bcrypt from 'bcrypt';

const hash = await bcrypt.hash('francagestao2025', 10);
console.log(hash);
