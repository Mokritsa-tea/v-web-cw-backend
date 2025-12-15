import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/domain/user.entity';
import { Anime } from '../../anime/domain/anime.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Anime)
  anime!: Anime;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  text?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
