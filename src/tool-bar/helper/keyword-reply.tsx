import Button from 'antd/es/button';
import Drawer from 'antd/es/drawer';
import InputNumber from 'antd/es/input-number';
import Switch from 'antd/es/switch';
import Tooltip from 'antd/es/tooltip';
import { useState } from 'react';
import FeatureBox from '../components/feature-box';

const maxKeyword = 20;

export default function KeyWordReplay() {
    const [replyPeriod, setReplyPeriod] = useState<number>(10);
    const [isEnabled, setIsEnabled] = useState(false);
    const [showKwSetting, setShowKwSetting] = useState(false);

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
                        min={10}
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
                        Open
                    </Button>
                    <Drawer title="关键词设定" placement="right" size="large" onClose={onKsClose} open={showKwSetting}>
                        <p>Some contents...</p>
                        <p>Some contents...</p>
                        <p>Some contents...</p>
                    </Drawer>
                </div>
            </div>
        </FeatureBox>
    );
}
