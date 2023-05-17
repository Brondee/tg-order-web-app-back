import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDateDto, EditDateDto, EditTimeDto, ReturnTimeDto } from './dto';

@Injectable()
export class DateService {
  constructor(private prisma: PrismaService) {}

  async getDate(date: string, specId: number) {
    const dateDb = await this.prisma.date.findFirst({
      where: {
        date,
      },
    });
    let isWorkingDate = 'none';
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
          isWorkingDate: 'false',
        },
      });
    }
    return { time };
  }

  async returnTime(dto: ReturnTimeDto) {
    const orderId = Number(dto.orderId);
    const totalTime = Number(dto.totalTime);
    const orderInfo = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    const date = orderInfo.dateTime.split(', ')[0];
    const curTime = 'disabled ' + orderInfo.dateTime.split(', ')[1];
    const specialistId = orderInfo.masterId;
    const repeatReturnTime = Math.ceil(totalTime / 30);
    const dateDb = await this.prisma.date.findFirst({
      where: {
        date,
      },
    });
    const timeDb = await this.prisma.time.findFirst({
      where: {
        dateId: dateDb.id,
        specialistId,
      },
    });
    let newMorningTime = [...timeDb.morningTime];
    let newAfternoonTime = [...timeDb.afternoonTime];
    let newEveningTime = [...timeDb.eveningTime];

    if (timeDb.morningTime.indexOf(curTime) !== -1) {
      for (let i = 0; i < repeatReturnTime; i++) {
        let index = timeDb.morningTime.indexOf(curTime) + i;
        if (newMorningTime[index]) {
          newMorningTime[index] = newMorningTime[index].replace('disabled', '');
        }
        if (!newMorningTime[index]) {
          let newI = repeatReturnTime - i;
          for (let i = 0; i < newI; i++) {
            newAfternoonTime[i] = newAfternoonTime[i].replace('disabled', '');
          }
          break;
        }
      }
    } else if (timeDb.afternoonTime.indexOf(curTime) !== -1) {
      for (let i = 0; i < repeatReturnTime; i++) {
        let index = timeDb.afternoonTime.indexOf(curTime) + i;
        if (newAfternoonTime[index]) {
          newAfternoonTime[index] = newAfternoonTime[index]
            .replace('disabled', '')
            .trim();
        }
        if (!newAfternoonTime[index]) {
          let newI = repeatReturnTime - i;
          for (let i = 0; i < newI; i++) {
            newEveningTime[i] = newEveningTime[i].replace('disabled', '');
          }
          break;
        }
      }
    } else if (timeDb.eveningTime.indexOf(curTime) !== -1) {
      for (let i = 0; i < repeatReturnTime; i++) {
        let index = timeDb.eveningTime.indexOf(curTime) + i;
        if (newEveningTime[index])
          newEveningTime[index] = newEveningTime[index].replace('disabled', '');
      }
    }

    return this.prisma.time.update({
      where: {
        id: timeDb.id,
      },
      data: {
        morningTime: newMorningTime,
        afternoonTime: newAfternoonTime,
        eveningTime: newEveningTime,
      },
    });
  }

  deleteDateById(id: number) {
    return this.prisma.date.delete({
      where: {
        id,
      },
    });
  }
}
