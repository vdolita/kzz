import { createRoot } from 'react-dom/client';

import './index.css';
import WindowManage from './window-manage';

const NewApp = () => {
    const root = document.querySelector('#root');
    const app = createRoot(root);
    app.render(<App />);
};

const App = () => {
    // const [isActivated, setIsActivated] = useState<boolean>(false);
    // const [activating, setActivating] = useState<boolean>(false);

    // async function handleActivate(key: string) {
    //     setActivating(true);
    //     const result = await window.Asuka.activateSoftware(key);
    //     if (result) {
    //         setIsActivated(true);
    //     }
    //     setActivating(false);
    // }

    // return isActivated ? <WindowManage /> : <Activate loading={activating} onActivate={handleActivate} />;
    return <WindowManage />;
};

export default NewApp;
