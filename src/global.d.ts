export {};

type KsDBData = {
    keywords: Array<{ keyword: string; reply: string; isActivated: boolean }>;
};
declare global {
    interface Window {
        Asuka: {
            activateSoftware: (licenseKey: string) => Promise<boolean>;
            onWindowCreated: (callback: (windowId: string) => void) => void;
            onWindowClosed: (callback: (windowId: string) => void) => void;
            openKsWindow: (windowId: string) => void;
            hideKsWindow: (windowId: string) => void;
            showKsWindow: (windowId: string) => void;
            getKsDB: () => Promise<KsDBData>;
            setKsDB: (data: KsDBData) => Promise<void>;
        };
    }
}
