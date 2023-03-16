import { Radio, Button, Select, InputNumber, Switch } from "antd";
import type { RadioChangeEvent } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import FeatureBox from "../components/feature-box";
import { Subscription } from "rxjs/internal/Subscription";
import { timer } from "rxjs/internal/observable/timer";
import { interval } from "rxjs/internal/observable/interval";
import { startWith } from "rxjs/internal/operators/startWith";

interface Product {
  productID: number;
  order: number;
  name: string;
}

const defaultPeriod = 50;
const minPeriod = 1;
const maxPeriod = 86400;
const minGapPeriod = 5;

export default function Explanation() {
  const [timeUnit, setTimeUnit] = useState(1);
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [selected, setSelected] = useState<Array<string>>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [expSub, setExpSub] = useState<Subscription>(null);
  const [gapSub, setGapSub] = useState<Subscription>(null);
  const [expPeriod, setExpPeriod] = useState<number>(defaultPeriod);
  const [gapPeriod, setGapPeriod] = useState<number>(defaultPeriod);
  const [isInterval, setIsInterval] = useState(true);
  const [currentProduct, setCurrentProduct] = useState<string>("");

  const startExpRef = useRef<() => string>(null);
  const stopExpRef = useRef<() => void>(null);

  /**  //button/span[contains(text(),"开始讲解")]/ancestor::div[contains(@class, "goods-item")] */
  /**  //div[contains(@class, "with-order")]/input  */
  /**  //div[contains(@id, '3847058175018')]//button/span[contains(text(), '开始')]/.. */

  function onTimeUnitChange(e: RadioChangeEvent) {
    setTimeUnit(e.target.value);
  }

  function onExpPeriodChange(val: number) {
    setExpPeriod(val);
  }

  function onGapPeriodChange(val: number) {
    setGapPeriod(val);
  }

  function onIsIntervalChange() {
    setIsInterval(!isInterval);
  }

  const onSelectedPdsChange = (value: string[]) => {
    console.log(`selected ${value}`);
    setSelected(value);
  };

  function onButtonClick() {
    if (isStarted) {
      stopExpInterval();
    } else {
      startExpInterval();
    }
    setIsStarted(!isStarted);
  }

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

  const startExplanation = useCallback((): string => {
    if (selected.length === 0) {
      return "";
    }

    console.log("startExplanation", selected);

    let pdID = selected[0];
    const pdIndex = selected.indexOf(currentProduct);

    if (pdIndex > -1 && pdIndex < selected.length - 1) {
      pdID = selected[pdIndex + 1];
    }

    setCurrentProduct(pdID);

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

    if (!isInterval) {
      const newSelected = selected.filter((s) => s !== pdID);
      setSelected(newSelected);

      if (newSelected.length === 0) {
        expSub?.unsubscribe();
      }
    }

    pdBtn.click();
    timer(1000).subscribe(() => {
      clickConfirmBtn();
    });
    return pdID;
  }, [currentProduct, expSub, isInterval, selected]);

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

  function startExpInterval() {
    console.log("start interval");
    gapSub?.unsubscribe();
    expSub?.unsubscribe();

    let expPeriodSeconds = expPeriod;
    let gapPeriodSeconds = gapPeriod;

    if (gapPeriodSeconds < minGapPeriod) {
      gapPeriodSeconds = minGapPeriod;
    }

    if (timeUnit === 2) {
      expPeriodSeconds *= 60;
    } else if (timeUnit === 3) {
      expPeriodSeconds *= 3600;
    }

    const newGapSub = interval(
      expPeriodSeconds * 1000 + gapPeriodSeconds * 1000
    )
      .pipe(startWith(0))
      .subscribe(() => {
        console.log("start exxxp");
        const pdId = startExpRef.current();
        if (!pdId) {
          console.log("no product to start");
          setIsStarted(false);
          stopExpRef.current();
          return;
        }

        const newExpSub = timer(expPeriodSeconds * 1000).subscribe(() => {
          endExplanation(pdId);
        });

        setExpSub(newExpSub);
      });

    setGapSub(newGapSub);
  }

  const stopExpInterval = useCallback(() => {
    console.log("stop interval");
    expSub?.unsubscribe();
    gapSub?.unsubscribe();
    setExpSub(null);
    setGapSub(null);
  }, [expSub, gapSub]);

  function isProductsEqual(p1: Product[], p2: Product[]) {
    if (p1.length !== p2.length) {
      console.log("length not equal");
      return false;
    }

    for (let i = 0; i < p1.length; i++) {
      if (p1[i].productID !== p2[i].productID) {
        console.log("productID not equal", p1[i].productID, p2[i].productID);
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

  useEffect(() => {
    console.log("update stopExpRef");
    stopExpRef.current = (): void => {
      stopExpInterval();
    };
  }, [stopExpInterval]);

  useEffect(() => {
    console.log("update startExpRef");
    startExpRef.current = (): string => {
      return startExplanation();
    };
  }, [startExplanation]);

  // refresh products every 100ms
  useEffect(() => {
    console.log("refresh products");
    const productSubscribe = interval(100).subscribe(() => {
      refreshProducts();
    });

    return () => {
      console.log("unsubscribe products");
      productSubscribe?.unsubscribe();
    };
  }, [refreshProducts]);

  useEffect(() => {
    return () => {
      console.log("unsubscribe expSub effect");
      expSub?.unsubscribe();
    };
  }, [expSub]);

  useEffect(() => {
    return () => {
      console.log("unsubscribe gapSub effect");
      gapSub?.unsubscribe();
    };
  }, [gapSub]);

  return (
    <FeatureBox title="商品讲解">
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">时间模式:</span>
        <div>
          <Radio.Group
            onChange={onTimeUnitChange}
            value={timeUnit}
            disabled={isStarted}
            size="small"
          >
            <Radio value={1}>秒钟</Radio>
            <Radio value={2}>分钟</Radio>
            <Radio value={3}>小时</Radio>
          </Radio.Group>
        </div>
        <span>循环:</span>
        <div>
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            defaultChecked
            checked={isInterval}
            size="small"
            onChange={onIsIntervalChange}
          />
        </div>
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
            min={minGapPeriod}
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
            onChange={onSelectedPdsChange}
            options={getOptions()}
            value={Array.from(selected)}
          />
        </div>
      </div>
      <Button
        type="primary"
        disabled={!selected.length || !gapPeriod || !expPeriod}
        className="bg-sky-400"
        onClick={onButtonClick}
      >
        {isStarted ? "停止讲解" : "开始讲解"}
      </Button>
    </FeatureBox>
  );
}
