import { Radio, Button, Select, InputNumber } from "antd";
import type { RadioChangeEvent } from "antd";
import { useCallback, useEffect, useState } from "react";
import { interval, startWith, Subscription, timer } from "rxjs";
import FeatureBox from "../components/feature-box";

interface Product {
  productID: number;
  order: number;
  name: string;
}

const defaultPeriod = 50;
const minPeriod = 1;
const maxPeriod = 86400;

export default function Explanation() {
  const [timeUnit, setTimeUnit] = useState(1);
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isStarted, setIsStarted] = useState(false);
  const [expSub, setExpSub] = useState<Subscription>(null);
  const [gapSub, setGapSub] = useState<Subscription>(null);
  const [pdSub, setPdSub] = useState<Subscription>(null);
  const [expPeriod, setExpPeriod] = useState<number>(defaultPeriod);
  const [gapPeriod, setGapPeriod] = useState<number>(defaultPeriod);

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
        return "分";
      case 3:
        return "时";
      default:
        return "";
    }
  }

  function getProducts(): Product[] {
    const snapItems = document.evaluate(
      "//button/span[contains(text(),'开始讲解')]/ancestor::div[contains(@class, 'goods-item')]",
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    const p: Product[] = [];

    for (let i = 0; i < snapItems.snapshotLength; i++) {
      const item = snapItems.snapshotItem(i) as HTMLDivElement;
      // id=c1goods-3765256721344
      const id = item.id.split("-")[1];

      const snapInput = document.evaluate(
        `.//div[contains(@class, 'with-order')]/input`,
        item,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      const snapProductTitle = document.evaluate(
        `.//div[contains(@class, 'cardTitle')]/div[contains(@class, 'text')]`,
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
    return products.map((p) => ({
      label: p.order,
      value: p.productID,
      key: p.productID,
    }));
  }

  function onExpPeriodChange(val: number) {
    setExpPeriod(val);
  }

  function onGapPeriodChange(val: number) {
    setGapPeriod(val);
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
    timer(1000).subscribe(() => {
      clickConfirmBtn();
    });
    return pdID;
  }

  function clickConfirmBtn() {
    const confirmBtn = document.evaluate(
      `//div[contains(@class, "ant-modal-body")]//button/span[contains(text(), "确 定")]/..`,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as HTMLButtonElement;

    if (!confirmBtn) {
      return;
    }

    confirmBtn.click();
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

    timer(1000).subscribe(() => {
      clickConfirmBtn();
    });
  }

  function startIntervalExplanation() {
    gapSub?.unsubscribe();
    expSub?.unsubscribe();

    let expPeriodSeconds = expPeriod;
    const gapPeriodSeconds = gapPeriod;

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

  function isProductsEqual(p1: Product[], p2: Product[]) {
    if (p1.length !== p2.length) {
      return false;
    }

    for (let i = 0; i < p1.length; i++) {
      if (p1[i].productID !== p2[i].productID) {
        return false;
      }
    }

    return true;
  }

  const refreshProducts = useCallback(() => {
    const pds = getProducts();
    if (isProductsEqual(pds, products)) {
      return;
    }
    console.log("products changed", pds);
    setProducts(pds);
  }, [products]);

  // refresh products every 100ms
  useEffect(() => {
    if (pdSub) {
      pdSub.unsubscribe();
    }
    console.log("refresh products");
    const productSubscribe = interval(100).subscribe(() => {
      refreshProducts();
    });

    setPdSub(productSubscribe);

    return () => {
      console.log("unsubscribe products");
      pdSub?.unsubscribe();
    };
  }, [pdSub, refreshProducts]);

  useEffect(() => {
    return () => {
      expSub?.unsubscribe();
    };
  }, [expSub]);

  return (
    <FeatureBox title="商品讲解">
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">时间模式:</span>
        <Radio.Group onChange={onChange} value={timeUnit} disabled={isStarted}>
          <Radio value={1}>秒钟</Radio>
          <Radio value={2}>分钟</Radio>
          <Radio value={3}>小时</Radio>
        </Radio.Group>
      </div>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">讲解时长:</span>
        <div>
          <InputNumber
            min={minPeriod}
            max={maxPeriod}
            value={expPeriod}
            onChange={onExpPeriodChange}
            size="small"
            disabled={isStarted}
          />
        </div>
        <span>{getTimeUnitStr()}</span>
        <span>间隔:</span>
        <div>
          <InputNumber
            min={minPeriod}
            max={maxPeriod}
            value={gapPeriod}
            onChange={onGapPeriodChange}
            size="small"
            disabled={isStarted}
          />
        </div>
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
        disabled={!selected.size || !gapPeriod || !expPeriod}
        className="bg-sky-400"
        onClick={onButtonClick}
      >
        {isStarted ? "停止讲解" : "开始讲解"}
      </Button>
    </FeatureBox>
  );
}
