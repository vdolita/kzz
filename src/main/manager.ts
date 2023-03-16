import { BrowserWindow } from "electron"

function createManagerWindow(entryPath: string, preloadPath: string) {
    const managerWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: preloadPath,
        },
        show: false,
    })

    managerWindow.loadURL(entryPath)

    // managerWindow.webContents.openDevTools()

    managerWindow.once("ready-to-show", () => {
        managerWindow.show()
    })

    return managerWindow;
}

export default createManagerWindow