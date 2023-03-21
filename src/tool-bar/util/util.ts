function tryGetElement(selector: string): HTMLElement | null {
    if (selector.includes('//')) {
        return document.evaluate(selector, document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            .singleNodeValue as HTMLElement | null;
    } else {
        return document.querySelector(selector) as HTMLElement | null;
    }
}

function waitForElement(selector: string, timeout = 36000000): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
        if (tryGetElement(selector)) {
            return resolve(tryGetElement(selector));
        }

        let observer: MutationObserver | null = null;

        const timerId = setTimeout(() => {
            reject(new Error(`Element ${selector} not found`));
            observer?.disconnect();
        }, timeout);

        observer = new MutationObserver(() => {
            const element = tryGetElement(selector);

            if (element) {
                resolve(element);
                observer.disconnect();
                clearTimeout(timerId);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

export { waitForElement };
