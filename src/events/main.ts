import { ipcMain } from 'electron';
import { IpcEvents } from '.';
import { activate } from '../api';
import createKuaishowWindow from '../main/kuaishow';
import { addWindow, getManagerWindow, getWindow, isWindowExist, removeWindow } from '../main/windows';

export function registerEvents() {
    // Register event handlers here
    ipcMain.handle(IpcEvents.ACTIVATE_SOFTWARE, (_, licenseKey) => {
        return activate(licenseKey);
    });

    ipcMain.on(IpcEvents.CREATE_KS_WINDOWS, (_, windowId) => {
        if (isWindowExist(windowId)) {
            return;
        }

        const mw = createKuaishowWindow(windowId);
        mw.on('closed', () => {
            getManagerWindow()?.webContents.send(IpcEvents.KS_WINDOW_CLOSED, windowId);
            removeWindow(windowId);
        });

        mw.on('show', () => {
            getManagerWindow()?.webContents.send(IpcEvents.KS_WINDOW_CREATED, windowId);
        });

        addWindow({
            id: windowId,
            window: mw,
        });
    });

    ipcMain.on(IpcEvents.KS_WINDOW_HIDE, (_, windowId) => {
        if (!isWindowExist(windowId)) {
            return;
        }

        const mw = getWindow(windowId);
        mw?.hide();
    });

    ipcMain.on(IpcEvents.KS_WINDOW_SHOW, (_, windowId) => {
        if (!isWindowExist(windowId)) {
            return;
        }

        const mw = getWindow(windowId);
        mw?.show();
    });
}
