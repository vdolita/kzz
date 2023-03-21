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
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function sendMsg(content: string) {
    const msgInput: HTMLInputElement | null = document.evaluate(
        '//input[contains(@placeholder, "发公评")]',
        document.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
    ).singleNodeValue as HTMLInputElement;

    const msgButton: HTMLButtonElement | null = document.evaluate(
        "//button/span[contains(text(), '发送')]/..",
        document.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
    ).singleNodeValue as HTMLButtonElement;

    if (!msgInput || !msgButton) {
        return;
    }

    changeInputValue(msgInput, content);
    msgButton.click();
}
