import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSpecialistDto, EditSpecialistDto } from './dto';

@Injectable()
export class SpecialistService {
  constructor(private prisma: PrismaService) {}

  getAllSpecialists() {
    return this.prisma.specialist.findMany();
  }

  getSpecialistsById(specialistsId: number) {
    return this.prisma.specialist.findFirst({
      where: {
        id: specialistsId,
      },
    });
  }

  async getSpecialistsByServiceIds(categoryIds: number[]) {
    categoryIds = categoryIds.map((id) => Number(id));
    categoryIds = [...new Set(categoryIds)];
    let specialists = await this.prisma.specialist.findMany({
      where: {
        categories: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
      },
      include: {
        categories: true,
      },
    });
    specialists = specialists.map((specialist) => {
      const { categories } = specialist;
      let specCategoriesIds = [];
      categories.map((category) => {
        specCategoriesIds.push(category.categoryId);
      });
      const isMatchingIds = categoryIds.map((id) => {
        if (specCategoriesIds.includes(id)) {
          return true;
        }
        return false;
      });
      if (!isMatchingIds.includes(false)) {
        return specialist;
      }
    });
    return specialists;
  }

  async addSpecialist(dto: CreateSpecialistDto) {
    const categoryIds = dto['categoryIds'];
    delete dto['categoryIds'];
    const specialist = await this.prisma.specialist.create({
      data: { ...dto },
    });
    const newData = categoryIds?.map((id) => {
      const singleData = { categoryId: id, specialistId: specialist.id };
      return singleData;
    });
    await this.prisma.categoriesOnSpecialists.createMany({
      data: newData,
    });

    return specialist;
  }

  setImageUrl(path: string, id: number) {
    return this.prisma.specialist.update({
      where: {
        id,
      },
      data: {
        photoUrl: path,
      },
    });
  }

  async editSpecialist(dto: EditSpecialistDto) {
    const categoryIds = dto['categoryIds'];
    const newData = categoryIds?.map((id) => {
      return { categoryId: id, specialistId: dto.id };
    });
    delete dto['categoryIds'];
    await this.prisma.categoriesOnSpecialists.deleteMany({
      where: {
        specialistId: dto.id,
      },
    });
    await this.prisma.categoriesOnSpecialists.createMany({
      data: newData,
    });
    return this.prisma.specialist.update({
      where: { id: dto.id },
      data: { ...dto },
      include: { categories: true },
    });
  }

  deleteSpecialist(id: number) {
    return this.prisma.specialist.delete({
      where: { id },
    });
  }
}
