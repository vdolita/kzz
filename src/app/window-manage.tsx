import Button from "antd/es/button";
import { useEffect, useState } from "react";

const maxWindows = 15;
const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

export default function WindowManage() {
  const [windows, setWindows] = useState<string[]>([]);
  const [freeWindows, setFreeWindows] = useState<string[]>(
    alphabet.slice(0, maxWindows)
  );
  const [creatingWindow, setCreatingWindow] = useState<string[]>([]);

  function handleCreate(windowId: string) {
    if (windows.length >= maxWindows) {
      return;
    }
    window.Asuka.openKsWindow(windowId);
    setCreatingWindow([...creatingWindow, windowId]);
  }

  function isOpening(windowId: string) {
    return creatingWindow.includes(windowId);
  }

  function isOpened(windowId: string) {
    return windows.includes(windowId);
  }

  useEffect(() => {
    window.Asuka.onWindowClosed((windowName: string) => {
      setWindows(windows.filter((v) => v !== windowName));
      setFreeWindows([...freeWindows, windowName]);
    });

    window.Asuka.onWindowCreated((windowName: string) => {
      setWindows([...windows, windowName]);
      setFreeWindows(freeWindows.filter((v) => v !== windowName));
      setCreatingWindow(creatingWindow.filter((v) => v !== windowName));
    });
  }, [creatingWindow, freeWindows, windows]);

  return (
    <div className="container mx-auto h-full">
      <div className="h-full grid grid-cols-5 gap-4 place-content-center">
        {windows.map((v, k) => (
          <WindowButton
            id={v}
            isOpened={isOpened(v)}
            opening={isOpening(v)}
            key={k}
          />
        ))}
        {freeWindows.map((v, k) => (
          <CreateWindowButton id={v} onCreate={handleCreate} key={k} />
        ))}
      </div>
    </div>
  );
}

function WindowButton({
  id,
  opening,
  isOpened,
}: {
  id: string;
  opening: boolean;
  isOpened: boolean;
}) {
  function handleClicked() {
    // TODO 前置窗口
  }

  return (
    <Button
      type="primary"
      onClick={handleClicked}
      loading={opening}
      disabled={isOpened}
    >
      {`${id} 窗口前置`}
    </Button>
  );
}

function CreateWindowButton({
  id,
  onCreate,
}: {
  id: string;
  onCreate: (id: string) => void;
}) {
  function handleClicked() {
    onCreate(id);
  }

  return <Button onClick={handleClicked}>{`${id} 新建窗口`}</Button>;
}
