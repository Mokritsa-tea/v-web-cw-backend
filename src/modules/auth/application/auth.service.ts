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
    console.log('Auth attempt for email:', email);
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      console.log('User not found');
      throw new Error('User not found');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.log('Invalid password');
      throw new Error('Invalid password');
    }

    console.log('User authenticated successfully');
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated token:', token);
    return { user, token };
  }
}
