import { Controller, Get, Query } from '@nestjs/common';
import { DataService } from './data.service';

@Controller('')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get('/prices')
  async getPrices(
    @Query('service') service: string,
    @Query('country') country: string,
  ) {
    return this.dataService.getFilteredData(service, country);
  }
}