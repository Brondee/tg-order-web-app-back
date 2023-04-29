import { Controller, Get, Body, Post, Delete, Patch } from '@nestjs/common';
import {
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { ParseIntPipe, ParseArrayPipe } from '@nestjs/common/pipes';
import { CreateSpecialistDto, EditSpecialistDto } from './dto';
import { SpecialistService } from './specialist.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('specialist')
export class SpecialistController {
  constructor(private specialistService: SpecialistService) {}

  @Get('all')
  getAllSpecialists() {
    return this.specialistService.getAllSpecialists();
  }

  @Get(':id')
  getSpecialistsById(@Param('id', ParseIntPipe) specialistId: number) {
    return this.specialistService.getSpecialistsById(specialistId);
  }

  @Get('all/:ids')
  getSpecialistsByServiceIds(
    @Param('ids', ParseArrayPipe) serviceIds: number[],
  ) {
    return this.specialistService.getSpecialistsByServiceIds(serviceIds);
  }

  @Post('add')
  addSpecialist(@Body() dto: CreateSpecialistDto) {
    return this.specialistService.addSpecialist(dto);
  }

  @Post('upload/:specialistid')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('specialistid', ParseIntPipe) id: number,
  ) {
    console.log(file);
  }

  @Patch('edit')
  editSpecialist(@Body() dto: EditSpecialistDto) {
    return this.specialistService.editSpecialist(dto);
  }

  @Delete('del/:id')
  deleteSpecialist(@Param('id', ParseIntPipe) id: number) {
    return this.specialistService.deleteSpecialist(id);
  }
}
