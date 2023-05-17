import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  getAllClients() {
    return this.prisma.client.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  getClientById(id: number) {
    return this.prisma.client.findUnique({
      where: { id },
    });
  }

  addNewClient(dto: CreateClientDto) {
    return this.prisma.client.create({
      data: { ...dto },
    });
  }
}
