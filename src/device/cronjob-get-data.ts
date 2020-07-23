import { Injectable } from '@nestjs/common'
import { NestSchedule, Cron } from 'nest-schedule'
import { DeviceService } from './device.service'
import * as snmp from 'snmp-native'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import * as qs from 'qs'


@Injectable()
export class CronjobGetData extends NestSchedule {
    filePathSw9400: string;
    filePathRshop: string;
    filePathRsad: string;
    filePathR415: string;
    filePathR330a: string;
    filePathR124: string;
    filePathR101c: string;
    filePath3850_r415: string;
    constructor(
        private readonly deviceService: DeviceService
      ) {
        super()
        this.filePathSw9400 = path.resolve(__dirname, './../../src/device/deviceCPUstatus/sw9400.json');
        this.filePathRshop = path.resolve(__dirname, './../../src/device/deviceCPUstatus/rshop.json');
        this.filePathRsad = path.resolve(__dirname, './../../src/device/deviceCPUstatus/rsad.json');
        this.filePathR415 = path.resolve(__dirname, './../../src/device/deviceCPUstatus/r415.json');
        this.filePathR330a = path.resolve(__dirname, './../../src/device/deviceCPUstatus/r330a.json');
        this.filePathR124 = path.resolve(__dirname, './../../src/device/deviceCPUstatus/r124.json');
        this.filePathR101c = path.resolve(__dirname, './../../src/device/deviceCPUstatus/r101c.json');
        this.filePath3850_r415 = path.resolve(__dirname, './../../src/device/deviceCPUstatus/3850-r415.json');
    }

    @Cron('* * * * *')
    async cronjob() {
        console.log(`get data @ ${new Date()}`)
        this.checkCpuUsageSw9400()
        this.checkCpuUsageRshop()
        this.checkCpuUsageRsad()
        this.checkCpuUsageR415()
        this.checkCpuUsageR330a()
        this.checkCpuUsageR124()
        this.checkCpuUsageR101c()
        this.checkCpuUsage3850_r415()
    }

