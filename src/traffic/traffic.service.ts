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
      const time = moment.unix(timestamp._seconds).format('HH:mm')
        data.push({ id: result.id, timestamp: time, ...other })
    })
    return data
  }

  async getTrafficDataPick(deviceName: string, startAt: number, endAt: number): Promise<TrafficInterface[]> {   
    const data = []

    const start = new Date(moment.unix(startAt).toString())
    const end = new Date(moment.unix(endAt).toString())

    console.log("start pic",start,"start",+start)
    console.log("end pic",end,"end",+end)

    // CALL FIREBASE
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

    // //LOOP CALL FIREBASE
    // var epochStart = +start
    // var epochEnd = +end
    // var resetEpoch = 0 , multiEpoch = 0
    // console.log("epochStart : ", new Date(epochStart),"epochEnd",new Date(epochEnd))

    // do {
    //   var eEnd = epochStart + 300000
    //   let results = await this.networkRef.doc(deviceName).collection('traffic')
    //     .where("epoch", ">=", epochStart).where("epoch", "<", eEnd)
    //     .get()

    //   if (results.empty) {
    //     epochStart = epochStart + 80000000
    //     resetEpoch++
    //     console.log("in if epochStart : ", new Date(epochStart),"resetEpoch",new Date(resetEpoch))
    //   } else {
    //     results.forEach(result => {
    //       const { timestamp, ...other } = result.data()
    //       const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
    //         data.push({ id: result.id, timestamp: time, ...other })
    //     })
      
    //     multiEpoch = resetEpoch * 80000000
    //     epochStart = epochStart - multiEpoch + 86400000 + 10000
    //     resetEpoch = 0
    //     console.log("in else epochStart : ", new Date(epochStart),"multiEpoch",new Date(multiEpoch))
    //   }

    // } while(epochStart < epochEnd)

    // if (data.length == 0) {
    //   return
    // }

    // data.sort((a, b) => (a.epoch < b.epoch) ? 1 : -1)

    var epochDay = 86400000
    var distanceTime = +end - +start
    var dayAmount = (distanceTime / epochDay | 0)
    var epochDay = start.setDate(dayAmount + start.getDate())
    var startDay = new Date(epochDay)
    var date = start.getDate()

    var inDays = []
    var reduceDay = 0
    var hourTimeShow = moment(startDay,'YYYY-MM-DD HH:mm:ss.SSS').format('DD-MM')

    var timeStamp1 = new Date(moment(data[0].timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
    let isCanCompare = true
    do {
        if (startDay < timeStamp1) {
            isCanCompare = false
        } else {
            reduceDay++
            epochDay = start.setDate(date - reduceDay)
            startDay = new Date(epochDay)
        }
    } while(isCanCompare)

    var calInOut = []
    var inboundResult = 0,outboundResult = 0
    data.forEach(result => {
      let { timestamp, outbound, inbound } = result
      let timeStamped = new Date(moment(timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())

      if (date - reduceDay == 0) {
        date = startDay.getDate()
        reduceDay = 0
      }

      if (startDay < timeStamped) {
        calInOut.push({inbound: inbound, outbound: outbound})
      } else if (calInOut != null) {
        inboundResult = (calInOut[0].inbound > calInOut[calInOut.length - 1].inbound) ? (calInOut[0].inbound - calInOut[calInOut.length - 1].inbound) : (calInOut[calInOut.length - 1].inbound - calInOut[0].inbound);
        outboundResult = (calInOut[0].outbound > calInOut[calInOut.length - 1].outbound) ? (calInOut[0].outbound - calInOut[calInOut.length - 1].outbound) : (calInOut[calInOut.length - 1].outbound - calInOut[0].outbound);
        hourTimeShow = moment(startDay,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('DD-MM')
        inDays.push({ id: result.id, timestamp: hourTimeShow, inbound: inboundResult , outbound: outboundResult })
        reduceDay++
        calInOut = []
        epochDay = start.setDate(date - reduceDay)
        startDay = new Date(epochDay)
        if (startDay < timeStamped) {
          calInOut.push({inbound: inbound, outbound: outbound})
        }
      } else {
        reduceDay++
        epochDay = start.setDate(date - reduceDay)
        startDay = new Date(epochDay)
        if (startDay < timeStamped) {
          calInOut.push({inbound: inbound, outbound: outbound})
        }
      }
    })

    if (calInOut != null) {
      inboundResult = (calInOut[0].inbound > calInOut[calInOut.length - 1].inbound) ? (calInOut[0].inbound - calInOut[calInOut.length - 1].inbound) : (calInOut[calInOut.length - 1].inbound - calInOut[0].inbound);
      outboundResult = (calInOut[0].outbound > calInOut[calInOut.length - 1].outbound) ? (calInOut[0].outbound - calInOut[calInOut.length - 1].outbound) : (calInOut[calInOut.length - 1].outbound - calInOut[0].outbound);
      hourTimeShow = moment(startDay,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('DD-MM')
      inDays.push({ id: data[data.length - 1].id, timestamp: hourTimeShow, inbound: inboundResult , outbound: outboundResult })
    }

    return inDays
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
    var i = 1
    const nano = []

    if  (data[0].inbound != null){
      var intB = data[0].inbound
      var outB = data[0].outbound
  
      data.forEach(result => {
        let { timestamp, outbound, inbound } = result
     
        if (i%5===0) {
          let inVal = 0
          let outVal = 0

          if (inbound >= intB) {
            inVal = inbound - intB
          } else {
            inVal = intB - inbound
          }

          if (outbound >= outB) {
            outVal = outbound - outB
          } else {
            outVal = outB - outbound
          }

          nano.push({ id: result.id, timestamp: timestamp, inbound: inVal , outbound: outVal })
          intB = inbound
          outB = outbound
        } 
        i++
      })
    }


    return nano
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
    var epochHour = 3600000
    var distanceTime = +end - +start
    var hourAmount = (distanceTime / epochHour | 0)
    var epochTime = start.setHours(hourAmount + 7)
    var startTime = new Date(epochTime)
    var inHour = []
    var reduceHour = 0
    var hourTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('HH:mm')

    var timeStamp1 = new Date(moment(data[0].timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())

    let isCanCompare = true
    do {
       if (startTime < timeStamp1) {
            isCanCompare = false
        } else {
            reduceHour++
            epochTime = start.setHours(hourAmount - reduceHour)
            startTime = new Date(epochTime)
        }
    } while(isCanCompare)

    var calInOut = []
    var inboundResult = 0,outboundResult = 0
    data.forEach(result => {
      let { timestamp, outbound, inbound } = result
      let timeStamped = new Date(moment(timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
      if (startTime < timeStamped) {
        calInOut.push({inbound: inbound, outbound: outbound})
      } else if (calInOut != null) {
        hourTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('HH:mm')
        inboundResult = (calInOut[0].inbound > calInOut[calInOut.length - 1].inbound) ? (calInOut[0].inbound - calInOut[calInOut.length - 1].inbound) : (calInOut[calInOut.length - 1].inbound - calInOut[0].inbound);
        outboundResult = (calInOut[0].outbound > calInOut[calInOut.length - 1].outbound) ? (calInOut[0].outbound - calInOut[calInOut.length - 1].outbound) : (calInOut[calInOut.length - 1].outbound - calInOut[0].outbound);
        inHour.push({ id: result.id, timestamp: hourTimeShow, inbound: inboundResult , outbound: outboundResult })
        reduceHour++
        
        calInOut = []
        epochTime = start.setHours(hourAmount - reduceHour)
        startTime = new Date(epochTime)
        if (startTime < timeStamped) {
            calInOut.push({inbound: inbound, outbound: outbound})
        }
      } else {
        reduceHour++
        epochTime = start.setHours(hourAmount - reduceHour)
        startTime = new Date(epochTime)
        if (startTime < timeStamped) {
          calInOut.push({inbound: inbound, outbound: outbound})
        }
      }
      
    })
    // if (calInOut != null) {
    //   inboundResult = (calInOut[0].inbound > calInOut[calInOut.length - 1].inbound) ? (calInOut[0].inbound - calInOut[calInOut.length - 1].inbound) : (calInOut[calInOut.length - 1].inbound - calInOut[0].inbound);
    //   outboundResult = (calInOut[0].outbound > calInOut[calInOut.length - 1].outbound) ? (calInOut[0].outbound - calInOut[calInOut.length - 1].outbound) : (calInOut[calInOut.length - 1].outbound - calInOut[0].outbound);
    //   hourTimeShow = moment(startTime,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('HH:mm')
    //   inHour.push({ id: data[data.length - 1].id, timestamp: hourTimeShow, inbound: inboundResult , outbound: outboundResult })      
    // }
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
    console.log("start : ", start)

    // CALL FIREBASE
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

    // //LOOP CALL FIREBASE
    // var epochStart = +start
    // var epochEnd = +end
    // var resetEpoch = 0 , multiEpoch = 0

    // do {
    //   var eEnd = epochStart + 300000
    //   let results = await this.networkRef.doc(deviceName).collection('traffic')
    //     .where("epoch", ">=", epochStart).where("epoch", "<", eEnd)
    //     .get()

    //   if (results.empty) {
    //     epochStart = epochStart + 80000000
    //     resetEpoch++
    //   } else {
    //     results.forEach(result => {
    //       const { timestamp, ...other } = result.data()
    //       const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
    //         data.push({ id: result.id, timestamp: time, ...other })
    //     })
      
    //     multiEpoch = resetEpoch * 80000000
    //     epochStart = epochStart - multiEpoch + 86400000 + 10000
    //     resetEpoch = 0
    //   }

    // } while(epochStart < epochEnd)

    // if (data.length == 0) {
    //   return
    // }

    // data.sort((a, b) => (a.epoch < b.epoch) ? 1 : -1)

    var epochDay = 86400000
    var distanceTime = +end - +start
    var dayAmount = (distanceTime / epochDay | 0) + 1

    var epochDay = start.setDate(dayAmount)
    var startDay = new Date(epochDay)

    var inDays = []

    var reduceDay = 0
    var hourTimeShow = moment(startDay,'YYYY-MM-DD HH:mm:ss.SSS').format('DD')

    var timeStamp1 = new Date(moment(data[0].timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
    let isCanCompare = true
    do {
        if (startDay < timeStamp1) {
            isCanCompare = false
        } else {
            reduceDay++
            epochDay = start.setDate(dayAmount - reduceDay)
            startDay = new Date(epochDay)
        }
    } while(isCanCompare)

    var calInOut = []
    var inboundResult = 0,outboundResult = 0

    data.forEach(result => {
      let { timestamp, outbound, inbound } = result
      let timeStamped = new Date(moment(timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
      if (startDay < timeStamped) {
        calInOut.push({inbound: inbound , outbound: outbound})
      } else if (calInOut != null) {
        hourTimeShow = moment(startDay,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('DD')
        // value = (condition) ? if : else
        inboundResult = (calInOut[0].inbound > calInOut[calInOut.length - 1].inbound) ? (calInOut[0].inbound - calInOut[calInOut.length - 1].inbound) : (calInOut[calInOut.length - 1].inbound - calInOut[0].inbound);
        outboundResult = (calInOut[0].outbound > calInOut[calInOut.length - 1].outbound) ? (calInOut[0].outbound - calInOut[calInOut.length - 1].outbound) : (calInOut[calInOut.length - 1].outbound - calInOut[0].outbound);
        inDays.push({ id: data[data.length - 1].id, timestamp: hourTimeShow, inbound: inboundResult , outbound: outboundResult })
        reduceDay++
        calInOut = []
        epochDay = start.setDate(dayAmount - reduceDay)
        startDay = new Date(epochDay)
        if (startDay < timeStamped) {
          calInOut.push({inbound: inbound , outbound: outbound})
        }
      } else {
        reduceDay++
        epochDay = start.setDate(dayAmount - reduceDay)
        startDay = new Date(epochDay)
        if (startDay < timeStamped) {
          calInOut.push({inbound: inbound , outbound: outbound})
        }
      }
    })
    
    if (calInOut != null) {
      hourTimeShow = moment(startDay,'YYYY-MM-DD HH:mm:ss.SSS').subtract(7, 'hour').format('DD')
      // value = (condition) ? if : else
      inboundResult = (calInOut[0].inbound > calInOut[calInOut.length - 1].inbound) ? (calInOut[0].inbound - calInOut[calInOut.length - 1].inbound) : (calInOut[calInOut.length - 1].inbound - calInOut[0].inbound);
      outboundResult = (calInOut[0].outbound > calInOut[calInOut.length - 1].outbound) ? (calInOut[0].outbound - calInOut[calInOut.length - 1].outbound) : (calInOut[calInOut.length - 1].outbound - calInOut[0].outbound);
      inDays.push({ id: data[data.length - 1].id, timestamp: hourTimeShow, inbound: inboundResult , outbound: outboundResult })
      reduceDay++
    }

    return inDays
  }

  async getTrafficDataByYear(deviceName: string): Promise<TrafficInterface[]> {   
    const data = []

    const dateNow = new Date(Date.now());
    const dateTime = moment().format('YYYY-MM-DD')
    var year = dateNow.getFullYear()

    let h = dateNow.getHours()
    let m = dateNow.getMinutes()

    var start = new Date(moment(`${year}-01-01 00:00`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var end = new Date(moment(`${dateTime} ${h}:${m}`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    console.log("start year : ", start)
    console.log("end year : ", end)

    // CALL Firebase Data
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

    // var epochStart = +start
    // var epochEnd = +end
    // var resetEpoch = 0 , multiEpoch = 0
    
    // do {
    //   var eEnd = epochStart + 600000
    //   let results = await this.networkRef.doc(deviceName).collection('traffic')
    //     .where("epoch", ">=", epochStart).where("epoch", "<", eEnd)
    //     .get()

    //   if (results.empty) {
    //     epochStart = epochStart + 1300000000
    //     resetEpoch++
    //     console.log("epochStart in if : ", epochStart)
    //     console.log("resetEpoch in if : ", resetEpoch)
    //   } else {
    //     results.forEach(result => {
    //       const { timestamp, ...other } = result.data()
    //       const time = moment.unix(timestamp._seconds).format('HH:mm  DD-MM-YYYY')
    //         data.push({ id: result.id, timestamp: time, ...other })
    //     })
      
    //     multiEpoch = resetEpoch * 1300000000
    //     epochStart = epochStart - multiEpoch + 2505600000
    //     resetEpoch = 0
    //     console.log("epochStart in else : ", epochStart)
    //     console.log("multiEpoch in else : ", multiEpoch)
    //   }

    // } while(epochStart < epochEnd)

    // if (data.length == 0) {
    //   return
    // }

    // data.sort((a, b) => (a.epoch < b.epoch) ? 1 : -1)

    // var epochMonth = 2505600000
    // var distanceTime = +end - +start
    // var monthAmount = (distanceTime / epochMonth | 0)

    // var epochMonth = start.setMonth(monthAmount)
    // var startMonth = new Date(epochMonth)
    // var month = new Date(2020, start.getMonth() + 1  , 0).getDate()

    // if ( month == 31){
    //     epochMonth = 2678400000
    // } else if (month == 30) {
    //     epochMonth = 259200000
    // }  else if (month == 28) {
    //     epochMonth = 2419200000
    // }  else if (month == 29) {
    //     epochMonth = 2505600000
    // } else {
    //     console.log("IS OUT OF AMOUNT DAYS OF MONTH")
    // }

    var month = dateNow.getMonth()+1
    
    var inMonth = []
    var endMonth = month+1
    var startMonth = endMonth-1
    console.log("startMonth",startMonth,"endMonth",endMonth)
    var startTime = new Date(moment(`${year}-${startMonth}-01 00:00:00.000`,'YYYY-MM-DD HH:mm:ss.SSS').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
    var yearTimeFormat = moment(startTime,'YYYY-MM-DD HH:mm:ss').subtract(7, 'hour').format('MM')

    var isChangeHour = false
    var calInOut = []
    var inboundResult = 0,outboundResult = 0

    data.forEach(result => {
      let { timestamp, outbound, inbound } = result
      let timeStamped = new Date(moment(timestamp,'HH:mm DD-MM-YYYY').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())

      if (isChangeHour) {
        endMonth = startMonth
        startMonth = endMonth-1
        startTime = new Date(moment(`${year}-${startMonth}-01 00:00:00.000Z`,'YYYY-MM-DD HH:mm:ss').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ').toString())
      }
     
      if (startTime < timeStamped){
        isChangeHour = false
        calInOut.push({inbound: inbound , outbound: outbound})
      } else {
        inboundResult = (calInOut[0].inbound > calInOut[calInOut.length - 1].inbound) ? (calInOut[0].inbound - calInOut[calInOut.length - 1].inbound) : (calInOut[calInOut.length - 1].inbound - calInOut[0].inbound);
        outboundResult = (calInOut[0].outbound > calInOut[calInOut.length - 1].outbound) ? (calInOut[0].outbound - calInOut[calInOut.length - 1].outbound) : (calInOut[calInOut.length - 1].outbound - calInOut[0].outbound);
        yearTimeFormat = moment(startTime,'YYYY-MM-DD HH:mm:ss').subtract(7, 'hour').format('MM')
        inMonth.push({ id: result.id, timestamp: yearTimeFormat, inbound: inboundResult , outbound: outboundResult })
        console.log("startMonth",startMonth,"endMonth",endMonth)
        isChangeHour = true
        endMonth = startMonth
        calInOut = []
      }
    })

    if (calInOut != null) {
      inboundResult = (calInOut[0].inbound > calInOut[calInOut.length - 1].inbound) ? (calInOut[0].inbound - calInOut[calInOut.length - 1].inbound) : (calInOut[calInOut.length - 1].inbound - calInOut[0].inbound);
      outboundResult = (calInOut[0].outbound > calInOut[calInOut.length - 1].outbound) ? (calInOut[0].outbound - calInOut[calInOut.length - 1].outbound) : (calInOut[calInOut.length - 1].outbound - calInOut[0].outbound);
      yearTimeFormat = moment(startTime,'YYYY-MM-DD HH:mm:ss').subtract(7, 'hour').format('MM')
      inMonth.push({ id: data[data.length - 1].id, timestamp: yearTimeFormat, inbound: inboundResult , outbound: outboundResult })
    }
    
    return inMonth
  }
}
    