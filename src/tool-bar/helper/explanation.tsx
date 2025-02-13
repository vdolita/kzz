import { Radio, Button, Select, InputNumber, Switch } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import FeatureBox from '../components/feature-box';
import { timer } from 'rxjs/internal/observable/timer';
import { interval } from 'rxjs/internal/observable/interval';
import { isExpObserverStarted, setExpCallback, startExpObserver, stopExpObserver } from '../observer/explanation';

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
    const [expPeriod, setExpPeriod] = useState<number>(defaultPeriod);
    const [gapPeriod, setGapPeriod] = useState<number>(defaultPeriod);
    const [isInterval, setIsInterval] = useState(true);
    const [currentProduct, setCurrentProduct] = useState<string>('');

    const refreshRef = useRef(null);

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
        setSelected(value);
    };

    function onButtonClick() {
        if (isStarted) {
            stopExpObserver();
        } else {
            startExpInterval();
        }
        setIsStarted(!isStarted);
    }

    function getTimeUnitStr() {
        switch (timeUnit) {
            case 1:
                return '秒';
            case 2:
                return '分';
            case 3:
                return '时';
            default:
                return '';
        }
    }

    function getProducts(): Product[] {
        const snapItems = document.evaluate(
            "//button/span[contains(text(),'讲解')]/ancestor::div[contains(@class, 'goods-item') and @role='button']",
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null,
        );

        const p: Product[] = [];

        for (let i = 0; i < snapItems.snapshotLength; i++) {
            const item = snapItems.snapshotItem(i) as HTMLDivElement;
            // id=c1goods-3765256721344
            const id = item.id.split('-')[1];

            const snapInput = document.evaluate(
                `.//div[contains(@class, 'with-order')]/input`,
                item,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null,
            );
            const snapProductTitle = document.evaluate(
                `.//div[contains(@class, 'cardTitle')]/div[contains(@class, 'text')]`,
                item,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null,
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
        try {
            if (selected.length === 0) {
                setIsStarted(false);
                stopExpObserver();
                return '';
            }

            let pdID = selected[0];
            const pdIndex = selected.indexOf(currentProduct);

            if (pdIndex > -1 && pdIndex < selected.length - 1) {
                pdID = selected[pdIndex + 1];
            }

            const pdBtn = document.evaluate(
                `//div[contains(@id, '${pdID}')]//button/span[contains(text(), '开始')]/..`,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null,
            ).singleNodeValue as HTMLButtonElement;

            if (!pdBtn) {
                return;
            }

            if (!isInterval) {
                const newSelected = selected.filter((s) => s !== pdID);
                setSelected(newSelected);
            }

            console.log('start exp click', pdID, new Date());
            pdBtn.click();
            timer(1000).subscribe(() => {
                clickConfirmBtn();
            });

            setCurrentProduct(pdID);
            return pdID;
        } catch (e) {
            console.info(e, new Date());
        }
    }, [currentProduct, isInterval, selected]);

    function clickConfirmBtn() {
        const buttons = document.evaluate(
            `//div[contains(@class, "ant-modal-body")]//button[contains(@class, 'ant-btn-primary')]`,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null,
        );

        for (let i = 0; i < buttons.snapshotLength; i++) {
            const btn = buttons.snapshotItem(i) as HTMLButtonElement;
            btn.click();
        }
    }

    const endExplanation = useCallback(() => {
        const pdBtn = document.evaluate(
            `//div[contains(@id, 'recording')][contains(@class, 'container')]//button/span[contains(text(), '结束')]/..`,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
        ).singleNodeValue as HTMLButtonElement;

        if (!pdBtn) {
            return;
        }

        pdBtn.click();

        timer(1000).subscribe(() => {
            clickConfirmBtn();
        });
    }, []);

    function startExpInterval() {
        let expPeriodSeconds = expPeriod;
        const gapPeriodSeconds = gapPeriod;

        if (timeUnit === 2) {
            expPeriodSeconds *= 60;
        } else if (timeUnit === 3) {
            expPeriodSeconds *= 3600;
        }

        setExpCallback(startExplanation, endExplanation);
        startExpObserver(expPeriodSeconds * 1000, gapPeriodSeconds * 1000);
    }

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
        console.log('refresh products');
        setProducts(pds);
    }, [products]);

    // refresh products every 100ms
    useEffect(() => {
        if (refreshRef.current) {
            refreshRef.current.unsubscribe();
        }

        refreshRef.current = interval(100).subscribe(() => {
            refreshProducts();
        });

        return () => {
            refreshRef.current?.unsubscribe();
        };
    }, [refreshProducts]);

    useEffect(() => {
        if (isExpObserverStarted()) {
            console.info('set exp callback', new Date());
            setExpCallback(startExplanation, endExplanation);
            if (!isStarted) {
                setIsStarted(true);
            }
        }
    }, [endExplanation, isStarted, startExplanation]);

    return (
        <FeatureBox title="商品讲解">
            <div className="flex flex-row gap-x-4">
                <span className="basis-16">时间模式:</span>
                <div>
                    <Radio.Group onChange={onTimeUnitChange} value={timeUnit} disabled={isStarted} size="small">
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
                {isStarted ? '停止讲解' : '开始讲解'}
            </Button>
        </FeatureBox>
    );
}
