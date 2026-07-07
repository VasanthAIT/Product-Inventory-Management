import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.findCategory(createProductDto.categoryId);
    const product = this.productsRepository.create({
      ...createProductDto,
      category,
    });
    const savedProduct = await this.productsRepository.save(product);

    return {
      message: 'Product created successfully',
      data: savedProduct,
    };
  }

  async findAll() {
    const products = await this.productsRepository.find();

    return {
      message: 'Products fetched successfully',
      data: products,
    };
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product fetched successfully',
      data: product,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { categoryId, ...productData } = updateProductDto;
    Object.assign(product, productData);

    if (categoryId !== undefined) {
      product.category = await this.findCategory(categoryId);
    }

    const updatedProduct = await this.productsRepository.save(product);

    return {
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }

  async remove(id: number) {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.remove(product);

    return {
      message: 'Product deleted successfully',
    };
  }

  private async findCategory(id: number) {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}
