import { Button } from "antd";
import { ChangeEvent, useEffect, useState } from "react";
import { interval, Subscription } from "rxjs";

export default function IntervalMsg() {
  const [msgPeriod, setMsgPeriod] = useState<string>("1");
  const [msgContent, setMsgContent] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [sub, setSub] = useState<Subscription>(null);

  //   "//button/span[contains(text(), '发送')]/..",
  const msgInput: HTMLInputElement | null = document.evaluate(
    '//input[contains(@placeholder, "发公评")]',
    document.body,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue as HTMLInputElement;

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setMsgPeriod("");
      return;
    }

    if (isNaN(parseInt(e.target.value))) {
      return;
    }

    if (parseInt(e.target.value) <= 0) {
      return;
    }

    if (parseInt(e.target.value) > 86400) {
      return;
    }

    setMsgPeriod(e.target.value);
  };

  const onContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMsgContent(e.target.value);
  };

  function sendMsg() {
    if (!msgInput) {
      return;
    }
    msgInput.value = msgContent;
    msgInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
  }

  function startInterval() {
    const period = isNaN(parseInt(msgPeriod)) ? 0 : parseInt(msgPeriod);

    if (period <= 0) {
      return;
    }

    console.log("start interval");
    const msgSub = interval(period * 1000).subscribe(() => {
      console.log("send msg");
      sendMsg();
    });

    setSub(msgSub);
  }

  const onButtonClick = () => {
    if (!isStarted) {
      startInterval();
    } else {
      console.log("unsubscribe");
      sub?.unsubscribe();
      sub && setSub(null);
    }
    setIsStarted(!isStarted);
  };

  useEffect(() => {
    return () => {
      sub && console.log("unsubscribe");
      sub?.unsubscribe();
    };
  }, [sub]);

  return (
    <div className="flex flex-col gap-y-2 bg-stone-50 p-2">
      <p className="text-base text-center">定时发言</p>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">发言间隔:</span>
        <input
          type="number"
          min={1}
          max={86400}
          value={msgPeriod}
          onChange={onChange}
          disabled={isStarted}
          className="basis-32 rounded border-2 border-slate-400"
        />
        <span>秒</span>
        <Button
          type="primary"
          onClick={onButtonClick}
          disabled={isNaN(parseInt(msgPeriod)) || parseInt(msgPeriod) <= 0}
          className="bg-sky-400"
        >
          {isStarted ? "停止" : "开始"}
        </Button>
      </div>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">发言内容:</span>
        <textarea
          value={msgContent}
          onChange={onContentChange}
          className="h-20 border-2 border-slate-400 rounded flex-grow"
        ></textarea>
      </div>
    </div>
  );
}
