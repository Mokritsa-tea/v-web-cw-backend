import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('anime')
export class Anime {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  shikimoriId!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  posterUrl?: string;

  @Column({ type: 'float', nullable: true })
  score?: number;
}
