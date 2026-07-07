import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoriesRepository.create(createCategoryDto);
    const savedCategory = await this.categoriesRepository.save(category);

    return {
      message: 'Category created successfully',
      data: savedCategory,
    };
  }

  async findAll() {
    const categories = await this.categoriesRepository.find();

    return {
      message: 'Categories fetched successfully',
      data: categories,
    };
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category fetched successfully',
      data: category,
    };
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoriesRepository.save(category);

    return {
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  async remove(id: number) {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoriesRepository.remove(category);

    return {
      message: 'Category deleted successfully',
    };
  }
}
