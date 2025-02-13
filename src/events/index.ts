export const IpcEvents = {
    ACTIVATE_SOFTWARE: 'sft:activate',
    CREATE_KS_WINDOWS: 'ksw:create',
    KS_WINDOW_CREATED: 'ksw:created',
    KS_WINDOW_CLOSED: 'ksw:closed',
    KS_WINDOW_HIDE: 'ksw:hide',
    KS_WINDOW_SHOW: 'ksw:show',
    KS_DB_GET: 'ksdb:get',
    KS_DB_SET: 'ksdb:set',
    APP_DB_GET: 'appdb:get',
    APP_DB_SET: 'appdb:set',
    TRIAL_START: 'trial:start',
} as const;
