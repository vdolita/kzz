import { BrowserView, BrowserWindow } from "electron"
import { fromEvent } from "rxjs/internal/observable/fromEvent";
import { timer } from "rxjs/internal/observable/timer";
import { debounce } from "rxjs/internal/operators/debounce";

const kzzWidth = 1440
const kzzHeight = 800
const toolHeight = 0

function createKzzWindow(entry: string, preload: string, tool: string) {
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

    mainWindow.removeMenu()
    // and load the index.html of the app.
    mainWindow.loadURL(entry);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    const bv = new BrowserView({
        webPreferences: {
            preload: preload,
        }
    })
    mainWindow.setBrowserView(bv)
    bv.setAutoResize({ width: true, height: true })
    const titleBarHeight = mainWindow.getSize()[1] - mainWindow.getContentSize()[1]

    bv.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        const { responseHeaders } = details

        if (responseHeaders['content-security-policy']) {
            responseHeaders['content-security-policy'] = responseHeaders['content-security-policy'].map((policy: string) => {
                return policy.replace("'unsafe-eval'", `'unsafe-eval' http://localhost:3000 ws://localhost:3000 file: ws: kzz:`)
                    .replace('font-src http:', 'font-src http: kzz:')
                    .replace('connect-src', 'connect-src ws:')
            })
        }

        callback({ responseHeaders })
    })


    bv.setBounds({ x: 0, y: titleBarHeight, width: kzzWidth, height: kzzHeight - titleBarHeight - toolHeight })
    bv.webContents.openDevTools()
    bv.webContents.loadURL("https://zs.kwaixiaodian.com/page/helper")

    bv.webContents.on('did-finish-load', () => {
        const url = bv.webContents.getURL()
        if (url.includes("page/helper")) {
            const src = tool.replace('file:', 'kzz:')

            bv.webContents.executeJavaScript(`
                const js = document.createElement('script')
                js.src = '${src}'
                document.body.appendChild(js)
            `).catch(console.error)
        }
    })

    fromEvent(mainWindow, 'resize')
        .pipe(debounce(() => timer(20)))
        .subscribe(() => {
            const [width, height] = mainWindow.getSize()
            bv.setBounds({ x: 0, y: titleBarHeight, width, height: height - titleBarHeight - toolHeight })
        })

    mainWindow.once("ready-to-show", () => {
        mainWindow.show()
    })
}

export { createKzzWindow }