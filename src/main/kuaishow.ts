import { BrowserView, BrowserWindow, dialog } from 'electron';
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
            partition: `memory:${key}`,
            devTools: false,
        },
        minimizable: false,
    });

    mw.removeMenu();
    mw.setTitle(`助手 - ${key}`);

    const bv = new BrowserView({
        webPreferences: {
            devTools: isDev(),
            partition: `persist:ksw${key}`,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });
    mw.setBrowserView(bv);
    bv.setAutoResize({ width: true, height: true });

    registerFileProtocol(bv.webContents.session);
    bv.webContents.session.webRequest.onHeadersReceived((details, callback) => {
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

    bv.setBounds({ x: 0, y: 0, width: mw.getContentSize()[0], height: mw.getContentSize()[1] });
    bv.webContents.openDevTools();
    bv.webContents.loadURL(ksUrl);

    bv.webContents.on('did-finish-load', () => {
        const url = bv.webContents.getURL();
        if (url.includes('page/helper')) {
            let toolPath = TOOL_WEBPACK_ENTRY;

            if (toolPath.includes('file:') && !fs.existsSync(toolPath)) {
                toolPath = path.join(process.resourcesPath, 'app', '.webpack', 'renderer', 'tool', 'index.js');
                toolPath = toolPath.replace(/\\/g, '/');
                toolPath = `file://${toolPath}`;
            }

            const src = toolPath.replace('file:', 'kzz:').replace(/\\/g, '/');
            bv.webContents.executeJavaScript(`;console.log('toolPath', '${src}');`);

            bv.webContents
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

    bv.webContents.once('dom-ready', () => {
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
