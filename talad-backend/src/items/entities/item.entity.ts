import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  // Best practice: Store price as a decimal or integer representing cents to avoid floating point math errors
  @Column('decimal', { precision: 10, scale: 2 })
  price: number; 

  @Column("text", { array: true, nullable: true })
  photoUrls: string[];

  @Column({ default: 'Used' })
  quality: string;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.AVAILABLE,
  })
  status: ItemStatus;

  // Relationship: Who is selling the item?
  @ManyToOne(() => User, (user) => user.items, { nullable: false })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  // Relationship: Who reserved the item?
  @ManyToOne(() => User, (user) => user.reservedItems, { nullable: true })
  @JoinColumn({ name: 'reserved_by_id' })
  reservedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date; // Enables "Soft Delete"
}
