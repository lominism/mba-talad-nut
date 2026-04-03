import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Item } from '../../items/entities/item.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  firebaseUid: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  department: string;

  @Column({ nullable: true })
  photoUrl: string;

  // A user can post many items to sell
  @OneToMany(() => Item, (item) => item.seller)
  items: Item[];

  // A user can reserve many items
  @OneToMany(() => Item, (item) => item.reservedBy)
  reservedItems: Item[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date; // Enables "Soft Delete"
}
