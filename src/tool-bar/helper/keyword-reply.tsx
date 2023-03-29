import Button from 'antd/es/button';
import Drawer from 'antd/es/drawer';
import Input from 'antd/es/input';
import InputNumber from 'antd/es/input-number';
import TextArea from 'antd/es/input/TextArea';
import Switch from 'antd/es/switch';
import Tooltip from 'antd/es/tooltip';
import { useCallback, useEffect, useRef, useState } from 'react';
import { timer } from 'rxjs/internal/observable/timer';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { Subject } from 'rxjs/internal/Subject';
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
    const [replyPeriod, setReplyPeriod] = useState<number>(30);
    const [isEnabled, setIsEnabled] = useState(false);
    const [showKwSetting, setShowKwSetting] = useState(false);
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const queueKeyword = useRef<string[]>([]);
    const repliedMsgs = useRef<number[]>([]);
    const maxRepliedMsgId = useRef(0);

    const keyWordSubject = useRef(new Subject<Keyword[]>());

    const sender = useCallback(
        (msgText: string) => {
            if (!isEnabled) {
                return;
            }
            const keyword = keywords.find((kw) => kw.isActivated && msgText.includes(kw.keyword));
            if (keyword && !queueKeyword.current.includes(keyword.keyword) && msgText.trim() !== keyword.reply.trim()) {
                const reply = keyword.reply;
                sendMsg(reply.trim());
                queueKeyword.current.push(keyword.keyword);
                timer(replyPeriod * 1000).subscribe(() => {
                    queueKeyword.current = queueKeyword.current.filter((kw) => kw !== keyword.keyword);
                });
            }
        },
        [isEnabled, keywords, replyPeriod],
    );

    const senderRef = useRef(sender);
    const msgObserverRef = useRef<MutationObserver>(new MutationObserver(mutationCallback));

    function onPeriodChange(val: number) {
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

    function mutationCallback(mutations: MutationRecord[]) {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const msg = mutation.addedNodes[0] as HTMLElement;
                const msgContent = document.evaluate(
                    `.//span[contains(@class, 'replied-content')]`,
                    msg,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null,
                ).singleNodeValue as HTMLSpanElement;

                const msgIdBox = document.evaluate(
                    `.//div[contains(@id, 'comment-')]`,
                    msg,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null,
                ).singleNodeValue as HTMLDivElement;

                if (!msgContent || !msgIdBox) {
                    return;
                }

                const msgId = parseInt(msgIdBox.id.replace('comment-', ''));

                if (msgId <= maxRepliedMsgId.current) {
                    return;
                }

                maxRepliedMsgId.current = msgId;
                if (repliedMsgs.current.includes(msgId)) {
                    return;
                }

                if (repliedMsgs.current.length > 1000) {
                    repliedMsgs.current.shift();
                }

                repliedMsgs.current.push(msgId);
                const msgText = msgContent.innerText;
                senderRef.current(msgText);
            }
        });
    }

    useEffect(() => {
        const ob = msgObserverRef.current;

        waitForElement(`//div[contains(@class, 'live-panel')]//div[contains(@class, 'innerScrollContainer')]`)
            .then((msgContainer) => {
                ob.observe(msgContainer, {
                    childList: true,
                    subtree: false,
                    attributes: false,
                    characterData: false,
                });
            })
            .catch(() => {
                // to do
            });

        const keywordSubscriber = keyWordSubject.current.pipe(debounceTime(1000)).subscribe((ks) => {
            console.log('save keywords', ks);
            window.Asuka.setKsDB({ keywords: ks });
        });

        return () => {
            ob.disconnect();
            keywordSubscriber.unsubscribe();
        };
    }, []);

    useEffect(() => {
        senderRef.current = sender;
    }, [sender]);

    useEffect(() => {
        window.Asuka.getKsDB().then((db) => {
            setKeywords(db.keywords);
        });
    }, []);

    useEffect(() => {
        keyWordSubject.current.next(keywords);
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
                        min={30}
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
