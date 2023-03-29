import { app, autoUpdater, BrowserWindow, dialog } from 'electron';
import { registerEvents } from './events/main';
import verifyLicense from './main/api/verification';
import { checkDBAccess, clearAppDB, getAppDB } from './main/db';
import createManagerWindow from './main/manager';
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    registerEvents();
    checkUpdate();

    try {
        await checkDBAccess();
        await checkLicenses();
    } catch (error) {
        dialog.showErrorBox('系统错误', error.message);
        app.quit();
    }

    createWindow();
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

async function checkLicenses() {
    const db = await getAppDB();

    if (isDev()) {
        await clearAppDB();
    }

    const licenses = db.data.licenses;

    if (licenses.length === 0) {
        return;
    }

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
        await db.write();
    } else {
        throw new Error('激活码验证失败，请稍后重试');
    }
}
