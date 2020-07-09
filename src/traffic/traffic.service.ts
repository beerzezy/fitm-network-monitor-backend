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
    if (type == 'hours') {
      return this.getTrafficDataByHour(deviceName)
    } else if (type == 'days') {
      return this.getTrafficDataByDays(deviceName)
    } else if (type == 'month') {
      return this.getTrafficDataByMonth(deviceName)
    }
  }

  async getTrafficDataByHour(deviceName: string): Promise<TrafficInterface[]> {   
    const data = []
    const dateNow = new Date(Date.now());
    
    const dateTime = moment().format('YYYY-MM-DD')
    let h = dateNow.getHours()

    let hPreviousStr = ''
    if (h - 1 < 0) {
      hPreviousStr = '23'
    } else {
      if (h - 1 < 10) {
        hPreviousStr = '0' + (h - 1).toString()
      } else {
        hPreviousStr = (h - 1).toString()
      }
    }

    let hStr = ''
    if (h < 10) {
      hStr = '0' + h
    }else {
      hStr = h.toString()
    }

    let m = dateNow.getMinutes()
    let mStr = ''
    if (m < 10) {
      mStr = '0' + m
    }else {
      mStr = m.toString()
    }
   
    const stTime = `${dateTime} ${hPreviousStr}:${mStr}`
    const stFormat = moment(stTime).format('x')
    const stFormatx = stFormat.substr(0, 10)
    const start = new Date(moment.unix(parseInt(stFormatx)).add(7, 'hour').toString())
    console.log("startl : ", start)

  
    const stTimeEnd = `${dateTime} ${hStr}:${mStr}`
    const stFormatEnd = moment(stTimeEnd).format('x')
    const stFormatxEnd = stFormatEnd.substr(0, 10)
    const end = new Date(moment.unix(parseInt(stFormatxEnd)).add(7, 'hour').toString())
    console.log("end : ", end)

    const results = await this.networkRef.doc(deviceName).collection('traffic')
      .orderBy('timestamp', 'desc')
      .get()
     
    if (results.empty) {
      return
    }

    results.forEach(result => {
      const { timestamp, ...other } = result.data()
      const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
      const timeCompare = new Date(moment.unix(timestamp._seconds).add(7, 'hour').toString())
      
      if (start < timeCompare){
        if (timeCompare < end)
        data.push({ id: result.id, timestamp: time, ...other })
      }
      
    })

    return data
  }

  async getTrafficDataByDays(deviceName: string): Promise<TrafficInterface[]> {   
    const data = []
    const dateNow = new Date(Date.now());
    const dateTime = moment().format('YYYY-MM-DD')
    
    var testDate = new Date(moment(dateNow,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    console.log("testDate : ", testDate)
    // let year = dateNow.getFullYear()
    // // let month = dateNow.getMonth()+1  //because january start 0
    // let monthPrevoius = dateNow.getMonth()
    // let monthCurrent = monthPrevoius+1
    // let monthStr = ''
    // if (monthCurrent < 10) {
    //   monthStr = '0' + monthCurrent
    // } else {
    //   monthStr = monthCurrent.toString()
    // }

    // let d = dateNow.getDate()
    // let dayPreviousStr = ''
    // if (d - 1 < 0) {
    //   let lastDayOfMonth = new Date(year, monthPrevoius, 0).getDate()
    //   dayPreviousStr = lastDayOfMonth.toString()
    // }else {
    //   if (d - 1 < 10){
    //     dayPreviousStr = '0' + (d - 1).toString()
    //   } else {
    //     dayPreviousStr = (d - 1).toString()
    //   }
    // }
    // console.log("dStr : ", dayPreviousStr)

    let h = dateNow.getHours()
    let hStr = ''
    if (h < 10) {
      hStr = '0' + h
    }else {
      hStr = h.toString()
    }

    let m = dateNow.getMinutes()
    let mStr = ''
    if (m < 10) {
      mStr = '0' + m
    }else {
      mStr = m.toString()
    }

    const stTime = `${dateTime} 00:00`
    const stFormat = moment(stTime).format('x')
    const stFormatx = stFormat.substr(0, 10)
    const start = new Date(moment.unix(parseInt(stFormatx)).add(7, 'hour').toString())
    console.log("start : ", start)


    const stTimeEnd = `${dateTime} ${hStr}:${mStr}`
    const stFormatEnd = moment(stTimeEnd).format('x')
    const stFormatxEnd = stFormatEnd.substr(0, 10)
    const end = new Date(moment.unix(parseInt(stFormatxEnd)).add(7, 'hour').toString())
    console.log("end : ", end)

    const results = await this.networkRef.doc(deviceName).collection('traffic')
      .orderBy('timestamp', 'desc')
      .get()
     
    if (results.empty) {
      return
    }

    results.forEach(result => {
      const { timestamp, ...other } = result.data()
      const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
      const timeCompare = new Date(moment.unix(timestamp._seconds).add(7, 'hour').toString())
      
      if (start < timeCompare){
        if (timeCompare < end)
        data.push({ id: result.id, timestamp: time, ...other })
      } 
    })

    // var testDate = moment('2020-07-10T08:05:44.936Z','YYYY-MM-DD HH:mm:ss.SSS').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    // var testDateNow = moment(dateNow,'YYYY-MM-DD HH:mm:ss.SSS').format('YYYY-MM-DDTHH:mm:ss.SSSZ')

    // if (lastTime < startTime) {
    //   console.log("test if testDate",lastTime)
    //   console.log("test if testDateNow",startTime)
    // } else {
    //   console.log("test else testDate",lastTime)
    //   console.log("test else testDateNow",startTime)
    // }

    // var testDate = moment(`${dateTime}T08:00:00.000Z`,'YYYY-MM-DD HH:mm:ss.SSS').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    // console.log("test testDate Change",testDate)

    var inHour = []
    var endHour = end.getHours()
    var startHour = endHour-1
    var inboundSum = 0 , outboundSum = 0
    var i = 0
 
    var lastTime = new Date(moment(`${dateTime}T${endHour}:00:00.000Z`,'YYYY-MM-DD HH:mm:ss.SSS').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var startTime = new Date(moment(`${dateTime}T${startHour}:00:00.000Z`,'YYYY-MM-DD HH:mm:ss.SSS').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    console.log("lastTime",lastTime)
    console.log("startHour",startTime)

    var isChangeHour = false
    
    data.forEach(result => {
      let { timestamp, outbound, inbound } = result
      console.log("timestamp",timestamp)

      if (isChangeHour) {
        endHour = startHour
        startHour = endHour-1
        lastTime = new Date(moment(`${dateTime}T${endHour}:00:00.000Z`,'YYYY-MM-DD HH:mm:ss.SSS').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
        startTime = new Date(moment(`${dateTime}T${startHour}:00:00.000Z`,'YYYY-MM-DD HH:mm:ss.SSS').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
      }

      if (lastTime > timestamp && startTime < timestamp){
        isChangeHour = false
        inboundSum = inboundSum + inbound
        outboundSum = outboundSum + outbound
        i++
      } else {
        inboundSum = inboundSum / i
        outboundSum = outboundSum / i
        inHour.push({ id: result.id, timestamp: timestamp, inbound: inboundSum , outbound: outboundSum })
        isChangeHour = true
        endHour = startHour
        inboundSum = 0
        outboundSum = 0
        i = 0
      }
    })
    inHour.forEach(dd => {
      console.log("inHour",dd)
    })


    return data
  }

  async getTrafficDataByMonth(deviceName: string): Promise<TrafficInterface[]> {   
    const data = []
    const dateNow = new Date(Date.now());
    
    const dateTime = moment().format('YYYY-MM-DD')

    let year = dateNow.getFullYear()

    let month = dateNow.getMonth()+1
    let monthStr = ''
    if (month < 10) {
      monthStr = '0' + month
    } else {
      monthStr = month.toString()
    }

    let d = dateNow.getDate()
    let dStr = ''
    if (d < 10) {
      dStr = '0' + d
    }else {
      dStr = d.toString()
    }

    const stTime = `${year}-${monthStr}-${dStr} 00:00`
    const stFormat = moment(stTime).format('x')
    const stFormatx = stFormat.substr(0, 10)
    const start = new Date(moment.unix(parseInt(stFormatx)).add(7, 'hour').toString())
    console.log("start : ", start)

    let h = dateNow.getHours()
    let hStr = ''
    if (h < 10) {
      hStr = '0' + h
    }else {
      hStr = h.toString()
    }

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


    const results = await this.networkRef.doc(deviceName).collection('traffic')
      .orderBy('timestamp', 'desc')
      .get()
     
    if (results.empty) {
      return
    }


    results.forEach(result => {
      const { timestamp, ...other } = result.data()
      const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
      const timeCompare = new Date(moment.unix(timestamp._seconds).add(7, 'hour').toString())
      
      if (start < timeCompare){
        if (timeCompare < end)
        data.push({ id: result.id, timestamp: time, ...other })
      }
      
    })

    return data
  }

}
