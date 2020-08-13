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

  async getTrafficData(deviceName: string): Promise<TrafficInterface[]> {   
    const data = []
    const dateNow = new Date(Date.now());
    const dateTime = moment().format('YYYY-MM-DD')

    let h = dateNow.getHours()
    let m = dateNow.getMinutes()

    var start = new Date(moment(`${dateTime} 00:00`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var end = new Date(moment(`${dateTime} ${h}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))

    const results = await this.networkRef.doc(deviceName).collection('traffic')
      .where("epoch", ">=", +start).where("epoch", "<", +end)
      .orderBy('epoch', 'desc')
      .get()
      
    if (results.empty) {
      return
    }
    results.forEach(result => {
      const { timestamp, ...other } = result.data()
      const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
        data.push({ id: result.id, timestamp: time, ...other })
    })
    return data
  }

  async getTrafficDataPick(deviceName: string, startAt: number, endAt: number): Promise<TrafficInterface[]> {   
    const data = []
    const dateNow = new Date(Date.now());
    const dateTime = moment().format('YYYY-MM-DD')

    const start = new Date(moment.unix(startAt).add(7, 'hour').toString())
    const end = new Date(moment.unix(endAt).add(7, 'hour').toString())
    console.log("start pic",start)
    console.log("end pic",end)
    const results = await this.networkRef.doc(deviceName).collection('traffic')
      .where("epoch", ">=", +start).where("epoch", "<", +end)
      .orderBy('epoch', 'desc')
      .get()

      
    if (results.empty) {
      return
    }
    results.forEach(result => {
      const { timestamp, ...other } = result.data()
      const time = moment.unix(timestamp._seconds).add(7, 'hour').format('HH:mm  DD-MM-YYYY')
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
    var dayTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('DD-MM-YYYY')
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
        dayTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('DD-MM-YYYY')
        inDay.push({ id: result.id, timestamp: dayTimeShow, inbound: inboundMean , outbound: outboundSumMean })
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
      dayTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('DD-MM-YYYY')
      inDay.push({ id: data[data.length - 1].id, timestamp: dayTimeShow, inbound: inboundMean , outbound: outboundSumMean })
    }

    return inDay
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

    var start = new Date(moment(`${dateTime} ${h}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(6, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var end = new Date(moment(`${dateTime} ${h}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))

    console.log("start hour : ", start)
    console.log("end hour : ", end)

    const results = await this.networkRef.doc(deviceName).collection('traffic')
      .where("epoch", ">=", +start).where("epoch", "<", +end)
      .orderBy('epoch', 'desc')
      .get()
     
    if (results.empty) {
      return
    }

    results.forEach(result => {
      const { timestamp, ...other } = result.data()
      const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
        data.push({ id: result.id, timestamp: time, ...other })
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
    var end = new Date(moment(`${dateTime} ${h}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))

    console.log("start day : ", start)
    console.log("end day : ", end)

    // var epochStart = +start
    // var epochEnd = +end
    // var resetEpoch = 0 , multiEpoch = 0
    
    // do {
    //   var eEnd = epochStart + 300000
    //   let results = await this.networkRef.doc(deviceName).collection('traffic')
    //     .where("epoch", ">=", epochStart).where("epoch", "<", eEnd)
    //     .get()

    //   if (results.empty) {
    //     epochStart = epochStart + 2400000
    //     resetEpoch++
    //     console.log("epochStart in if : ", epochStart)
    //     console.log("resetEpoch in if : ", resetEpoch)
    //   } else {
    //     results.forEach(result => {
    //       const { timestamp, ...other } = result.data()
    //       const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
    //         data.push({ id: result.id, timestamp: time, ...other })
    //     })
      
    //     multiEpoch = resetEpoch * 2400000
    //     epochStart = epochStart - multiEpoch + 3600000
    //     resetEpoch = 0
    //     console.log("epochStart in else : ", epochStart)
    //     console.log("multiEpoch in else : ", multiEpoch)
    //   }

    // } while(epochStart < epochEnd)

    // if (data.length == 0) {
    //   return
    // }

    // data.sort((a, b) => (a.epoch < b.epoch) ? 1 : -1)
    // data.forEach(result => {
    //   console.log("data : ", result)
    // })
    
    const results = await this.networkRef.doc(deviceName).collection('traffic')
      .where("epoch", ">=", +start).where("epoch", "<", +end)
      .orderBy('epoch', 'desc')
      .get()
    
    if (results.empty) {
      return
    }

    results.forEach(result => {
      const { timestamp, ...other } = result.data()
      const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
        data.push({ id: result.id, timestamp: time, ...other })
    })

    var inHour = []
    var endHour = h + 1
    var startHour = endHour-1
    var inboundSum = 0 , outboundSum = 0
    var inboundMean = 0 ,outboundSumMean = 0
    var i = 0

    //var lastTime = new Date(moment(`${dateTime} ${endHour}:00:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var startTime = new Date(moment(`${dateTime} ${startHour}:00:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var hourTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('HH:mm')
    var isChangeHour = false
    
    data.forEach(result => {
      let { timestamp, outbound, inbound } = result
      let timeStamped = new Date(moment(timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
      if (isChangeHour) {
        endHour = startHour
        startHour = endHour-1
        //lastTime = new Date(moment(`${dateTime} ${endHour}:00:00.000Z`,'YYYY-MM-DD HH:mm:ss').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
        startTime = new Date(moment(`${dateTime} ${startHour}:00:00.000Z`,'YYYY-MM-DD HH:mm:ss').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
      }

      if (startTime < timeStamped){
        isChangeHour = false
        inboundSum += inbound
        outboundSum += outbound
        i++
      } else {
        inboundMean = inboundSum / i
        outboundSumMean = outboundSum / i
        hourTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('HH:mm')
        if (inboundMean != null) {
          console.log("inboundMean",inboundMean)
          inHour.push({ id: result.id, timestamp: hourTimeShow, inbound: inboundMean , outbound: outboundSumMean })
        }
        isChangeHour = true
        endHour = startHour
        inboundSum = 0
        outboundSum = 0
        i = 0
      }
    })

    if (inboundSum != 0 && inboundMean != null) {
      inboundMean = inboundSum / i
      outboundSumMean = outboundSum / i
      hourTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('HH:mm')
      inHour.push({ id: data[data.length - 1].id, timestamp: hourTimeShow, inbound: inboundMean , outbound: outboundSumMean })
    }
 
    return inHour
  }

  async getTrafficDataByMonth(deviceName: string): Promise<TrafficInterface[]> {   
    const data = []
    const dateNow = new Date(Date.now());
    const dateTime = moment().format('YYYY-MM-DD')

    var year = dateNow.getFullYear()
    var month = dateNow.getMonth()+1
    let h = dateNow.getHours()
    let m = dateNow.getMinutes()

    var start = new Date(moment(`${year}-${month}-01 00:00`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var end = new Date(moment(`${dateTime} ${h}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))

    console.log("end : ", end)

    const results = await this.networkRef.doc(deviceName).collection('traffic')
      .where("epoch", ">=", +start).where("epoch", "<", +end)
      .orderBy('epoch', 'desc')
      .limit(1)
      .get()
     
    if (results.empty) {
      return
    }

    results.forEach(result => {
      const { timestamp, ...other } = result.data()
      const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
        data.push({ id: result.id, timestamp: time, ...other })
    })

    // var epochStart = +start
    // var epochEnd = +end
    // var resetEpoch = 0 , multiEpoch = 0
    
    // do {
    //   var eEnd = epochStart + 300000
    //   let results = await this.networkRef.doc(deviceName).collection('traffic')
    //     .where("epoch", ">=", epochStart).where("epoch", "<", eEnd)
    //     .get()

    //   if (results.empty) {
    //     epochStart = epochStart + 3600000
    //     resetEpoch++
    //     console.log("epochStart in if : ", epochStart)
    //     console.log("resetEpoch in if : ", resetEpoch)
    //   } else {
    //     results.forEach(result => {
    //       const { timestamp, ...other } = result.data()
    //       const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
    //         data.push({ id: result.id, timestamp: time, ...other })
    //     })
      
    //     multiEpoch = resetEpoch * 3600000
    //     epochStart = epochStart - multiEpoch + 86400000 + 100000
    //     resetEpoch = 0
    //     console.log("epochStart in else : ", epochStart)
    //     console.log("multiEpoch in else : ", multiEpoch)
    //   }

    // } while(epochStart < epochEnd)

    // if (data.length == 0) {
    //   return
    // }

    // data.sort((a, b) => (a.epoch < b.epoch) ? 1 : -1)
    // data.forEach(result => {
    //   console.log("data : ", result)
    // })

    var day = dateNow.getDate()

    var inDay = []
    var endDay = day
    var startDay = endDay-1
    var inboundSum = 0 , outboundSum = 0
    var i = 1

    //var lastTime = new Date(moment(`${dateTime} 23:59:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var startTime = new Date(moment(`${dateTime} 00:00:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var dayTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('DD-MM-YYYY')
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
        dayTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('DD-MM-YYYY')
        inDay.push({ id: result.id, timestamp: dayTimeShow, inbound: inboundMean , outbound: outboundSumMean })
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
      dayTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('DD-MM-YYYY')
      inDay.push({ id: data[data.length - 1].id, timestamp: dayTimeShow, inbound: inboundMean , outbound: outboundSumMean })
    }
    inDay.forEach(resutl => {
      console.log(resutl)
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
    var yearTimeFormat = moment(lastTime,'YYYY-MM-DD HH:mm:ss').subtract(7, 'hour').format('MM-YYYY')

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
        yearTimeFormat = moment(lastTime,'YYYY-MM-DD HH:mm:ss').subtract(7, 'hour').format('MM-YYYY')
        inMonth.push({ id: result.id, timestamp: yearTimeFormat, inbound: inboundMean , outbound: outboundSumMean })
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
      yearTimeFormat = moment(lastTime,'YYYY-MM-DD HH:mm:ss').subtract(7, 'hour').format('MM-YYYY')
      inMonth.push({ id: data[data.length - 1].id, timestamp: yearTimeFormat, inbound: inboundMean , outbound: outboundSumMean })
    }
    
    return inMonth
  }

}