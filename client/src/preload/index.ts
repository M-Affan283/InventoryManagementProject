import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  listSerialPorts: () => ipcRenderer.invoke('list-serial-ports'),
  getWeightDataEmpty: (port:string, baudRate:number) => ipcRenderer.invoke('get-weight-data-base',port, baudRate),
  getWeightDataFilled: (port:string, baudRate:number) => ipcRenderer.invoke('get-weight-data-final',port, baudRate),
  closePort: () => ipcRenderer.invoke('close-port'),
  receiveEmpty: (channel:any, func:any):any => {
    const validChannels = ['weight-data-base'];
    if (validChannels.includes(channel)) {
      const subscription = (event, ...args) => func(event, ...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
  },
  receiveFilled: (channel:any, func:any):any => {
    const validChannels = ['weight-data-final'];
    if (validChannels.includes(channel)) {
      const subscription = (event, ...args) => func(event, ...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
