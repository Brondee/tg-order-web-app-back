import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDateDto, EditDateDto, EditTimeDto } from './dto';

@Injectable()
export class DateService {
  constructor(private prisma: PrismaService) {}

  async getDate(date: string, specId: number) {
    const dateDb = await this.prisma.date.findFirst({
      where: {
        date,
      },
    });
    let isWorkingDate = true;
    let isWorkingDateChanged = null;
    if (dateDb !== null) {
      const dateSpec = await this.prisma.datesOnSpecialists.findFirst({
        where: {
          dateId: dateDb.id,
          specialistId: specId,
        },
      });
      if (dateSpec !== null) {
        isWorkingDateChanged = dateSpec.isWorkingDateChanged;
        isWorkingDate = dateSpec.isWorkingDate;
      }
    }
    return { ...dateDb, isWorkingDate, isWorkingDateChanged };
  }

  async getDateTime(date: string, specId: number) {
    let dateDb = null;
    dateDb = await this.prisma.date.findFirst({
      where: {
        date,
      },
      include: {
        time: true,
      },
    });
    const day = new Date(date).getDay();
    let isWorkingDate = true;
    if (day == 0 || day == 6) {
      isWorkingDate = false;
    }
    if (dateDb == null) {
      dateDb = await this.prisma.date.create({
        data: {
          date,
        },
      });
      await this.prisma.datesOnSpecialists.create({
        data: {
          dateId: dateDb.id,
          specialistId: specId,
          isWorkingDate,
        },
      });
    }
    const timeDb = await this.prisma.time.findFirst({
      where: {
        dateId: dateDb.id,
        specialistId: specId,
      },
    });
    if (timeDb === null) {
      await this.prisma.time.create({
        data: {
          dateId: dateDb.id,
          specialistId: specId,
        },
      });
    }
    const dateSpec = await this.prisma.datesOnSpecialists.findFirst({
      where: {
        specialistId: specId,
        dateId: dateDb.id,
      },
    });
    if (dateSpec === null) {
      await this.prisma.datesOnSpecialists.create({
        data: {
          dateId: dateDb.id,
          specialistId: specId,
          isWorkingDate,
        },
      });
    }

    return this.prisma.time.findFirst({
      where: {
        dateId: dateDb.id,
        specialistId: specId,
      },
      select: {
        specialistId: true,
        morningTime: true,
        afternoonTime: true,
        eveningTime: true,
      },
    });
  }

  async addDate(dto: CreateDateDto) {
    const specId = dto['specialistId'];
    delete dto['specialistId'];
    const date = await this.prisma.date.create({
      data: {
        ...dto,
      },
    });

    await this.prisma.datesOnSpecialists.create({
      data: {
        specialistId: specId,
        dateId: date.id,
      },
    });

    return this.prisma.date.findUnique({
      where: {
        id: date.id,
      },
      include: {
        time: {
          select: {
            morningTime: true,
            afternoonTime: true,
            eveningTime: true,
          },
        },
      },
    });
  }

  async editDate(dto: EditDateDto) {
    const specialistId = dto.specialistId;
    delete dto['specialistId'];
    let dateDb = null;
    dateDb = await this.prisma.date.findFirst({
      where: {
        date: dto.date,
      },
    });
    if (!dateDb) {
      dateDb = await this.prisma.date.create({
        data: {
          date: dto.date,
        },
      });
    }
    const datesOnSpec = await this.prisma.datesOnSpecialists.findFirst({
      where: {
        dateId: dateDb.id,
        specialistId,
      },
    });
    if (datesOnSpec) {
      return this.prisma.datesOnSpecialists.update({
        where: {
          specialistId_dateId: { dateId: dateDb.id, specialistId },
        },
        data: {
          isWorkingDateChanged: dto.isWorkingDateChanged,
          isWorkingDate: dto.isWorkingDate,
        },
      });
    } else {
      return this.prisma.datesOnSpecialists.create({
        data: {
          dateId: dateDb.id,
          specialistId,
          isWorkingDate: dto.isWorkingDate,
          isWorkingDateChanged: dto.isWorkingDateChanged,
        },
      });
    }
  }

  async editTime(dto: EditTimeDto) {
    const dateDb = await this.prisma.date.findFirst({
      where: {
        date: dto.date,
      },
    });
    const timeDb = await this.prisma.time.findFirst({
      where: {
        dateId: dateDb.id,
        specialistId: dto.specialistId,
      },
    });
    const time = await this.prisma.time.update({
      where: {
        id: timeDb.id,
      },
      data: {
        morningTime: dto.morningTime,
        afternoonTime: dto.afternoonTime,
        eveningTime: dto.eveningTime,
      },
    });
    if (
      dto.morningTime.length === 0 &&
      dto.afternoonTime.length === 0 &&
      dto.eveningTime.length === 0
    ) {
      await this.prisma.datesOnSpecialists.update({
        where: {
          specialistId_dateId: {
            specialistId: dto.specialistId,
            dateId: dateDb.id,
          },
        },
        data: {
          isWorkingDate: false,
        },
      });
    }
    return { time };
  }

  deleteDateById(id: number) {
    return this.prisma.date.delete({
      where: {
        id,
      },
    });
  }
}
