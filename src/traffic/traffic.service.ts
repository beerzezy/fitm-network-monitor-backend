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
    } else if (type == 'year') {
      return this.getTrafficDataByYear(deviceName)
    }
  }

  async getTrafficDataByHour(deviceName: string): Promise<TrafficInterface[]> {   
    const data = []
    const dateNow = new Date(Date.now());
    const dateTime = moment().format('YYYY-MM-DD')
    var h = dateNow.getHours()
    var m = dateNow.getMinutes()
    var hPre = h - 1

    var start = new Date(moment(`${dateTime} ${hPre}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    console.log("startl : ", start)

    const end = new Date(moment(`${dateTime} ${h}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
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

    let h = dateNow.getHours()
    let m = dateNow.getMinutes()

    var start = new Date(moment(`${dateTime} 00:00`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    console.log("startl : ", start)

    const end = new Date(moment(`${dateTime} ${h}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
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

    var inHour = []
    var endHour = h+1
    var startHour = endHour-1
    var inboundSum = 0 , outboundSum = 0
    var inboundMean = 0 ,outboundSumMean = 0
    var i = 0

    var lastTime = new Date(moment(`${dateTime} ${endHour}:00:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var startTime = new Date(moment(`${dateTime} ${startHour}:00:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var isChangeHour = false
    
    data.forEach(result => {
      let { timestamp, outbound, inbound } = result
      let timeStamped = new Date(moment(timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())

      if (isChangeHour) {
        endHour = startHour
        startHour = endHour-1
        console.log("endHour",endHour)
        console.log("startHour",startHour)
        lastTime = new Date(moment(`${dateTime} ${endHour}:00:00.000Z`,'YYYY-MM-DD HH:mm:ss').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
        startTime = new Date(moment(`${dateTime} ${startHour}:00:00.000Z`,'YYYY-MM-DD HH:mm:ss').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
      }

      if (startTime < timeStamped){
        //console.log("lastTime",lastTime, "|| startTime",startTime, "|| timeStamped",timeStamped)
        isChangeHour = false
        inboundSum += inbound
        outboundSum += outbound
        i++
        //console.log("i",i)
      } else {
        inboundMean = inboundSum / i
        outboundSumMean = outboundSum / i
        console.log("inboundMean",lastTime, "|| startTime",startTime, "|| timeStamped",timeStamped)
        inHour.push({ id: result.id, timestamp: lastTime, inbound: inboundMean , outbound: outboundSumMean })
        isChangeHour = true
        endHour = startHour
        inboundSum = 0
        outboundSum = 0
        i = 0
      }
    })
    if (inboundSum != 0) {
      inboundMean = inboundSum / i
      outboundSumMean = outboundSum / i
      inHour.push({ id: data[data.length - 1].id, timestamp: lastTime, inbound: inboundMean , outbound: outboundSumMean })
    }

    return inHour
  }

  async getTrafficDataByMonth(deviceName: string): Promise<TrafficInterface[]> {   
    const data = []
    const dateNow = new Date(Date.now());
    
    const dateTime = moment().format('YYYY-MM-DD')

    var year = dateNow.getFullYear()
    var month = dateNow.getMonth()+1

    var start = new Date(moment(`${year}-${month}-01 00:00`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))

    let h = dateNow.getHours()
    let m = dateNow.getMinutes()

    const end = new Date(moment(`${dateTime} ${h}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
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

    var day = dateNow.getDate()

    var inDay = []
    var endDay = day
    var startDay = endDay-1
    var inboundSum = 0 , outboundSum = 0
    var i = 1

    //var lastTime = new Date(moment(`${dateTime} 23:59:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var startTime = new Date(moment(`${dateTime} 00:00:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))

    var inboundMean = 0
    var outboundSumMean = 0
    var isChangeHour = false
    var year = dateNow.getFullYear()
    var month = dateNow.getMonth()+1

    data.forEach(result => {
      let { timestamp, outbound, inbound } = result
      let timeStamped = new Date(moment(timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())

      if (isChangeHour) {
        endDay = startDay
        startDay = endDay-1
        //lastTime = new Date(moment(`${year}-${month}-${endDay} 23:59:00.000`,'YYYY-MM-DD HH:mm:ss').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
        startTime = new Date(moment(`${year}-${month}-${startDay} 00:00:00.000Z`,'YYYY-MM-DD HH:mm:ss').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
      }
     
      if (startTime < timeStamped){
        isChangeHour = false
        inboundSum += inbound
        outboundSum += outbound
        i++
      } else {
        inboundMean = inboundSum / i
        outboundSumMean = outboundSum / i
        inDay.push({ id: result.id, timestamp: startTime, inbound: inboundMean , outbound: outboundSumMean })
        isChangeHour = true
        endDay = startDay
        inboundSum = 0
        outboundSum = 0
        i = 0
      }
    })

    if (inboundSum != 0) {
      inboundMean = inboundSum / i
      outboundSumMean = outboundSum / i
      inDay.push({ id: data[data.length - 1].id, timestamp: startTime, inbound: inboundMean , outbound: outboundSumMean })
    }
    
    inDay.forEach(dd => {
      console.log("inDay",dd)
    })


    return inDay

  }

  async getTrafficDataByYear(deviceName: string): Promise<TrafficInterface[]> {   
    const data = []
    const dateNow = new Date(Date.now());
    const dateTime = moment().format('YYYY-MM-DD')
    var year = dateNow.getFullYear()

    let h = dateNow.getHours()
    let m = dateNow.getMinutes()

    var start = new Date(moment(`${year}-01-01 00:00`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    const end = new Date(moment(`${dateTime} ${h}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    console.log("startl : ", start)
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
    var month = dateNow.getMonth()+1

    var inMonth = []
    var endMonth = month
    var startMonth = endMonth-1
    var inboundSum = 0 , outboundSum = 0
    var i = 1

    var lastTime = new Date(moment(`${year}-${endMonth}-01 00:00:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var startTime = new Date(moment(`${year}-${startMonth}-01 00:00:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))

    var inboundMean = 0
    var outboundSumMean = 0
    var isChangeHour = false

    data.forEach(result => {
      let { timestamp, outbound, inbound } = result
      let timeStamped = new Date(moment(timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())

      if (isChangeHour) {
        endMonth = startMonth
        startMonth = endMonth-1
        lastTime = new Date(moment(`${year}-${endMonth}-01 00:00:00.000`,'YYYY-MM-DD HH:mm:ss').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
        startTime = new Date(moment(`${year}-${startMonth}-01 00:00:00.000Z`,'YYYY-MM-DD HH:mm:ss').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
      }
     
      if (startTime < timeStamped){
        isChangeHour = false
        inboundSum += inbound
        outboundSum += outbound
        i++
      } else {
        inboundMean = inboundSum / i
        outboundSumMean = outboundSum / i
        inMonth.push({ id: result.id, timestamp: lastTime, inbound: inboundMean , outbound: outboundSumMean })
        isChangeHour = true
        endMonth = startMonth
        inboundSum = 0
        outboundSum = 0
        i = 0
      }
    })

    if (inboundSum != 0) {
      inboundMean = inboundSum / i
      outboundSumMean = outboundSum / i
      inMonth.push({ id: data[data.length - 1].id, timestamp: lastTime, inbound: inboundMean , outbound: outboundSumMean })
    }
    
    return inMonth
  }

}



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