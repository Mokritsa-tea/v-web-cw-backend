import { AppDataSource } from '../../../shared/database/data-source';
import { User } from '../domain/user.entity';
import bcrypt from 'bcrypt';

export class UserService {
  private userRepo = AppDataSource.getRepository(User);

  async createUser(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, passwordHash: hashed });
    return this.userRepo.save(user);
  }

  async getAllUsers() {
    return this.userRepo.find();
  }

  async getUserById(id: number) {
    return this.userRepo.findOneBy({ id });
  }
}
