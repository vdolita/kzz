import { ipcMain } from 'electron';
import { timer } from 'rxjs/internal/observable/timer';
import { IpcEvents } from '.';
import { activate } from '../main/api';
import { AppDBData, getAppDB, getKsDB, KsDBData } from '../main/db';
import createKuaishowWindow from '../main/kuaishow';
import { addWindow, getManagerWindow, getWindow, isWindowExist, removeWindow } from '../main/windows';

export function registerEvents() {
    // Register event handlers here
    ipcMain.handle(IpcEvents.ACTIVATE_SOFTWARE, async (_, licenseKey) => {
        const res = await activate(licenseKey);
        return res;
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

    ipcMain.handle(IpcEvents.KS_DB_GET, async () => {
        const db = await getKsDB();
        return db.data;
    });

    ipcMain.handle(IpcEvents.KS_DB_SET, async (_, data: KsDBData) => {
        const db = await getKsDB();
        db.data = data;
        await db.write();
    });

    ipcMain.handle(IpcEvents.APP_DB_GET, async () => {
        const db = await getAppDB();
        return db.data;
    });

    ipcMain.handle(IpcEvents.APP_DB_SET, async (_, data: AppDBData) => {
        const db = await getAppDB();
        db.data = data;
        await db.write();
    });

    ipcMain.on(IpcEvents.TRIAL_START, async (_, windowId: string) => {
        const db = await getAppDB();
        db.data.isTried = true;
        await db.write();

        // close window after 15 minutes
        timer(1000 * 60 * 15).subscribe(() => {
            const mw = getWindow(windowId);
            mw?.close();
        });
    });
}
