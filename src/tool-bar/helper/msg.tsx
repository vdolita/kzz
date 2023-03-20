import { Button, InputNumber, Input } from 'antd';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { changeInputValue } from '../util/util';
import FeatureBox from '../components/feature-box';
import { isMsgObserverStarted, setMsgObserverCallback, startMsgObserver, stopMsgObserver } from '../observer/msg';

const defaultPeriod = 60;
const minPeriod = 1;
const maxPeriod = 86400;

const { TextArea } = Input;

export default function IntervalMsg() {
    const [msgPeriod, setMsgPeriod] = useState<number>(defaultPeriod);
    const [msgContent, setMsgContent] = useState('');
    const [msgIndex, setMgsIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);

    const onChange = (val: number) => {
        console.log(`set period to ${val}`);
        setMsgPeriod(val);
    };

    const onContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMsgContent(e.target.value);
    };

    const sendMsg = useCallback(() => {
        //   "//button/span[contains(text(), '发送')]/..",
        const msgInput: HTMLInputElement | null = document.evaluate(
            '//input[contains(@placeholder, "发公评")]',
            document.body,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
        ).singleNodeValue as HTMLInputElement;

        //var s =document.createElement('script')
        // s.src = "http://localhost:8080/tool.js"
        // document.body.appendChild(s)

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

        const msgList = msgContent.split('\n');
        const msg = msgList[msgIndex].trim();
        setMgsIndex(msgIndex === msgList.length - 1 ? 0 : msgIndex + 1);

        if (msg === '') {
            return;
        }

        changeInputValue(msgInput, msg);
        msgButton.click();
    }, [msgContent, msgIndex]);

    function startInterval() {
        if (msgPeriod <= 0) {
            return;
        }

        console.log('start interval');
        stopMsgObserver();
        sendMsg();
        setMsgObserverCallback(sendMsg);
        startMsgObserver(msgPeriod * 1000);
        setIsStarted(true);
    }

    const onButtonClick = () => {
        if (!isStarted) {
            startInterval();
        } else {
            stopMsgObserver();
            setMgsIndex(0);
        }
        setIsStarted(!isStarted);
    };

    useEffect(() => {
        if (isMsgObserverStarted()) {
            setMsgObserverCallback(sendMsg);
            if (!isStarted) {
                setIsStarted(true);
            }
        }
    }, [isStarted, sendMsg]);

    return (
        <FeatureBox title="定时发言">
            <div className="flex flex-row gap-x-4">
                <span className="basis-16">发言间隔:</span>
                <div>
                    <InputNumber
                        min={minPeriod}
                        max={maxPeriod}
                        defaultValue={defaultPeriod}
                        value={msgPeriod}
                        onChange={onChange}
                        disabled={isStarted}
                        size="small"
                    />
                </div>
                <span>秒</span>
                <Button
                    type="primary"
                    onClick={onButtonClick}
                    disabled={msgContent === '' || !msgPeriod}
                    className="bg-sky-400"
                    size="small"
                >
                    {isStarted ? '停止' : '开始'}
                </Button>
            </div>
            <div className="flex flex-row gap-x-4">
                <span className="basis-16">发言内容:</span>
                <div className="flex-grow">
                    <TextArea
                        value={msgContent}
                        onChange={onContentChange}
                        placeholder="使用回车键来进行换行，多行内容将循环发送"
                        disabled={isStarted}
                        rows={3}
                    />
                </div>
            </div>
        </FeatureBox>
    );
}
