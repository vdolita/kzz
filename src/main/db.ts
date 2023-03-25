import { app, safeStorage } from 'electron';
import { Adapter, Low } from 'lowdb';
import { TextFile } from 'lowdb/node';

import path from 'path';
import { License } from '../model/license';

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
        if (data === null) {
            return null;
        } else {
            if (safeStorage.isEncryptionAvailable()) {
                return JSON.parse(safeStorage.decryptString(Buffer.from(data, 'base64'))) as T;
            }
            return JSON.parse(data) as T;
        }
    }

    write(obj: T): Promise<void> {
        const data = JSON.stringify(obj, null, 2);
        if (safeStorage.isEncryptionAvailable()) {
            return this.#adapter.write(safeStorage.encryptString(data).toString('base64'));
        } else {
            return this.#adapter.write(JSON.stringify(obj, null, 2));
        }
    }
}

let ksDB: Low<KsDBData>;

export async function getKsDB() {
    if (!ksDB) {
        const dbPath = path.join(app.getPath('userData'), 'ks.json');
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
        const dbPath = path.join(app.getPath('userData'), 'app.json');
        const adapter = new EncryptJsonFile<AppDBData>(dbPath);
        appDB = new Low(adapter);
        await appDB.read();
    }
    appDB.data = appDB.data || { isTried: false, licenses: [] };
    return appDB;
}

export async function clearAppDB() {
    if (!appDB) {
        const dbPath = path.join(app.getPath('userData'), 'app.json');
        const adapter = new EncryptJsonFile<AppDBData>(dbPath);
        appDB = new Low(adapter);
        await appDB.read();
    }
    appDB.data = { isTried: false, licenses: [] };
    await appDB.write();
}
