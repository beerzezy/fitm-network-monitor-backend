import { Injectable } from '@nestjs/common'
import { db } from 'src/database/firebase.config'
import * as moment from 'moment'
import { SpeedInterface } from './speed.interface'

@Injectable()
export class SpeedService {
  async getSpeedData(): Promise<SpeedInterface[]> {
    var data = []
    var deviceArr = []
    
    // Get Devices
    let devices = await db.collection('network').limit(8).get()
    devices.forEach(device => {
      deviceArr.push({ deviceName: device.id })
    })
    
    for (let i = 0; i < deviceArr.length; i++) {
      // Get speed of devices and prepare data for provide to front-end
      const speed = await db.collection('network').doc(deviceArr[i].deviceName).collection('speed').orderBy('timestamp', 'desc').limit(1).get()

      speed.forEach(doc => {
        let {timestamp, ...other} = doc.data()
        const time = moment.unix(timestamp._seconds).add(7, 'hours').format('HH:mm  DD-MM-YYYY')
        data.push({ deviceName: deviceArr[i].deviceName, timestamp: time, ...other })
      })
    }
    
    return data
  }
}
