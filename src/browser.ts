import { BrowserView } from "electron";

let view

function createBrowserView() {
    view = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
        },
    });

    view.webContents.loadURL("https://www.google.com");
    return view;
}

export { createBrowserView }