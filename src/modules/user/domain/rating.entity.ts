import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';
import { Anime } from '../../anime/domain/anime.entity';

@Entity()
export class Rating {
  @PrimaryColumn()
  userId!: number;

  @PrimaryColumn()
  animeId!: number;

  @Column()
  score!: number;

  @ManyToOne(() => User, user => user.id)
  user!: User;

  @ManyToOne(() => Anime)
  @JoinColumn()
  anime!: Anime;
}
