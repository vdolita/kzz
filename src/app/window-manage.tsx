import Button from 'antd/es/button';
import Switch from 'antd/es/switch';
import { useEffect, useState } from 'react';

const maxWindows = 15;
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function WindowManage() {
    const usableAlphabets = alphabet.slice(0, maxWindows);

    const [openedWindows, setOpenedWindows] = useState<string[]>([]);
    const [hiddenWindows, setHiddenWindows] = useState<string[]>([]);
    const [creatingWindow, setCreatingWindow] = useState<string[]>([]);

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

    useEffect(() => {
        window.Asuka.onWindowClosed((windowName: string) => {
            setOpenedWindows(openedWindows.filter((v) => v !== windowName));
        });

        window.Asuka.onWindowCreated((windowName: string) => {
            setOpenedWindows([...openedWindows, windowName]);
            setCreatingWindow(creatingWindow.filter((v) => v !== windowName));
        });
    }, [creatingWindow, openedWindows]);

    return (
        <div className="container mx-auto h-full">
            <div className="h-full grid grid-cols-5 gap-4 place-content-center">
                {usableAlphabets.map((v, i) => (
                    <WindowCell
                        key={i}
                        id={v}
                        isOpened={openedWindows.includes(v)}
                        showing={!hiddenWindows.includes(v)}
                        onCreate={handleCreate}
                        onToggle={toggleWindow}
                        loading={isOpening(v)}
                    />
                ))}
            </div>
        </div>
    );
}

function WindowCell({
    id,
    isOpened,
    showing,
    onCreate,
    onToggle,
    loading,
}: {
    id: string;
    isOpened: boolean;
    showing: boolean;
    onCreate: (id: string) => void;
    onToggle: (id: string, checked: boolean) => void;
    loading: boolean;
}) {
    function handleToggle(checked: boolean) {
        onToggle(id, checked);
    }

    return (
        <div className="flex flex-col gap-3 rounded-t-sm bg-slate-50 place-content-center py-3 justify-center items-center">
            <span className="text-center">{`窗口-${id}`}</span>
            <div>
                {!isOpened || loading ? (
                    <Button type="primary" onClick={() => onCreate(id)} disabled={isOpened} loading>
                        创建
                    </Button>
                ) : (
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" checked={showing} onChange={handleToggle} />
                )}
            </div>
        </div>
    );
}
