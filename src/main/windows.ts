import { BrowserWindow } from 'electron';

export interface WindowObject {
    id: string;
    window: BrowserWindow;
}

const windows: WindowObject[] = [];

let managerWindow: BrowserWindow | null = null;

export function setManagerWindow(w: BrowserWindow) {
    managerWindow = w;
}

export function getManagerWindow() {
    return managerWindow;
}

export function addWindow(w: WindowObject) {
    windows.push(w);
}

export function removeWindow(id: string) {
    const index = windows.findIndex((w) => w.id === id);
    if (index >= 0) {
        windows.splice(index, 1);
    }
}

export function getWindow(id: string) {
    return windows.find((w) => w.id === id);
}

export function isWindowExist(id: string) {
    return windows.some((w) => w.id === id);
}

export function getWindows() {
    return windows;
}
