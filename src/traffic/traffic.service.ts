import { Injectable } from '@nestjs/common'
import { CollectionReference } from '@google-cloud/firestore'
import { db } from 'src/database/firebase.config'
import * as moment from 'moment'
import { TrafficInterface } from './traffic.interface'

@Injectable()
export class TrafficService {
  private readonly networkRef: CollectionReference

  constructor() {
    this.networkRef = db.collection('network')
  }

  async getTrafficData(deviceName: string, startAt: number, endAt: number): Promise<TrafficInterface[]> {   
    const data = []
    //const start = new Date(moment.unix(startAt).subtract(7, 'hour').toString())
    const end = new Date(moment.unix(endAt).subtract(7, 'hour').toString())

    const results = await this.networkRef.doc(deviceName).collection('traffic')
      //.where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .orderBy('timestamp', 'desc')
      .get()
      
    if (results.empty) {
      return
    }
    results.forEach(result => {
      const { timestamp, ...other } = result.data()
      const time = moment.unix(timestamp._seconds).add(7, 'hour').format('HH:mm  DD-MM-YYYY')
      data.push({ id: result.id, timestamp: time, ...other })
    })
    return data
  }

  async getTrafficDataByType(deviceName: string, type: string): Promise<TrafficInterface[]> {   
    const data = []
    const dateNow = new Date(Date.now());
    
  
    const dateTime = moment().format('YYYY-MM-DD')
    let h = dateNow.getHours()
    let hStr = ''
    if (h < 10) {
      hStr = '0' + h
    }else {
      hStr = h.toString()
    }
   
    const stTime = `${dateTime} ${hStr}:00`
    const stFormat = moment(stTime).format('x')
    const stFormatx = stFormat.substr(0, 10)
    const start = new Date(moment.unix(parseInt(stFormatx)).add(7, 'hour').toString())
    console.log("start : ", start)
    let m = dateNow.getMinutes()
    let mStr = ''
    if (m < 10) {
      mStr = '0' + m
    }else {
      mStr = m.toString()
    }
  
    const stTimeEnd = `${dateTime} ${hStr}:${mStr}`
    const stFormatEnd = moment(stTimeEnd).format('x')
    const stFormatxEnd = stFormatEnd.substr(0, 10)
    const end = new Date(moment.unix(parseInt(stFormatxEnd)).add(7, 'hour').toString())
    console.log("end : ", end)

    if (type == 'hour') {
      console.log("end : ", end)
    }
 
    const results = await this.networkRef.doc(deviceName).collection('traffic')
      .where('timestamp', '<=', start)
      //.where('timestamp', '<=', end)
      .orderBy('timestamp', 'desc')
      .get()
     
    if (results.empty) {
      return
    }
    results.forEach(result => {
      const { timestamp, ...other } = result.data()
      const time = moment.unix(timestamp._seconds).add(7, 'hour').format('HH:mm  DD-MM-YYYY')
      //Don't worry just compare on this
      data.push({ id: result.id, timestamp: time, ...other })
    })
    return data
  }
}
