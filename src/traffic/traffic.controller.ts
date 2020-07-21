import { Controller, Get, Param, Query } from '@nestjs/common'
import { TrafficService } from './traffic.service'
import { TrafficInterface } from './traffic.interface'
import { GetTrafficQuery } from './traffic.dto'

@Controller('traffic')
export class TrafficController {
  constructor(
    private readonly trafficService: TrafficService
  ) {}

  @Get(':deviceName')
  async getTrafficDataPick(@Param('deviceName') deviceName: string, @Query() queryString: GetTrafficQuery): Promise<TrafficInterface[]> {
    return this.trafficService.getTrafficDataPick(deviceName, queryString.startAt, queryString.endAt)
  }

  @Get('home/:deviceName')
  async getTrafficData(@Param('deviceName') deviceName: string): Promise<TrafficInterface[]> {
    return this.trafficService.getTrafficData(deviceName)
  }

  @Get(':deviceName/:type')
  async getTrafficByType(@Param('deviceName') deviceName: string , @Param('type') type: string): Promise<TrafficInterface[]> {
    return this.trafficService.getTrafficDataByType(deviceName, type)
  }
}
