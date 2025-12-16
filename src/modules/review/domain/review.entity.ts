import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user/domain/user.entity';
import { Anime } from '../../anime/domain/anime.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'int' })
  animeId!: number;

  @Column({ type: 'int' })
  rating!: number; // 1–10

  @Column({ type: 'text', nullable: true })
  text?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Anime)
  @JoinColumn({ name: 'animeId' })
  anime!: Anime;
}
