import { createRoot } from "react-dom/client";

import './tool-bar.css'

const ToolBar = function() {
  const root = document.createElement('div');
  root.classList.add('tool-bar');

  document.body.appendChild(root);
  createRoot(root).render(<div>Asuka</div>)
}

export default ToolBar