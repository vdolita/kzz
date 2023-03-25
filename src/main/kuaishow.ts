import { BrowserWindow, dialog } from 'electron';
import { isDev } from '../utils/app';
import fs from 'fs';
import path from 'path';
import { registerFileProtocol } from './protocol';

const ksWidth = 1440;
const ksHeight = 800;
declare const TOOL_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const ksUrl = 'https://zs.kwaixiaodian.com/page/helper';

function createKuaishowWindow(key: string) {
    const mw = new BrowserWindow({
        width: ksWidth,
        height: ksHeight,
        minWidth: ksWidth,
        minHeight: ksHeight,
        show: false,
        webPreferences: {
            partition: `persist:ksw${key}`,
            devTools: isDev(),
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        minimizable: false,
    });

    mw.removeMenu();
    mw.setTitle(`助手 - ${key}`);

    registerFileProtocol(mw.webContents.session);
    mw.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        const { responseHeaders } = details;

        if (responseHeaders['content-security-policy']) {
            responseHeaders['content-security-policy'] = responseHeaders['content-security-policy'].map(
                (policy: string) => {
                    return policy
                        .replace(
                            "'unsafe-eval'",
                            `'unsafe-eval' http://localhost:3000 ws://localhost:3000 file: ws: kzz:`,
                        )
                        .replace('connect-src', 'connect-src ws:');
                },
            );
        }

        callback({ responseHeaders });
    });

    mw.webContents.openDevTools();
    mw.loadURL(ksUrl);

    mw.webContents.on('did-finish-load', () => {
        const url = mw.webContents.getURL();
        if (url.includes('page/helper')) {
            let toolPath = TOOL_WEBPACK_ENTRY;

            if (toolPath.includes('file:') && !fs.existsSync(toolPath)) {
                toolPath = path.join(process.resourcesPath, 'app', '.webpack', 'renderer', 'tool', 'index.js');
                toolPath = toolPath.replace(/\\/g, '/');
                toolPath = `file://${toolPath}`;
            }

            const src = toolPath.replace('file:', 'kzz:').replace(/\\/g, '/');

            mw.webContents
                .executeJavaScript(
                    `
                const js = document.createElement('script')
                js.src = '${src}'
                document.body.appendChild(js)
            `,
                )
                .catch(console.error);
        }
    });

    mw.webContents.once('dom-ready', () => {
        mw.show();
    });

    mw.once('minimize', () => {
        dialog.showMessageBox({
            type: 'info',
            title: '提示',
            message: '请不要最小化工具窗口, 否则可能导致工具无法正常使用',
            buttons: ['确定'],
        });
    });

    return mw;
}

export default createKuaishowWindow;
