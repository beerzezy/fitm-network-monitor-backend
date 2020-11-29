import { Injectable } from '@nestjs/common'
import { CollectionReference } from '@google-cloud/firestore'
import { db } from '../database/firebase.config'
import { InterfaceInterface } from './interface.interface'

@Injectable()
export class InterfaceService {
  private readonly networkRef: CollectionReference

  constructor() {
    this.networkRef = db.collection('network')
  }

  async getAllInterface(deviceName: string): Promise<InterfaceInterface[]> {
    const interfaceValue = []
    const allInterfaces = await this.networkRef.doc(deviceName).collection('interface').get()
    allInterfaces.forEach(eachInterface => {
      const name = eachInterface.id.replace(/-/g, '/')
      interfaceValue.push({ interface: name, ...eachInterface.data() })
    })

    return interfaceValue
  }

  async getInterfaceByName(deviceName: string, interfaceName: string): Promise<any> {
    const result = await this.networkRef.doc(deviceName).collection('interface').doc(interfaceName).get()
    const name = result.id.replace(/-/g, '/')

    return { interfaceName: name, ...result.data() }
  }

  async getInterfaceInboundTopRank(rank: number) {
    const data = []
    const results = await db.collectionGroup('interface').orderBy('inbound', 'desc').get()

    results.forEach(result => {
      let term = 'Vlan'
      let search = new RegExp(term , 'i')
      
      if (search.test(result.id) == true) {
        const name = result.id.replace(/-/g, '/').replace("unrouted ", "")
        let placeName = ""
        if (name == "VLAN 1005" || name ==  "VLAN 1004" ||name == "VLAN 1003" || name == "VLAN 1002" || name == "VLAN 1" || name == "VLAN 446") { //r101c
          placeName = "co-working space (B1-01)"
        } else if (name == "Vlan100" || name == "Vlan206" || name == "Vlan305" || name == "Vlan413" || name == "Vlan51" || name == "Vlan52" || name == "Vlan53" || name == "Vlan54" || name == "Vlan55" || name == "Vlan56" || name == "Vlan57" || name == "Vlan58" || name == "Vlan59" || name == "Vlan60" || name == "Vlan602" || name == "Vlan608" || name == "Vlan604" || name == "Vlan666" || name == "Vlan9" || name == "Vlan99") {
          placeName = "ห้องปฏิบัติการเครือข่าย (B4-15)"
        } else if (name == "Vlan606" || name == "Vlan620") {
          placeName = "ห้องพวงแสด"
        } else if (name == "Vlan1" || name == "Vlan31"|| name == "Vlan32"|| name == "Vlan33"|| name == "Vlan34") {
          placeName = "ห้องภาควิชาจักรกลเกษตร (B3-30A)"
        } else if (name == "Vlan111" || name == "Vlan150" || name == "Vlan247" || name == "Vlan247" || name == "Vlan304" || name == "Vlan305" || name == "Vlan310" || name == "Vlan323" || name == "Vlan399" || name == "Vlan415" || name == "Vlan43" || name == "Vlan44" || name == "Vlan45" || name == "Vlan46" || name == "Vlan47" || name == "Vlan59" || name == "Vlan600" || name == "Vlan606" || name == "Vlan611" || name == "Vlan612" || name == "Vlan613" || name == "Vlan620" || name == "Vlan777" || name == "Vlan88" || name == "Vlan99"){
          placeName = "ห้องวิทยาการสารสนเทศ (B4-01)"
        }
        data.push({ interface: name, place: placeName, ...result.data() })
      }
    })
    
    return data.slice(0, 10)
  }

  async getInterfaceOutboundTopRank(rank: number) {
    const data = []
    const results = await db.collectionGroup('interface').orderBy('outbound', 'desc').get()
    results.forEach(result => {
      let term = 'Vlan'
      let search = new RegExp(term , 'i')

      if (search.test(result.id) == true) {
        const name = result.id.replace(/-/g, '/').replace("unrouted ", "")
        let placeName = ""
        if (name == "VLAN 1005" || name ==  "VLAN 1004" ||name == "VLAN 1003" || name == "VLAN 1002" || name == "VLAN 1" || name == "VLAN 446") { //r101c
          placeName = "co-working space (B1-01)"
        } else if (name == "Vlan100" || name == "Vlan206" || name == "Vlan305" || name == "Vlan413" || name == "Vlan51" || name == "Vlan52" || name == "Vlan53" || name == "Vlan54" || name == "Vlan55" || name == "Vlan56" || name == "Vlan57" || name == "Vlan58" || name == "Vlan59" || name == "Vlan60" || name == "Vlan602" || name == "Vlan608" || name == "Vlan604" || name == "Vlan666" || name == "Vlan9" || name == "Vlan99") {
          placeName = "ห้องปฏิบัติการเครือข่าย (B4-15)"
        } else if (name == "Vlan606" || name == "Vlan620") {
          placeName = "ห้องพวงแสด"
        } else if (name == "Vlan1" || name == "Vlan31"|| name == "Vlan32"|| name == "Vlan33"|| name == "Vlan34") {
          placeName = "ห้องภาควิชาจักรกลเกษตร (B3-30A)"
        } else if (name == "Vlan111" || name == "Vlan150" || name == "Vlan247" || name == "Vlan247" || name == "Vlan304" || name == "Vlan305" || name == "Vlan310" || name == "Vlan323" || name == "Vlan399" || name == "Vlan415" || name == "Vlan43" || name == "Vlan44" || name == "Vlan45" || name == "Vlan46" || name == "Vlan47" || name == "Vlan59" || name == "Vlan600" || name == "Vlan606" || name == "Vlan611" || name == "Vlan612" || name == "Vlan613" || name == "Vlan620" || name == "Vlan777" || name == "Vlan88" || name == "Vlan99"){
          placeName = "ห้องวิทยาการสารสนเทศ (B4-01)"
        }
        data.push({ interface: name, place: placeName, ...result.data() })
      }
    })

    return data.slice(0, 10)
  }
}
