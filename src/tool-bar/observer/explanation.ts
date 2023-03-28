import { interval } from 'rxjs/internal/observable/interval';
import { timer } from 'rxjs/internal/observable/timer';
import { startWith } from 'rxjs/internal/operators/startWith';
import { Subscription } from 'rxjs/internal/Subscription';

let expObserverSub: Subscription;
let expTimerSub: Subscription;
let startCallback: () => void;
let endCallback: () => void;
let isStarted = false;

export function startExpObserver(period: number, gap: number) {
    expObserverSub?.unsubscribe();
    expTimerSub?.unsubscribe();

    console.info('start exp observer', period, gap, new Date());
    expObserverSub = interval(period + gap)
        .pipe(startWith(0))
        .subscribe(() => {
            console.info('exp observer sub called', new Date());
            startCallback && startCallback();
            expTimerSub = timer(period).subscribe(() => {
                console.info('exp observer end called', new Date());
                endCallback && endCallback();
            });
        });
    isStarted = true;
}

export function stopExpObserver() {
    console.info('stop exp observer', new Date());
    expObserverSub?.unsubscribe();
    expTimerSub?.unsubscribe();
    expObserverSub = null;
    expTimerSub = null;
    startCallback = null;
    endCallback = null;
    isStarted = false;
}

export function setExpCallback(startCB: () => void, endCB: () => void) {
    console.info('set exp callback', new Date());
    startCallback = startCB;
    endCallback = endCB;
}

export function isExpObserverStarted() {
    return isStarted;
}
