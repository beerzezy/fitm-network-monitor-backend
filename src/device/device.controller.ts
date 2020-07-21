import { Controller, Get, Post, Param, Body } from '@nestjs/common'
import { DeviceInterface } from './device.interface';
import { DeviceService } from './device.service';
import * as snmp from 'snmp-native'
import { DeviceBody } from './device-body.dto'
import { Observable } from 'rxjs'

@Controller('device')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService
  ) {}

  @Get(':deviceName')
  async getDeviceData(@Param('deviceName') deviceName: string): Promise<DeviceInterface> {
    return this.deviceService.getDeviceData(deviceName)
  }

  @Post('shutdown')
  async shutdownDevice(@Body() body: DeviceBody) {
    console.log(body)
    const device = new snmp.Session({ host: body.deviceIp, port: 161, community: 'private' })
    device.set({ oid: body.oid, value: 2, type: 2 }, function (error, varbind) {
      console.log(varbind)
      if (error) {
          console.log('Fail :(');
          console.log(error)
      } else {
          console.log('The set is done.');
      }
    })
  }
}
