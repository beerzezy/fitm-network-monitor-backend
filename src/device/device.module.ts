import { Module } from '@nestjs/common'
import { DeviceController } from './device.controller'
import { DeviceLogic } from './device.logic'
import { DeviceService } from './device.service'
import { CronjobGetData } from './cronjob-get-data'

@Module({
  controllers: [DeviceController],
  providers: [DeviceLogic, DeviceService, CronjobGetData]
})

export class DeviceModule {}
