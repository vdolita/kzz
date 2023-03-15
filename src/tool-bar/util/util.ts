function setNativeValue(element: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }
}

function changeInputValue(element: HTMLInputElement, value: string) {
    setNativeValue(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
}

function forceReactInputOnChange(input: HTMLInputElement, value: string) {
    // @ts-expect-error NOTE: clear the interal value to force an actual change
    input._valueTracker?.setValue(value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function waitForElement(selector: string, timeout = 10000): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector) as HTMLElement)
        }

        let observer: MutationObserver | null = null

        const timerId = setTimeout(() => {
            reject(new Error(`Element ${selector} not found`))
            observer?.disconnect()
        }, timeout)

        observer = new MutationObserver(() => {
            const element = document.querySelector(selector)
            if (element) {
                resolve(element as HTMLElement)
                observer.disconnect()
                clearTimeout(timerId)
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

export { setNativeValue, changeInputValue, forceReactInputOnChange, waitForElement }