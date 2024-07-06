import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { SerialPort } from 'serialport'
import { ReadlineParser } from 'serialport' 

let mainWindow;

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  let serialPort;


  ipcMain.handle('list-serial-ports', async () =>
  {
    try
    {
      const ports = await SerialPort.list()
      return ports
    }
    catch (error)
    {
      console.error(error)
      return []
    }
  })

  //device is on com4 and baud rate is 9600
  ipcMain.handle('get-weight-data-base', async (_event, port:string, baudRate:number) =>
  {
    console.log("Getting weight data: ",port);     // const port = 'COM5';
    console.log("Baud Rate: ", baudRate)
    // const baudRate = baudRate || 1200;
    //set delimiter to '=' since incoming data is in format 0082.000=0082.000=0099.000= and so on. Each weight is separated by '='.

    serialPort = new SerialPort({path: port, baudRate: baudRate, autoOpen: false});
    const parser = serialPort.pipe(new ReadlineParser({delimiter: '='}));

    serialPort.open(function (err) {
      if (err) {
        return console.log('Error opening port: ', err.message);
      }
    
      // Because there's no callback to write, write errors will be emitted on the port:
      serialPort.write('main screen turn on');
    });
  

    serialPort.on('open', ()=>
    {
      console.log("Port opened");
    })

    //close
    serialPort.on('close', ()=>
    {
      console.log("Port closed")
    })

    //close port on premature exit of program
    process.on('exit', ()=>
    {
      //if port is open, close it
      serialPort.isOpen ? serialPort.close() : console.log("Port already closed")
    })

    parser.on('error', (error)=>
    {
      console.log("Parser Error: ", error.message)
    })

    serialPort.on('error', (error)=>
    {
      console.log("Port Error: ", error)
    })

    parser.on('data', (data)=>
    {
      // data = data.replace(/0+$/g, '')
      // data = data.replace(/^0+/g, '')
      // data = data.split('').reverse().join('')
      // console.log(data)
      const dataString = data.toString().trim(); // Trim any surrounding whitespace

      // Check if data is valid
      if (/^\d+\.\d+$/.test(dataString))
      {
          // Reverse the string
          const reversedString = dataString.split('').reverse().join('');

          // Insert the decimal point at the correct position
          const formattedWeight = reversedString.replace(/^(\d{3})(\d*)$/, '$2.$1');

          const weight = parseFloat(formattedWeight);

          console.log(weight + " kg");

          if(mainWindow)
          {
            mainWindow.webContents.send('weight-data-base', weight)
          }
      }
      else
      {
          console.log('No valid data to process');
      }
    
    })
  })
  
  ipcMain.handle('get-weight-data-final', async (_event, port:string, baudRate:number) =>
  {
    console.log("Getting weight data: ",port)
    console.log("Baud Rate: ", baudRate)

    // const port = 'COM5';
    // const baudRate = 1200;
    //set delimiter to '=' since incoming data is in format 0082.000=0082.000=0099.000= and so on. Each weight is separated by '='.

    serialPort = new SerialPort({path: port, baudRate: baudRate, autoOpen: false});
    const parser = serialPort.pipe(new ReadlineParser({delimiter: '='}));

    serialPort.open(function (err) {
      if (err) {
        return console.log('Error opening port: ', err.message);
      }
    
      // Because there's no callback to write, write errors will be emitted on the port:
      serialPort.write('main screen turn on');
    });
  

    serialPort.on('open', ()=>
    {
      console.log("Port opened");
    })

    //close
    serialPort.on('close', ()=>
    {
      console.log("Port closed")
    })

    //close port on premature exit of program
    process.on('exit', ()=>
    {
      //if port is open, close it
      serialPort.isOpen ? serialPort.close() : console.log("Port already closed")
    })

    parser.on('error', (error)=>
    {
      console.log("Parser Error: ", error.message)
    })

    serialPort.on('error', (error)=>
    {
      console.log("Port Error: ", error)
    })

    parser.on('data', (data)=>
    {
      // data = data.replace(/0+$/g, '')
      // data = data.replace(/^0+/g, '')
      // data = data.split('').reverse().join('')
      // console.log(data)
      const dataString = data.toString().trim(); // Trim any surrounding whitespace

      // Check if data is valid
      if (/^\d+\.\d+$/.test(dataString))
      {
          // Reverse the string
          const reversedString = dataString.split('').reverse().join('');

          // Insert the decimal point at the correct position
          const formattedWeight = reversedString.replace(/^(\d{3})(\d*)$/, '$2.$1');

          const weight = parseFloat(formattedWeight);

          // console.log(weight + " kg");

          if(mainWindow)
          {
            mainWindow.webContents.send('weight-data-final', weight)
          }
      }
      else
      {
          console.log('No valid data to process');
      }
    
    })
  })
    

  ipcMain.handle('close-port', async () =>
  {
    console.log("Closing port")
    //close port
    if(serialPort.isOpen)
    {
      serialPort.close()
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
