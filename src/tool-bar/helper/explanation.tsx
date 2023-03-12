import { Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import { useState } from "react";

export default function Explanation() {
  const [value, setValue] = useState(1);

  const onChange = (e: RadioChangeEvent) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };

  return (
    <div className="flex flex-col gap-y-2 bg-stone-50 p-2">
      <p className="text-base text-center">商品讲解</p>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">时间模式:</span>
        <Radio.Group onChange={onChange} value={value}>
          <Radio value={1}>秒钟</Radio>
          <Radio value={2}>分钟</Radio>
          <Radio value={3}>小时</Radio>
        </Radio.Group>
      </div>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">讲解时长:</span>
        <input
          type="number"
          min={1}
          max={86400}
          className="basis-20 rounded border-2 border-slate-400"
        />
        <span>秒</span>
        <span className="basis-16">间隔:</span>
        <input
          type="number"
          min={1}
          max={86400}
          className="basis-20 rounded border-2 border-slate-400"
        />
        <span>秒</span>
      </div>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">讲解顺序:</span>
        <input
          type="text"
          className="flex-grow rounded border-2 border-slate-400"
        />
      </div>
    </div>
  );
}