    private async checkCpuUsageSw9400() {
        const cpu = await this.deviceService.getDeviceData('sw9400').then((result) => { return result.cpu })
        let rawdata = fs.readFileSync(this.filePathSw9400.toString(), 'utf-8')
        let device = JSON.parse(rawdata)
        
        if (cpu > 90) {
            if (device.status == 'Normal') {
                this.sendMessage(device.device_ip, device.device_name, cpu)
                console.log('send notify')

                let sw9400 = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Peek"
                }
                let data = JSON.stringify(sw9400)
                fs.writeFileSync(this.filePathSw9400.toString(), data)
            }
        } else {
            if (device.status == 'Peek') {
                let sw9400 = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Normal"
                }
                let data = JSON.stringify(sw9400)
                fs.writeFileSync(this.filePathSw9400.toString(), data)
            }
        }
    }

    private async checkCpuUsageRshop() {
        const cpu = await this.deviceService.getDeviceData('rshop').then((result) => { return result.cpu })
        let rawdata = fs.readFileSync(this.filePathRshop.toString(), 'utf-8')
        let device = JSON.parse(rawdata)
        
        if (cpu > 90) {
            if (device.status == 'Normal') {
                this.sendMessage(device.device_ip, device.device_name, cpu)
                console.log('send notify')

                let rshop = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Peek"
                }
                let data = JSON.stringify(rshop)
                fs.writeFileSync(this.filePathRshop.toString(), data)
            }
        } else {
            if (device.status == 'Peek') {
                let rshop = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Normal"
                }
                let data = JSON.stringify(rshop)
                fs.writeFileSync(this.filePathRsad.toString(), data)
            }
        }
    }

    private async checkCpuUsageRsad() {
        const cpu = await this.deviceService.getDeviceData('rsad').then((result) => { return result.cpu })
        let rawdata = fs.readFileSync(this.filePathRsad.toString(), 'utf-8')
        let device = JSON.parse(rawdata)

        if (cpu > 90) {
            if (device.status == 'Normal') {
                this.sendMessage(device.device_ip, device.device_name, cpu)
                console.log('send notify')

                let rsad = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Peek"
                }
                let data = JSON.stringify(rsad)
                fs.writeFileSync(this.filePathRsad.toString(), data)
            }
        } else {
            if (device.status == 'Peek') {
                let rsad = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Normal"
                }
                let data = JSON.stringify(rsad)
                fs.writeFileSync(this.filePathRsad.toString(), data)
            }
        }
    }

    private async checkCpuUsageR415() {
        const cpu = await this.deviceService.getDeviceData('r415').then((result) => { return result.cpu })
        let rawdata = fs.readFileSync(this.filePathR415.toString(), 'utf-8')
        let device = JSON.parse(rawdata)
        
        if (cpu > 90) {
            if (device.status == 'Normal') {
                this.sendMessage(device.device_ip, device.device_name, cpu)
                console.log('send notify')

                let r415 = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Peek"
                }
                let data = JSON.stringify(r415)
                fs.writeFileSync(this.filePathR415.toString(), data)
            }
        } else {
            if (device.status == 'Peek') {
                let r415 = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Normal"
                }
                let data = JSON.stringify(r415)
                fs.writeFileSync(this.filePathR415.toString(), data)
            }
        }
    }

    private async checkCpuUsageR330a() {
        const cpu = await this.deviceService.getDeviceData('r330a').then((result) => { return result.cpu })
        let rawdata = fs.readFileSync(this.filePathR330a.toString(), 'utf-8')
        let device = JSON.parse(rawdata)
        
        if (cpu > 90) {
            if (device.status == 'Normal') {
                this.sendMessage(device.device_ip, device.device_name, cpu)
                console.log('send notify')

                let r330a = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Peek"
                }
                let data = JSON.stringify(r330a)
                fs.writeFileSync(this.filePathR330a.toString(), data)
            }
        } else {
            if (device.status == 'Peek') {
                let r330a = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Normal"
                }
                let data = JSON.stringify(r330a)
                fs.writeFileSync(this.filePathR330a.toString(), data)
            }
        }
    }

    private async checkCpuUsageR124() {
        const cpu = await this.deviceService.getDeviceData('r124').then((result) => { return result.cpu })
        let rawdata = fs.readFileSync(this.filePathR124.toString(), 'utf-8')
        let device = JSON.parse(rawdata)
        
        if (cpu > 90) {
            if (device.status == 'Normal') {
                this.sendMessage(device.device_ip, device.device_name, cpu)
                console.log('send notify')

                let r124 = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Peek"
                }
                let data = JSON.stringify(r124)
                fs.writeFileSync(this.filePathR124.toString(), data)
            }
        } else {
            if (device.status == 'Peek') {
                let r124 = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Normal"
                }
                let data = JSON.stringify(r124)
                fs.writeFileSync(this.filePathR124.toString(), data)
            }
        }
    }

    private async checkCpuUsageR101c() {
        const cpu = await this.deviceService.getDeviceData('r101c').then((result) => { return result.cpu })
        let rawdata = fs.readFileSync(this.filePathR101c.toString(), 'utf-8')
        let device = JSON.parse(rawdata)
        
        if (cpu > 90) {
            if (device.status == 'Normal') {
                this.sendMessage(device.device_ip, device.device_name, cpu)
                console.log('send notify')

                let r101c = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Peek"
                }
                let data = JSON.stringify(r101c)
                fs.writeFileSync(this.filePathR101c.toString(), data)
            }
        } else {
            if (device.status == 'Peek') {
                let r101c = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Normal"
                }
                let data = JSON.stringify(r101c)
                fs.writeFileSync(this.filePathR101c.toString(), data)
            }
        }
    }

    private async checkCpuUsage3850_r415() {
        const cpu = await this.deviceService.getDeviceData('sw3850').then((result) => { return result.cpu })
        let rawdata = fs.readFileSync(this.filePath3850_r415.toString(), 'utf-8')
        let device = JSON.parse(rawdata)
        
        if (cpu > 90) {
            if (device.status == 'Normal') {
                this.sendMessage(device.device_ip, device.device_name, cpu)
                console.log('send notify')

                let sw3850 = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Peek"
                }
                let data = JSON.stringify(sw3850)
                fs.writeFileSync(this.filePath3850_r415.toString(), data)
            }
        } else {
            if (device.status == 'Peek') {
                let sw3850 = { 
                    device_name: device.device_name, 
                    device_ip: device.device_ip,
                    status: "Normal"
                }
                let data = JSON.stringify(sw3850)
                fs.writeFileSync(this.filePath3850_r415.toString(), data)
            }
        }
    }


    private async sendMessage(device_ip: string, device_name: string, cpuUsage: number) {
        console.log('sendMessage : ', device_name, device_ip)
        let token = 'oh9PA0x5oFNDd83fUZRRwlhO44sseTkZFbDRNoGZmQF'
    
        const { data } = await axios({
          method: 'POST',
          url: 'https://notify-api.line.me/api/notify',
          data: qs.stringify({
            message: `${device_name} cpu usage ${cpuUsage}%, ip address : ${device_ip}`
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
          }
        })
        return data
    }
}