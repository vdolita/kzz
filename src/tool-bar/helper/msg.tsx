import { Button, InputNumber, Input } from 'antd';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import FeatureBox from '../components/feature-box';
import { isMsgObserverStarted, setMsgObserverCallback, startMsgObserver, stopMsgObserver } from '../observer/msg';
import { sendMsg } from '../util/msg';

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
        setMsgPeriod(val);
    };

    const onContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMsgContent(e.target.value);
    };

    const send = useCallback(() => {
        const msgList = msgContent.split('\n');
        const msg = msgList[msgIndex].trim();
        setMgsIndex(msgIndex === msgList.length - 1 ? 0 : msgIndex + 1);

        if (msg === '') {
            return;
        }

        sendMsg(msg);
    }, [msgContent, msgIndex]);

    function startInterval() {
        if (msgPeriod <= 0) {
            return;
        }

        send();

        setMsgObserverCallback(send);
        startMsgObserver(msgPeriod * 1000);
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
            setMsgObserverCallback(send);
            if (!isStarted) {
                setIsStarted(true);
            }
        }
    }, [isStarted, send]);

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
