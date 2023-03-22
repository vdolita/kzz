import { LowSync } from 'lowdb';
import { LocalStorage } from 'lowdb/browser';

type Data = {
    licenses: Array<{ key: string; active: boolean; verify: string; activateAt: string }>;
};

let db: LowSync<Data>;

export function getAppDb() {
    if (!db) {
        db = new LowSync(new LocalStorage('kzzApp'));
        db.data = db.data || { licenses: [] };
    }
    return db;
}
