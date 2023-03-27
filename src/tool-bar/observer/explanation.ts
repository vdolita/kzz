import { startWith, timer } from 'rxjs';
import { interval } from 'rxjs/internal/observable/interval';
import { Subscription } from 'rxjs/internal/Subscription';

let expObserverSub: Subscription;
let expTimerSub: Subscription;
let startCallback: () => void;
let endCallback: () => void;
let isStarted = false;

export function startExpObserver(period: number, gap: number) {
    expObserverSub?.unsubscribe();
    expTimerSub?.unsubscribe();

    expObserverSub = interval(period + gap)
        .pipe(startWith(0))
        .subscribe(() => {
            startCallback && startCallback();
            expTimerSub = timer(period).subscribe(() => {
                endCallback && endCallback();
            });
        });
    isStarted = true;
}

export function stopExpObserver() {
    expObserverSub?.unsubscribe();
    expTimerSub?.unsubscribe();
    expObserverSub = null;
    expTimerSub = null;
    startCallback = null;
    endCallback = null;
    isStarted = false;
}

export function setExpCallback(startCB: () => void, endCB: () => void) {
    startCallback = startCB;
    endCallback = endCB;
}

export function isExpObserverStarted() {
    return isStarted;
}
