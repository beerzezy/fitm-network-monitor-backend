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

        if (name == "Vlan43") {
          placeName = "(B4-01A)"
        } else if (name == "Vlan44") {
          placeName = "(B4-01B)"
        }  else if (name == "Vlan45") {
          placeName = "(B4-02)"
        } else if (name == "Vlan46") {
          placeName = "(Other)"
        } else if (name == "Vlan47") {
          placeName = "(AP)"
        } else if (name == "Vlan304") {
          placeName = "(SW3850)"
        } else if (name == "Vlan323") {
          placeName = "(B3-23)"
        } else if (name == "Vlan600") {
          placeName = "(401-AP)"
        } else if (name == "Vlan606") {
          placeName = "(C104-AP)"
        } else if (name == "Vlan611") {
          placeName = "(FITM-Staff)"
        } else if (name == "Vlan612") {
          placeName = "(FITM-Student)"
        } else if (name == "Vlan613") {
          placeName = "(FITM-Visitor)"
        } else if (name == "Vlan620") {
          placeName = "(Old Puangsad)"
        } else if (name == "Vlan777") {
          placeName = "(Server)"
        } else if (name == "Vlan305") {
          placeName = "(Signage)"
        } else if (name == "Vlan51") {
          placeName = "(B4-08)"
        } else if (name == "Vlan52") {
          placeName = "(B4-09)"
        } else if (name == "Vlan53") {
          placeName = "(B4-11)"
        } else if (name == "Vlan54") {
          placeName = "(B4-15)"
        } else if (name == "Vlan55") {
          placeName = "(B4-16)"
        } else if (name == "Vlan56") {
          placeName = "(B4-17)"
        } else if (name == "Vlan58") {
          placeName = "(AP)"
        } else if (name == "Vlan206") {
          placeName = "(CharpFL2)"
        } else if (name == "Vlan305") {
          placeName = "(TV)"
        } else if (name == "Vlan413") {
          placeName = "(B4-13)"
        }  else if (name == "Vlan602") {
          placeName = "(415-AP)"
        } else if (name == "Vlan604") {
          placeName = "(216-AP)"
        } else if (name == "Vlan608") {
          placeName = "(121-AP)"
        } else if (name == "Vlan666") {
          placeName = "(Server46)"
        } else if (name == "Vlan603") {
          placeName = "(330A-AP)"
        } else if (name == "VLAN 446") {
          placeName = "(2.02.44.46.0)"
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
        if (name == "Vlan43") {
          placeName = "(B4-01A)"
        } else if (name == "Vlan44") {
          placeName = "(B4-01B)"
        }  else if (name == "Vlan45") {
          placeName = "(B4-02)"
        } else if (name == "Vlan46") {
          placeName = "(Other)"
        } else if (name == "Vlan47") {
          placeName = "(AP)"
        } else if (name == "Vlan304") {
          placeName = "(SW3850)"
        } else if (name == "Vlan323") {
          placeName = "(B3-23)"
        } else if (name == "Vlan600") {
          placeName = "(401-AP)"
        } else if (name == "Vlan606") {
          placeName = "(C104-AP)"
        } else if (name == "Vlan611") {
          placeName = "(FITM-Staff)"
        } else if (name == "Vlan612") {
          placeName = "(FITM-Student)"
        } else if (name == "Vlan613") {
          placeName = "(FITM-Visitor)"
        } else if (name == "Vlan620") {
          placeName = "(Old Puangsad)"
        } else if (name == "Vlan777") {
          placeName = "(Server)"
        } else if (name == "Vlan305") {
          placeName = "(Signage)"
        } else if (name == "Vlan51") {
          placeName = "(B4-08)"
        } else if (name == "Vlan52") {
          placeName = "(B4-09)"
        } else if (name == "Vlan53") {
          placeName = "(B4-11)"
        } else if (name == "Vlan54") {
          placeName = "(B4-15)"
        } else if (name == "Vlan55") {
          placeName = "(B4-16)"
        } else if (name == "Vlan56") {
          placeName = "(B4-17)"
        } else if (name == "Vlan58") {
          placeName = "(AP)"
        } else if (name == "Vlan206") {
          placeName = "(CharpFL2)"
        } else if (name == "Vlan305") {
          placeName = "(TV)"
        } else if (name == "Vlan413") {
          placeName = "(B4-13)"
        }  else if (name == "Vlan602") {
          placeName = "(415-AP)"
        } else if (name == "Vlan604") {
          placeName = "(216-AP)"
        } else if (name == "Vlan608") {
          placeName = "(121-AP)"
        } else if (name == "Vlan666") {
          placeName = "(Server46)"
        } else if (name == "Vlan603") {
          placeName = "(330A-AP)"
        } else if (name == "VLAN 446") {
          placeName = "(202.44.46.0)"
        }  
        data.push({ interface: name, place: placeName, ...result.data() })
      }
    })

    return data.slice(0, 10)
  }
}
