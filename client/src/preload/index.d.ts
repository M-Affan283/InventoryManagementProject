import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  listSerialPorts: () => Promise<SerialPort.PortInfo[]>,
  getWeightDataEmpty: (port:string, baudRate:number) => Promise<void>,
  getWeightDataFilled: (port:string, baudRate:number) => Promise<void>,
  closePort: () => Promise<void>,
  receiveEmpty: (channel: string, func: (...args: any[]) => void) => () => void,
  receiveFilled: (channel: string, func: (...args: any[]) => void) => () => void,
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
