import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Genre } from './genre.entity';
import { Review } from '../../review/domain/review.entity';

@Entity()
export class Anime {
  @OneToMany(() => Review, (review) => review.anime)
  reviews!: Review[];

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  shikimoriId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  posterUrl?: string;

  @Column({ type: 'float', default: 0 })
  ratingAvg!: number;

  @Column({ default: 0 })
  episodes!: number;

  @Column()
  status!: string;

  @ManyToMany(() => Genre, { cascade: true })
  @JoinTable()
  genres!: Genre[];
}
