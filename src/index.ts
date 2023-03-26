import { app, autoUpdater, BrowserWindow, dialog } from 'electron';
import { registerEvents } from './events/main';
import verifyLicense from './main/api/verification';
import { clearAppDB, getAppDB } from './main/db';
import createManagerWindow from './main/manager';
import createQuickToolWindow from './main/tool';
import { setManagerWindow } from './main/windows';
import { isDev } from './utils/app';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = (): void => {
    // Create the browser window.
    const mw = createManagerWindow();
    setManagerWindow(mw);

    // for tool development
    isDev() && createQuickToolWindow();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    registerEvents();
    await updateExpireLicenses();
    createWindow();
    checkUpdate();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function checkUpdate() {
    const url = `https://duck.vdolita.com/update/${process.platform}/${app.getVersion()}`;
    autoUpdater.setFeedURL({ url });

    autoUpdater.on('update-downloaded', (_, releaseNotes, releaseName) => {
        const dialogOpts = {
            type: 'info',
            buttons: ['立即安装', '稍后'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: '新版本已经下载完毕，是否立即安装？',
        };

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall();
        });
    });

    autoUpdater.on('error', (message) => {
        console.error('There was a problem updating the application');
        console.error(message);
    });

    if (app.isPackaged) {
        autoUpdater.checkForUpdates();
    }
}

async function updateExpireLicenses() {
    const db = await getAppDB();

    if (isDev()) {
        await clearAppDB();
    }

    const licenses = db.data.licenses;

    // check if license is expired
    for (const license of licenses) {
        // compare expired
        const expDate = new Date(license.expireAt);
        const now = new Date();
        if (expDate.getTime() < now.getTime()) {
            license.isValid = false;
        }
    }

    await db.write();

    // check if license is expired
    const result = await verifyLicense(licenses);

    if (result) {
        db.data.licenses = db.data.licenses.map((o) => {
            const newLicense = result.find((n) => o.licenseKey === n.licenseKey);
            if (newLicense) {
                return {
                    ...o,
                    ...newLicense,
                };
            }
            return o;
        });
        console.log('updateExpireLicenses', db.data.licenses);
        await db.write();
    }
}
