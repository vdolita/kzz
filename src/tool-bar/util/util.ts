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

export { setNativeValue, changeInputValue, forceReactInputOnChange }