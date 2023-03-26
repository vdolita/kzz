export {};

type KsDBData = {
    keywords: Array<{ keyword: string; reply: string; isActivated: boolean }>;
};

type AppDBData = {
    // 是否试用过
    isTried: boolean;
    licenses: Array<License>;
};

type License = {
    licenseKey: string;
    verifyCode: string;
    isValid: boolean;
    expireAt: string;
};

declare global {
    interface Window {
        Asuka: {
            activateSoftware: (licenseKey: string) => Promise<License | null>;
            onWindowCreated: (callback: (windowId: string) => void) => void;
            onWindowClosed: (callback: (windowId: string) => void) => void;
            openKsWindow: (windowId: string) => void;
            hideKsWindow: (windowId: string) => void;
            showKsWindow: (windowId: string) => void;
            getKsDB: () => Promise<KsDBData>;
            setKsDB: (data: KsDBData) => Promise<void>;
            getAppDB: () => Promise<AppDBData>;
            setAppDB: (data: AppDBData) => Promise<void>;
            startTrial: (windowId: string) => Promise<void>;
        };
    }
}
