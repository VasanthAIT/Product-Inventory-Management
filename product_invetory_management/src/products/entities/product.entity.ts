import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CategoryEntity } from '../../categories/entities/category.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ default: 0 })
  stock!: number;

  @ManyToOne(() => CategoryEntity, (category) => category.products, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  category!: CategoryEntity;
}
