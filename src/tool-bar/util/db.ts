import { LowSync } from 'lowdb';
import { LocalStorage } from 'lowdb/browser';

type Data = {
    keywords: Array<{ keyword: string; reply: string; isActivated: boolean }>;
};

let db: LowSync<Data>;

export function getRendererDb() {
    if (!db) {
        db = new LowSync(new LocalStorage('kzz'));
        db.data = { keywords: [] };
    }
    return db;
}
