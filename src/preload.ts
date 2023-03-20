// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { IpcEvents } from './events';

contextBridge.exposeInMainWorld('Asuka', {
    activateSoftware: (licenseKey: string) => ipcRenderer.invoke(IpcEvents.ACTIVATE_SOFTWARE, licenseKey),
    onWindowCreated: (callback: (windowId: number) => void) => {
        ipcRenderer.on(IpcEvents.KS_WINDOW_CREATED, (_, windowId: number) => {
            callback(windowId);
        });
    },
    onWindowClosed: (callback: (windowId: number) => void) => {
        ipcRenderer.on(IpcEvents.KS_WINDOW_CLOSED, (_, windowId: number) => {
            callback(windowId);
        });
    },
    openKsWindow: (windowId: number) => {
        ipcRenderer.send(IpcEvents.CREATE_KS_WINDOWS, windowId);
    },
});
