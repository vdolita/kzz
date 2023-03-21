import Button from 'antd/es/button';
import Drawer from 'antd/es/drawer';
import Input from 'antd/es/input';
import InputNumber from 'antd/es/input-number';
import TextArea from 'antd/es/input/TextArea';
import Switch from 'antd/es/switch';
import Tooltip from 'antd/es/tooltip';
import { useEffect, useState } from 'react';
import FeatureBox from '../components/feature-box';
import { getRendererDb } from '../util/db';

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
    const [keywords, setKeywords] = useState<Keyword[]>(() => {
        const db = getRendererDb();
        return db.data.keywords;
    });

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

    function startWatch() {
        const msgContainer = document.evaluate(
            `//div[contains(@class, 'live-panel')]//div[contains(@class, 'innerScrollContainer')]`,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
        ).singleNodeValue as HTMLElement;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const msg = mutation.addedNodes[0] as HTMLElement;
                    const msgContent = document.evaluate(
                        `.//span[contains(@class, 'replied-content')]`,
                        msg,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null,
                    ).singleNodeValue as HTMLSpanElement;

                    const msgText = msgContent.innerText;
                    const keyword = keywords.find((kw) => kw.isActivated && msgText.includes(kw.keyword));
                    if (keyword) {
                        const reply = keyword.reply;
                        const replyBtn = msg.querySelector('.reply-btn') as HTMLElement;
                        replyBtn.click();
                        const replyInput = document.querySelector('.reply-input') as HTMLInputElement;
                        replyInput.value = reply;
                        const sendBtn = document.querySelector('.send-btn') as HTMLElement;
                        sendBtn.click();
                    }
                }
            });
        });

        observer.observe(msgContainer, {
            childList: true,
        });
    }

    useEffect(() => {
        const db = getRendererDb();
        db.data.keywords = keywords;
        db.write();
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
        onChange(index, { ...keyword, keyword: e.target.value.trim() });
    }

    function handleReplyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        onChange(index, { ...keyword, reply: e.target.value.trim() });
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
