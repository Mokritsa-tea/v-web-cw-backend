import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Anime } from '../../anime/domain/anime.entity';

@Entity()
export class Favorite {
  @PrimaryColumn()
  userId!: number;

  @PrimaryColumn()
  animeId!: number;

  @ManyToOne(() => User, user => user.id)
  user!: User;

  @ManyToOne(() => Anime)
  @JoinColumn()
  anime!: Anime;
}
