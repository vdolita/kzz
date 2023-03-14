import { Radio, Button, Select } from "antd";
import type { RadioChangeEvent } from "antd";
import { useEffect, useState } from "react";
import { interval, startWith, Subscription, timer } from "rxjs";
import _ from "lodash";

interface Product {
  productID: number;
  order: number;
  name: string;
}

export default function Explanation() {
  const [timeUnit, setTimeUnit] = useState(1);
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isStarted, setIsStarted] = useState(false);
  const [expSub, setExpSub] = useState<Subscription>(null);
  const [gapSub, setGapSub] = useState<Subscription>(null);
  const [expPeriod, setExpPeriod] = useState<string>("1");
  const [gapPeriod, setGapPeriod] = useState<string>("1");

  /**  //button/span[contains(text(),"开始讲解")]/ancestor::div[contains(@class, "goods-item")] */
  /**  //div[contains(@class, "with-order")]/input  */
  /**  //div[contains(@id, '3847058175018')]//button/span[contains(text(), '开始')]/.. */

  const onChange = (e: RadioChangeEvent) => {
    setTimeUnit(e.target.value);
  };

  function getTimeUnitStr() {
    switch (timeUnit) {
      case 1:
        return "秒";
      case 2:
        return "分钟";
      case 3:
        return "小时";
      default:
        return "";
    }
  }

  function getProducts(): Product[] {
    const snapItems = document.evaluate(
      "//button/span[contains(text(),'开始讲解')]/ancestor::div[contains(@class, 'goods-item')]",
      document,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );

    const p: Product[] = [];

    for (let i = 0; i++; i < snapItems.snapshotLength) {
      const item = snapItems.snapshotItem(i) as HTMLDivElement;
      // id=c1goods-3765256721344
      const id = item.id.split("-")[1];
      const snapInput = document.evaluate(
        `//div[contains(@class, 'with-order')]/input`,
        item,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      const snapProductTitle = document.evaluate(
        `//div[contains(@class, 'cardTitle')]/div[contains(@class, 'text')]`,
        item,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );

      const input = snapInput.singleNodeValue as HTMLInputElement;
      const productTitle = snapProductTitle.singleNodeValue as HTMLDivElement;
      const order = input.value;
      p.push({
        productID: parseInt(id),
        order: parseInt(order),
        name: productTitle.innerText,
      });
    }

    return p;
  }

  function getOptions() {
    return products.map((p) => ({ label: p.productID, value: p.order }));
  }

  function onExpPeriodChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === "") {
      setExpPeriod("");
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

    setExpPeriod(e.target.value);
  }

  function onGapPeriodChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === "") {
      setGapPeriod("");
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

    setGapPeriod(e.target.value);
  }

  function startExplanation(): string {
    if (selected.size === 0) {
      return;
    }
    const pdID = selected.values().next().value;
    const pdBtn = document.evaluate(
      `//div[contains(@id, '${pdID}')]//button/span[contains(text(), '开始')]/..`,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as HTMLButtonElement;

    if (!pdBtn) {
      return;
    }

    selected.delete(pdID);
    setSelected(new Set(selected));
    pdBtn.click();
    return pdID;
  }

  function endExplanation(pdId: string) {
    const pdBtn = document.evaluate(
      `//div[contains(@id, '${pdId}')]//button/span[contains(text(), '结束')]/..`,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as HTMLButtonElement;

    if (!pdBtn) {
      return;
    }

    pdBtn.click();
  }

  function startIntervalExplanation() {
    gapSub?.unsubscribe();
    expSub?.unsubscribe();

    let expPeriodSeconds = parseInt(expPeriod);
    const gapPeriodSeconds = parseInt(gapPeriod);

    if (timeUnit === 2) {
      expPeriodSeconds *= 60;
    } else if (timeUnit === 3) {
      expPeriodSeconds *= 3600;
    }

    const newSub = interval(expPeriodSeconds * 1000 + gapPeriodSeconds * 1000)
      .pipe(startWith(0))
      .subscribe(() => {
        const pdId = startExplanation();
        if (!pdId) {
          return;
        }

        const newExpSub = timer(expPeriodSeconds * 1000).subscribe(() => {
          endExplanation(pdId);
        });

        setExpSub(newExpSub);
      });

    setGapSub(newSub);
  }

  function onButtonClick() {
    if (isStarted) {
      expSub?.unsubscribe();
      gapSub?.unsubscribe();
      setExpSub(null);
      setGapSub(null);
    } else {
      startIntervalExplanation();
    }
    setIsStarted(!isStarted);
  }

  const handleChange = (value: string[]) => {
    console.log(`selected ${value}`);
    setSelected(new Set(value));
  };

  // refresh products every 100ms
  useEffect(() => {
    const productSubscribe = interval(100).subscribe(() => {
      // const pds = getProducts();
      // if (_.isEqual(pds, products)) {
      //   return;
      // } else {
      //   setProducts(pds);
      // }
      setProducts(getProducts());
    });

    return () => {
      productSubscribe?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      expSub?.unsubscribe();
    };
  }, [expSub]);

  return (
    <div className="flex flex-col gap-y-2 bg-stone-50 p-2">
      <p className="text-base text-center">商品讲解</p>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">时间模式:</span>
        <Radio.Group onChange={onChange} value={timeUnit}>
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
          value={expPeriod}
          onChange={onExpPeriodChange}
          className="basis-20 rounded border-2 border-slate-400"
        />
        <span>{getTimeUnitStr()}</span>
        <span className="basis-16">间隔:</span>
        <input
          type="number"
          min={1}
          max={86400}
          value={gapPeriod}
          onChange={onGapPeriodChange}
          className="basis-20 rounded border-2 border-slate-400"
        />
        <span>秒</span>
      </div>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">讲解顺序:</span>
        <div className="flex-grow">
          <Select
            className="w-full"
            mode="multiple"
            allowClear
            placeholder="按讲解顺序选择商品序号"
            defaultValue={[]}
            onChange={handleChange}
            options={getOptions()}
            value={Array.from(selected)}
          />
        </div>
      </div>
      <Button
        type="primary"
        disabled={isNaN(parseInt(expPeriod)) || parseInt(expPeriod) <= 0}
        className="bg-sky-400"
        onClick={onButtonClick}
      >
        {isStarted ? "停止讲解" : "开始讲解"}
      </Button>
    </div>
  );
}
