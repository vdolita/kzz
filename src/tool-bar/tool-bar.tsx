import { createRoot } from "react-dom/client";

import "./tool-bar.css";

function NewToolBar() {
  const toolBar = document.createElement("div");

  toolBar.id = "kzz-tool-bar";
  document.body.appendChild(toolBar);

  const root = createRoot(document.getElementById("kzz-tool-bar"));
  root.render(<h1>test</h1>);
  console.log("tool loaded");
}

export default NewToolBar;
