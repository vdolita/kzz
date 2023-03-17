import { ipcMain } from "electron";
import { IpcEvents } from ".";
import { activate } from "../api";

export function registerEvents() {
    // Register event handlers here
    ipcMain.handle(IpcEvents.ACTIVATE_SOFTWARE, (_, licenseKey) => {
        return activate(licenseKey);
    });
}
