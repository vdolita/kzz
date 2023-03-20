// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { IpcEvents } from './events';

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
});
