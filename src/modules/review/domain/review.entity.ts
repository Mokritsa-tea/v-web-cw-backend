import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/domain/user.entity';
import { Anime } from '../../anime/domain/anime.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  rating!: number; // 1–10

  @Column({ type: 'text', nullable: true })
  text?: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Anime)
  anime!: Anime;
}
