export { }

declare global {
    interface Window {
        Asuka: {
            activateSoftware: (licenseKey: string) => Promise<boolean>;
            onWindowCreated: (callback: (windowId: number) => void) => void;
            onWindowClosed: (callback: (windowId: number) => void) => void;
            openKsWindow: (windowId: number) => void;
        }
    }
}