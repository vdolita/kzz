import { Button, InputNumber, Input } from "antd";
import { ChangeEvent, useEffect, useState } from "react";
import { interval, Subscription } from "rxjs";
import FeatureBox from "../components/feature-box";

const defaultPeriod = 60;
const minPeriod = 1;
const maxPeriod = 86400;

const { TextArea } = Input;

export default function IntervalMsg() {
  const [msgPeriod, setMsgPeriod] = useState<number>(defaultPeriod);
  const [msgContent, setMsgContent] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [sub, setSub] = useState<Subscription>(null);

  const onChange = (val: number) => {
    console.log(`set period to ${val}`);
    setMsgPeriod(val);
  };

  const onContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMsgContent(e.target.value);
  };

  function sendMsg() {
    //   "//button/span[contains(text(), '发送')]/..",
    const msgInput: HTMLInputElement | null = document.evaluate(
      '//input[contains(@placeholder, "发公评")]',
      document.body,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as HTMLInputElement;

    //var s =document.createElement('script')
    // s.src = "http://localhost:8080/tool.js"
    // document.body.appendChild(s)

    const msgButton: HTMLButtonElement | null = document.evaluate(
      "//button/span[contains(text(), '发送')]/..",
      document.body,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as HTMLButtonElement;

    if (!msgInput || !msgButton) {
      return;
    }

    const event = new Event("invalid", { bubbles: true });
    msgInput.value = msgContent;
    msgInput.dispatchEvent(event);
    msgButton.click();
  }

  function startInterval() {
    if (msgPeriod <= 0) {
      return;
    }

    console.log("start interval");
    const msgSub = interval(msgPeriod * 1000).subscribe(() => {
      console.log("send msg");
      sendMsg();
    });

    setSub(msgSub);
  }

  const onButtonClick = () => {
    if (!isStarted) {
      startInterval();
    } else {
      sub && console.log("unsubscribe");
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
          disabled={msgContent === "" || !msgPeriod}
          className="bg-sky-400"
          size="small"
        >
          {isStarted ? "停止" : "开始"}
        </Button>
      </div>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">发言内容:</span>
        <div className="flex-grow">
          <TextArea
            value={msgContent}
            onChange={onContentChange}
            disabled={isStarted}
            rows={3}
          />
        </div>
      </div>
    </FeatureBox>
  );
}
