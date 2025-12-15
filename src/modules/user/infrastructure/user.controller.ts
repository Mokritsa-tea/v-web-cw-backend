import { Router } from 'express';
import { UserService } from '../application/user.service';

const router = Router();
const userService = new UserService();

// Получить всех пользователей
router.get('/', async (_, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
});

// Создать нового пользователя
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.createUser(email, password);
  res.status(201).json(user);
});

// Получить пользователя по id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await userService.getUserById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;
