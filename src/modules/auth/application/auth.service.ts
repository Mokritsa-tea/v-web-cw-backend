import { AppDataSource } from '../../../shared/database/data-source';
import { User } from '../../user/domain/user.entity';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async register(email: string, password: string) {
    const exists = await this.userRepo.findOneBy({ email });
    if (exists) throw new Error('User already exists');
    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, passwordHash: hashed });
    return this.userRepo.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid password');

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
  }
}
