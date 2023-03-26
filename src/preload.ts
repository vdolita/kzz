// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { IpcEvents } from './events';
import { AppDBData, KsDBData } from './main/db';

contextBridge.exposeInMainWorld('Asuka', {
    activateSoftware: (licenseKey: string) => ipcRenderer.invoke(IpcEvents.ACTIVATE_SOFTWARE, licenseKey),
    onWindowCreated: (callback: (windowId: string) => void) => {
        ipcRenderer.on(IpcEvents.KS_WINDOW_CREATED, (_, windowId: string) => {
            callback(windowId);
        });
    },
    onWindowClosed: (callback: (windowId: string) => void) => {
        ipcRenderer.on(IpcEvents.KS_WINDOW_CLOSED, (_, windowId: string) => {
            callback(windowId);
        });
    },
    openKsWindow: (windowId: string) => {
        ipcRenderer.send(IpcEvents.CREATE_KS_WINDOWS, windowId);
    },
    hideKsWindow: (windowId: string) => {
        ipcRenderer.send(IpcEvents.KS_WINDOW_HIDE, windowId);
    },
    showKsWindow: (windowId: string) => {
        ipcRenderer.send(IpcEvents.KS_WINDOW_SHOW, windowId);
    },
    getKsDB: async () => {
        const data = await ipcRenderer.invoke(IpcEvents.KS_DB_GET);
        return data;
    },
    setKsDB: async (data: KsDBData) => {
        return await ipcRenderer.invoke(IpcEvents.KS_DB_SET, data);
    },
    getAppDB: async () => {
        const data = await ipcRenderer.invoke(IpcEvents.APP_DB_GET);
        return data;
    },
    setAppDB: async (data: AppDBData) => {
        return await ipcRenderer.invoke(IpcEvents.APP_DB_SET, data);
    },
    startTrial: async (windowId: string) => {
        return await ipcRenderer.send(IpcEvents.TRIAL_START, windowId);
    },
});
