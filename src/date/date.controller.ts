import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { DateService } from './date.service';
import { CreateDateDto, EditDateDto, EditTimeDto } from './dto';

@Controller('dates')
export class DatesController {
  constructor(private dateService: DateService) {}

  @Get('/:date/:specId')
  getDateTime(
    @Param('date') date: string,
    @Param('specId', ParseIntPipe) specId: number,
  ) {
    return this.dateService.getDateTime(date, specId);
  }

  @Get('single/:date/:specId')
  getDate(
    @Param('date') date: string,
    @Param('specId', ParseIntPipe) specId: number,
  ) {
    return this.dateService.getDate(date, specId);
  }

  @Post('add')
  addDate(@Body() dto: CreateDateDto) {
    return this.dateService.addDate(dto);
  }

  @Patch('edit')
  editDate(@Body() dto: EditDateDto) {
    return this.dateService.editDate(dto);
  }

  @Patch('editTime')
  editTime(@Body() dto: EditTimeDto) {
    return this.dateService.editTime(dto);
  }

  @Delete('del/:id')
  deleteDateById(@Param('id', ParseIntPipe) id: number) {
    return this.dateService.deleteDateById(id);
  }
}
