import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Anime } from '../../anime/domain/anime.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @Column()
  passwordHash!: string;

  @Column({ default: 'user' })
  role!: string;

  @ManyToMany(() => Anime)
  @JoinTable()
  favorites!: Anime[];

  @OneToMany(() => Anime, (anime) => anime.id)
  ratings!: { animeId: number; score: number }[];

  @CreateDateColumn()
  createdAt!: Date;
}
