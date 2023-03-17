import { BrowserView, BrowserWindow } from "electron";
import { isDev } from "../utils/app";


const ksWidth = 1440;
const ksHeight = 800;

const ksUrl = "https://zs.kwaixiaodian.com/page/helper";

function createKuaishowWindow(toolPath: string, key: string) {
    const mw = new BrowserWindow({
        width: ksWidth,
        height: ksHeight,
        webPreferences: {
            partition: `memory:${key}`,
            devTools: false,
        },
        minWidth: ksWidth,
        minHeight: ksHeight,
        show: false,
    });

    mw.removeMenu();

    const bv = new BrowserView({
        webPreferences: {
            devTools: isDev(),
        }
    })
    mw.setBrowserView(bv)
    bv.setAutoResize({ width: true, height: true })
    // const titleBarHeight = mw.getSize()[1] - mw.getContentSize()[1]

    bv.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        const { responseHeaders } = details

        if (responseHeaders['content-security-policy']) {
            responseHeaders['content-security-policy'] = responseHeaders['content-security-policy'].map((policy: string) => {
                return policy.replace("'unsafe-eval'", `'unsafe-eval' http://localhost:3000 ws://localhost:3000 file: ws: kzz:`)
                    .replace('connect-src', 'connect-src ws:')
            })
        }

        callback({ responseHeaders })
    })

    bv.setBounds({ x: 0, y: 0, width: ksWidth, height: ksHeight })
    bv.webContents.openDevTools()
    bv.webContents.loadURL(ksUrl)

    bv.webContents.on('did-finish-load', () => {
        const url = bv.webContents.getURL()
        if (url.includes("page/helper")) {
            const src = toolPath.replace('file:', 'kzz:')

            bv.webContents.executeJavaScript(`
                const js = document.createElement('script')
                js.src = '${src}'
                document.body.appendChild(js)
            `).catch(console.error)
        }
    })

    bv.webContents.once('dom-ready', () => {
        mw.show()
    })

    return mw;
}

export default createKuaishowWindow