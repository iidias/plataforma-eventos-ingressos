import bcrypt from 'bcryptjs';

// Ponto único de hashing de senha, compartilhado entre seed, cadastro e
// geração da credencial de portaria. O custo 10 é o mesmo que o seed já
// usava, então as senhas existentes continuam validando normalmente.
const SALT_ROUNDS = 10;

export function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}
