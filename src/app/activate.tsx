import Button from 'antd/es/button';
import Input from 'antd/es/input/Input';
import { useState } from 'react';

interface ActivateProps {
    loading: boolean;
    onActivate: (code: string) => void;
}

export default function Activate({ loading, onActivate }: ActivateProps) {
    const [code, setCode] = useState<string>('');

    function onCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
        setCode(e.target.value);
    }

    function onActivateClick() {
        onActivate(code);
    }

    return (
        <div className="container mx-auto h-full">
            <div className="w-64 mx-auto h-full flex flex-col justify-center align-middle gap-y-5">
                <span className="">请激活您的软件</span>
                <div>
                    <Input placeholder="激活码" value={code} onChange={onCodeChange} />
                </div>
                <div className="place-self-center">
                    <Button className="w-52" type="primary" onClick={onActivateClick} loading={loading}>
                        {loading ? '激活中...' : '激活'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
