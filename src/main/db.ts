import { app, safeStorage } from 'electron';
import { Adapter, Low } from 'lowdb';
import { TextFile } from 'lowdb/node';

import path from 'path';

type Data = {
    licenses: Array<{ key: string; active: boolean }>;
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
                return JSON.parse(safeStorage.decryptString(Buffer.from(data, 'utf-8'))) as T;
            }
            return JSON.parse(data) as T;
        }
    }

    write(obj: T): Promise<void> {
        const data = JSON.stringify(obj, null, 2);
        if (safeStorage.isEncryptionAvailable()) {
            return this.#adapter.write(safeStorage.encryptString(data).toString('utf-8'));
        } else {
            return this.#adapter.write(JSON.stringify(obj, null, 2));
        }
    }
}

let db: Low<Data>;

export async function getMainDb() {
    if (!db) {
        const dbPath = path.join(app.getPath('userData'), 'db.json');
        const adapter = new EncryptJsonFile<Data>(dbPath);
        db = new Low(adapter);
        await db.read();
    }
    db.data = db.data || { licenses: [] };
    db.data.licenses = db.data.licenses || [];
    return db;
}
