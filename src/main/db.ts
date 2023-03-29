import { app } from 'electron';
import { Adapter, Low } from 'lowdb';
import { TextFile } from 'lowdb/node';

import path from 'path';
import { License } from '../model/license';
import CryptoJS from 'crypto-js';
import fs from 'fs';

export type KsDBData = {
    keywords: Array<{ keyword: string; reply: string; isActivated: boolean }>;
};

export type AppDBData = {
    // 是否试用过
    isTried: boolean;
    licenses: Array<License>;
};

class EncryptJsonFile<T> implements Adapter<T> {
    #adapter: TextFile;

    constructor(filename: string) {
        this.#adapter = new TextFile(filename);
    }

    async read(): Promise<T | null> {
        const data = await this.#adapter.read();
        if (data === null || data === '') {
            return null;
        } else {
            return JSON.parse(CryptoJS.AES.decrypt(data, 'liveboostorder').toString(CryptoJS.enc.Utf8)) as T;
        }
    }

    write(obj: T): Promise<void> {
        const data = JSON.stringify(obj, null, 2);
        return this.#adapter.write(CryptoJS.AES.encrypt(data, 'liveboostorder').toString());
    }
}

function getKsDBPath() {
    return path.join(app.getPath('appData'), '.vdolita', 'liveorderboost', 'ks.json');
}

function getAppDBPath() {
    return path.join(app.getPath('appData'), '.vdolita', 'liveorderboost', 'app.json');
}

let ksDB: Low<KsDBData>;

export async function getKsDB() {
    if (!ksDB) {
        const dbPath = getKsDBPath();
        // if path not exist then create it
        if (!fs.existsSync(path.dirname(dbPath))) {
            fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        }
        const adapter = new EncryptJsonFile<KsDBData>(dbPath);
        ksDB = new Low(adapter);
        await ksDB.read();
    }
    ksDB.data = ksDB.data || { keywords: [] };
    return ksDB;
}

let appDB: Low<AppDBData>;

export async function getAppDB() {
    if (!appDB) {
        const dbPath = getAppDBPath();
        // if path not exist then create it
        if (!fs.existsSync(path.dirname(dbPath))) {
            fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        }
        const adapter = new EncryptJsonFile<AppDBData>(dbPath);
        appDB = new Low(adapter);
        await appDB.read();
    }
    appDB.data = appDB.data || { isTried: false, licenses: [] };
    return appDB;
}

export async function clearAppDB() {
    if (!appDB) {
        const dbPath = getAppDBPath();
        const adapter = new EncryptJsonFile<AppDBData>(dbPath);
        appDB = new Low(adapter);
        await appDB.read();
    }
    appDB.data = { isTried: false, licenses: [] };
    await appDB.write();
}

export async function checkDBAccess() {
    try {
        const dbPath = getAppDBPath();
        await fs.promises.access(dbPath, fs.constants.R_OK | fs.constants.W_OK);

        const ksPath = getKsDBPath();
        await fs.promises.access(ksPath, fs.constants.R_OK | fs.constants.W_OK);

        const db = await getAppDB();
        const ks = await getKsDB();

        db.write();
        ks.write();
    } catch (error) {
        console.error(error);
        throw new Error('无法访数据文件');
    }
}
