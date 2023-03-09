import { BrowserView, BrowserWindow } from "electron"
import { debounce, fromEvent, timer } from "rxjs";

const kzzWidth = 1320
const kzzHeight = 800

function createKzzWindow(entry: string, preload: string) {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: kzzHeight,
        width: kzzWidth,
        webPreferences: {
            preload: preload,
        },
        minWidth: kzzWidth,
        minHeight: kzzHeight,
        show: false,
    });

    // and load the index.html of the app.
    mainWindow.loadURL(entry);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    const bv = new BrowserView({
        webPreferences: {
            preload: preload,
        }
    })
    mainWindow.setBrowserView(bv)
    bv.setAutoResize({ width: true, height: true })
    const titleBarHeight = mainWindow.getSize()[1] - mainWindow.getContentSize()[1]

    bv.setBounds({ x: 0, y: titleBarHeight, width: kzzWidth, height: kzzHeight - titleBarHeight })
    bv.webContents.openDevTools()
    bv.webContents.loadURL("https://login.kwaixiaodian.com/")

    bv.webContents.on("did-finish-load", () => {
        bv.webContents.executeJavaScript(`kzz.NewToolBar()`);
    })

    fromEvent(mainWindow, 'resize')
        .pipe(debounce(() => timer(20)))
        .subscribe(() => {
            const [width, height] = mainWindow.getSize()
            bv.setBounds({ x: 0, y: 0, width, height: height - 200 })
        })

    mainWindow.once("ready-to-show", () => {
        mainWindow.show()
    })
}

export { createKzzWindow }