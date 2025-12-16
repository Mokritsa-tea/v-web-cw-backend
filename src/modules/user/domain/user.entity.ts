import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

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

  @CreateDateColumn()
  createdAt!: Date;
}
