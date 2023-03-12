import { createRoot } from "react-dom/client";

const App = function() {
    const root = document.createElement('div');
    root.classList.add('app');
    document.body.appendChild(root);

    createRoot(root).render(<div>Asuka</div>)
}

export default App