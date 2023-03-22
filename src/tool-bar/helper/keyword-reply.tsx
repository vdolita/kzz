import Button from 'antd/es/button';
import Drawer from 'antd/es/drawer';
import Input from 'antd/es/input';
import InputNumber from 'antd/es/input-number';
import TextArea from 'antd/es/input/TextArea';
import Switch from 'antd/es/switch';
import Tooltip from 'antd/es/tooltip';
import { useCallback, useEffect, useRef, useState } from 'react';
import { timer } from 'rxjs/internal/observable/timer';
import FeatureBox from '../components/feature-box';
import { sendMsg } from '../util/msg';
import { waitForElement } from '../util/util';

const maxKeyword = 20;

interface Keyword {
    keyword: string;
    reply: string;
    isActivated: boolean;
}

export default function KeyWordReplay() {
    const [replyPeriod, setReplyPeriod] = useState<number>(10);
    const [isEnabled, setIsEnabled] = useState(false);
    const [showKwSetting, setShowKwSetting] = useState(false);
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [inCd, setInCd] = useState<string[]>([]);

    const sender = useCallback(
        (msgText: string) => {
            if (!isEnabled) {
                return;
            }
            const keyword = keywords.find((kw) => kw.isActivated && msgText.includes(kw.keyword));
            if (keyword && keyword.isActivated && !inCd.includes(msgText)) {
                const reply = keyword.reply;
                sendMsg(reply.trim());
                setInCd([...inCd, keyword.keyword]);
                timer(replyPeriod * 1000).subscribe(() => {
                    setInCd(inCd.filter((cd) => cd !== keyword.keyword));
                });
            }
        },
        [inCd, isEnabled, keywords, replyPeriod],
    );

    const senderRef = useRef(sender);
    const msgObserverRef = useRef<MutationObserver>(null);

    function onPeriodChange(val: number) {
        console.log(`set period to ${val}`);
        setReplyPeriod(val);
    }

    function onSwitchChange() {
        setIsEnabled(!isEnabled);
    }

    function showKsSetting() {
        setShowKwSetting(true);
    }

    function onKsClose() {
        setShowKwSetting(false);
    }

    function onKeywordChange(index: number, keyword: Keyword) {
        const newKeywords = keywords.map((kw, i) => (i === index ? keyword : kw));
        setKeywords(newKeywords);
    }

    function onKeywordRemove(index: number) {
        const newKeywords = keywords.filter((_, i) => i !== index);
        setKeywords(newKeywords);
    }

    function newKeyword() {
        if (keywords.length >= maxKeyword) {
            return;
        }
        setKeywords([...keywords, { keyword: '', reply: '', isActivated: true }]);
    }

    useEffect(() => {
        if (msgObserverRef.current) {
            console.log('msg observer already exists');
            return;
        }

        console.log('init msg observer');
        let observer: MutationObserver = null;
        waitForElement(`//div[contains(@class, 'live-panel')]//div[contains(@class, 'innerScrollContainer')]`).then(
            (msgContainer) => {
                observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            console.log('msg added');
                            const msg = mutation.addedNodes[0] as HTMLElement;
                            const msgContent = document.evaluate(
                                `.//span[contains(@class, 'replied-content')]`,
                                msg,
                                null,
                                XPathResult.FIRST_ORDERED_NODE_TYPE,
                                null,
                            ).singleNodeValue as HTMLSpanElement;

                            const msgText = msgContent.innerText;
                            console.log(msgText);
                            senderRef.current(msgText);
                        }
                    });
                });

                observer.observe(msgContainer, {
                    childList: true,
                    subtree: true,
                });

                msgObserverRef.current = observer;
            },
        );

        return () => {
            console.log('disconnect msg observer');
            msgObserverRef.current?.disconnect();
            msgObserverRef.current = null;
        };
    }, []);

    useEffect(() => {
        senderRef.current = sender;
    }, [sender]);

    useEffect(() => {
        console.log('init keywords');
        window.Asuka.getKsDB().then((db) => {
            console.log(db);
            setKeywords(db.keywords);
        });
    }, []);

    useEffect(() => {
        console.log('update keywords');
        window.Asuka.setKsDB({ keywords });
    }, [keywords]);

    return (
        <FeatureBox title="自动回复">
            <div className="flex flex-row gap-x-4">
                <Tooltip title="每个关键词的回复间隔">
                    <span className="basis-16">回复频率:</span>
                </Tooltip>
                <div>
                    <InputNumber
                        addonBefore="每"
                        addonAfter="秒"
                        value={replyPeriod}
                        min={2}
                        max={86400}
                        onChange={onPeriodChange}
                        size="small"
                    />
                </div>
            </div>
            <div className="flex flex-row gap-x-4">
                <span className="basis-16">是否启用:</span>
                <div>
                    <Switch
                        size="small"
                        checked={isEnabled}
                        onChange={onSwitchChange}
                        checkedChildren="开启"
                        unCheckedChildren="关闭"
                    />
                </div>
            </div>
            <div className="flex flex-row gap-x-4">
                <span className="basis-16">设置:</span>
                <div>
                    <Button type="primary" onClick={showKsSetting}>
                        打开设置
                    </Button>
                    <Drawer title="关键词设定" placement="right" size="large" onClose={onKsClose} open={showKwSetting}>
                        <div className="flex flex-col gap-4">
                            <div>
                                <Button type="primary" onClick={newKeyword}>
                                    新增
                                </Button>
                            </div>
                            <div className="flex flex-col-reverse gap-y-4">
                                {keywords.map((kw, i) => (
                                    <KeywordCell
                                        keyword={kw}
                                        key={i}
                                        index={i}
                                        onChange={onKeywordChange}
                                        onRemove={onKeywordRemove}
                                    />
                                ))}
                            </div>
                        </div>
                    </Drawer>
                </div>
            </div>
        </FeatureBox>
    );
}

function KeywordCell({
    index,
    keyword,
    onRemove,
    onChange,
}: {
    index: number;
    keyword: Keyword;
    onRemove: (index: number) => void;
    onChange: (index: number, keyword: Keyword) => void;
}) {
    function handleKeywordChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange(index, { ...keyword, keyword: e.target.value });
    }

    function handleReplyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        onChange(index, { ...keyword, reply: e.target.value });
    }

    function handleSwitchChange() {
        onChange(index, { ...keyword, isActivated: !keyword.isActivated });
    }

    return (
        <div className="rounded bg-white">
            <div className="flex flex-col gap-y-2">
                <div className="flex flex-row gap-x-4 items-center">
                    <span>关键词:</span>
                    <div>
                        <Input value={keyword.keyword} minLength={1} onChange={handleKeywordChange} />
                    </div>
                    <div>
                        <Switch
                            checked={keyword.isActivated}
                            onChange={handleSwitchChange}
                            checkedChildren="开启"
                            unCheckedChildren={'关闭'}
                        />
                    </div>
                    <div className="ml-auto">
                        <Button type="primary" danger onClick={() => onRemove(index)}>
                            删除
                        </Button>
                    </div>
                </div>
                <div>
                    <TextArea
                        value={keyword.reply}
                        rows={3}
                        minLength={1}
                        onChange={handleReplyChange}
                        placeholder="自动回复的内容"
                    />
                </div>
            </div>
        </div>
    );
}
