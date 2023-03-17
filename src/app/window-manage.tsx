import Button from "antd/es/button";
import { useState } from "react";

const maxWindows = 15;
const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

export default function WindowManage() {
  const [windows, setWindows] = useState<string[]>(["a"]);

  function handleCreate() {
    if (windows.length >= maxWindows) {
      return;
    }
    setWindows([...windows, alphabet[windows.length]]);
  }

  return (
    <div className="container mx-auto h-full">
      <div className="h-full grid grid-cols-5 gap-4 place-content-center">
        {windows.map((v, k) => (
          <WindowButton label={v} onCreate={handleCreate} key={k} />
        ))}
      </div>
    </div>
  );
}

function WindowButton({
  label,
  onCreate,
}: {
  label: string;
  onCreate: () => void;
}) {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [opening, setOpening] = useState<boolean>(false);

  function handleClicked() {
    if (!isOpened) {
      onCreate();
      setIsOpened(true);
      setOpening(true);
    } else {
      //
    }
  }

  return (
    <Button
      type="primary"
      onClick={handleClicked}
      loading={opening}
      disabled={isOpened}
    >
      {!isOpened ? "新建窗口" : `${label} 窗口前置`}
    </Button>
  );
}
