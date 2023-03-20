export {};

declare global {
    interface Window {
        Asuka: {
            activateSoftware: (licenseKey: string) => Promise<boolean>;
            onWindowCreated: (callback: (windowId: string) => void) => void;
            onWindowClosed: (callback: (windowId: string) => void) => void;
            openKsWindow: (windowId: string) => void;
        };
    }
}
