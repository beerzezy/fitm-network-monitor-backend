import { IsNotEmpty } from 'class-validator'

export class DeviceBody {
    @IsNotEmpty()
    deviceIp: string
    @IsNotEmpty()
    oid: any
}