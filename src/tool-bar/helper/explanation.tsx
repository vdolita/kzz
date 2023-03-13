import { Radio, Button, Select } from "antd";
import type { RadioChangeEvent } from "antd";
import { useEffect, useState } from "react";
import { interval, Subscription } from "rxjs";

interface Product {
  productID: number;
  order: number;
  name: string;
}

export default function Explanation() {
  const [timeUnit, setTimeUnit] = useState(1);
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [productSubscribe, setProductSubscribe] = useState<Subscription>(
    interval(100).subscribe(() => {
      const pds = getProducts();
      setProducts(pds);
    })
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isStarted, setIsStarted] = useState(false);
  const [sub, setSub] = useState<Subscription>(null);

  //  //button/span[contains(text(),"开始讲解")]/ancestor::div[contains(@class, "goods-item")]
  //  //div[contains(@class, "with-order")]/input

  const onChange = (e: RadioChangeEvent) => {
    console.log("radio checked", e.target.value);
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

  function onButtonClick() {
    if (isStarted) {
      sub?.unsubscribe();
      setSub(null);
    } else {
      const sub = interval(100).subscribe(() => {
        //
      });
      setSub(sub);
    }
    setIsStarted(!isStarted);
  }

  const handleChange = (value: string[]) => {
    console.log(`selected ${value}`);
    setSelected(new Set(value));
  };

  useEffect(() => {
    return () => {
      productSubscribe?.unsubscribe();
    };
  }, [productSubscribe]);

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
          className="basis-20 rounded border-2 border-slate-400"
        />
        <span>{getTimeUnitStr()}</span>
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
      <Button type="primary" className="bg-sky-400">
        {isStarted ? "停止讲解" : "开始讲解"}
      </Button>
    </div>
  );
}
