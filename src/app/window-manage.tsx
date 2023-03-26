import { Input, message, Modal, Popconfirm } from 'antd';
import Button from 'antd/es/button';
import Switch from 'antd/es/switch';
import { useEffect, useState } from 'react';
import { License } from '../model/license';

const maxWindows = 15;
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function WindowManage() {
    const usableAlphabets = alphabet.slice(0, maxWindows);

    const [messageApi, contextHolder] = message.useMessage();
    const [openedWindows, setOpenedWindows] = useState<string[]>([]);
    const [hiddenWindows, setHiddenWindows] = useState<string[]>([]);
    const [creatingWindow, setCreatingWindow] = useState<string[]>([]);
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isTried, setIsTried] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [activateLicense, setActivateLicense] = useState<string>('');

    function handleCreate(windowId: string) {
        if (openedWindows.length >= maxWindows) {
            return;
        }
        window.Asuka.openKsWindow(windowId);
        setCreatingWindow([...creatingWindow, windowId]);
    }

    function isOpening(windowId: string) {
        return creatingWindow.includes(windowId);
    }

    function toggleWindow(windowId: string) {
        if (hiddenWindows.includes(windowId)) {
            window.Asuka.showKsWindow(windowId);
            setHiddenWindows(hiddenWindows.filter((v) => v !== windowId));
        } else {
            window.Asuka.hideKsWindow(windowId);
            setHiddenWindows([...hiddenWindows, windowId]);
        }
    }

    function onActivateLicenseChange(e: React.ChangeEvent<HTMLInputElement>) {
        setActivateLicense(e.target.value);
    }

    function handleTrial(windowId: string) {
        window.Asuka.startTrial(windowId);
        setIsTried(true);
        handleCreate(windowId);
    }

    async function handleActivate() {
        const result = await window.Asuka.activateSoftware(activateLicense);
        if (!result || !result.verifyCode || !result.expireAt || result.verifyCode == '' || result.verifyCode == '') {
            messageApi.error('激活失败');
            return;
        }
        setIsTried(false);
        setIsModalOpen(false);

        // remove one expired license if exists
        const expiredLicense = licenses.find((v) => !v.isValid);
        const newLicenses = licenses.filter((v) => v.licenseKey !== expiredLicense?.licenseKey);

        setLicenses([result, ...newLicenses]);
        messageApi.success('激活成功');
    }

    useEffect(() => {
        window.Asuka.onWindowClosed((windowName: string) => {
            setOpenedWindows(openedWindows.filter((v) => v !== windowName));
        });

        window.Asuka.onWindowCreated((windowName: string) => {
            setOpenedWindows([...openedWindows, windowName]);
            setCreatingWindow(creatingWindow.filter((v) => v !== windowName));
        });
    }, [creatingWindow, openedWindows]);

    useEffect(() => {
        window.Asuka.getAppDB().then((db) => {
            setLicenses(db.licenses);
            setIsTried(db.isTried);
        });
    }, []);

    useEffect(() => {
        window.Asuka.setAppDB({ licenses, isTried });
    }, [licenses, isTried]);

    return (
        <div className="container mx-auto h-full">
            {contextHolder}
            <div className="h-full flex flex-col justify-center gap-4">
                <div className="grid grid-cols-5 gap-4 place-content-center">
                    {usableAlphabets.map((v, i) => (
                        <WindowCell
                            key={i}
                            id={v}
                            isTrial={i == 0 && !isTried}
                            isOpened={openedWindows.includes(v)}
                            showing={!hiddenWindows.includes(v)}
                            onCreate={handleCreate}
                            onToggle={toggleWindow}
                            onActivate={() => setIsModalOpen(true)}
                            onTrial={handleTrial}
                            loading={isOpening(v)}
                            license={licenses[i]}
                        />
                    ))}
                </div>
                <div className="w-full">
                    <p className="text-center text-lg">
                        激活码购买请加微信: <span className="font-bold">baodan12306</span>
                    </p>
                </div>
            </div>
            <Modal
                title="激活"
                open={isModalOpen}
                onOk={handleActivate}
                onCancel={() => setIsModalOpen(false)}
                okText="激活"
            >
                <div>
                    <Input
                        onChange={onActivateLicenseChange}
                        minLength={36}
                        maxLength={36}
                        value={activateLicense}
                        placeholder="请输入激活码"
                    />
                </div>
            </Modal>
        </div>
    );
}

function WindowCell({
    id,
    isOpened,
    license,
    showing,
    onCreate,
    onToggle,
    loading,
    onActivate,
    onTrial,
    isTrial,
}: {
    id: string;
    isOpened: boolean;
    showing: boolean;
    onCreate: (id: string) => void;
    onToggle: (id: string, checked: boolean) => void;
    onActivate: () => void;
    onTrial: (id: string) => void;
    loading: boolean;
    isTrial?: boolean;
    license?: License;
}) {
    function handleToggle(checked: boolean) {
        onToggle(id, checked);
    }

    function renExpire() {
        let expireStr = 'N/A';

        if (license) {
            const date = new Date(license.expireAt);
            expireStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }

        return <div className="text-sm">到期时间: {expireStr}</div>;
    }

    function renCreateWindow() {
        return (
            <div>
                {!isOpened || loading ? (
                    <Button type="primary" onClick={() => onCreate(id)} disabled={isOpened} loading={loading}>
                        创建
                    </Button>
                ) : (
                    <Switch checkedChildren="显示" unCheckedChildren="隐藏" checked={showing} onChange={handleToggle} />
                )}
            </div>
        );
    }

    function renUnActivated() {
        let content = '激活';

        if (license && !license.isValid) {
            content = '重新激活';
        }

        return (
            <div>
                <Button type="primary" onClick={onActivate}>
                    {content}
                </Button>
            </div>
        );
    }

    function renTrial() {
        return (
            <div>
                <Popconfirm
                    title="提示"
                    description="开启窗口后将无法再次试用, 15分钟后窗口将自动关闭！"
                    cancelText="取消"
                    okText="确认"
                    onConfirm={() => onTrial(id)}
                >
                    <Button type="primary">试用</Button>
                </Popconfirm>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 rounded-t-sm bg-slate-50 place-content-center py-3 justify-center items-center">
            <span className="text-center">{`窗口-${id}`}</span>
            {isTrial && !license ? renTrial() : null}
            {license && license.isValid ? renCreateWindow() : null}
            {(!isTrial && !license) || (license && !license.isValid) ? renUnActivated() : null}
            {renExpire()}
        </div>
    );
}
