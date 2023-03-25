import { interval } from 'rxjs/internal/observable/interval';
import { Subscription } from 'rxjs/internal/Subscription';

let msgObserverSub: Subscription;
let cb: () => void;
let isStarted = false;

export function startMsgObserver(gap: number) {
    stopMsgObserver();
    msgObserverSub = interval(gap).subscribe(() => {
        cb && cb();
    });
    isStarted = true;
}

export function stopMsgObserver() {
    msgObserverSub?.unsubscribe();
    cb = null;
    isStarted = false;
}

export function setMsgObserverCallback(callback: () => void) {
    cb = callback;
}

export function isMsgObserverStarted() {
    return isStarted;
}
