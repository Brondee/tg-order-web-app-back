import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  getAllOrders() {
    return this.prisma.order.findMany();
  }

  getOrderById(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }

  addOrder(dto: CreateOrderDto) {
    return this.prisma.order.create({
      data: { ...dto },
    });
  }

  deleteOrderById(id: number) {
    return this.prisma.order.delete({ where: { id } });
  }
}
