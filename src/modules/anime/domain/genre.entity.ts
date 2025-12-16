import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Anime } from './anime.entity';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  russian?: string;

  @ManyToMany(() => Anime, (anime) => anime.genres, { onDelete: 'CASCADE' })
  anime!: Anime[];
}
