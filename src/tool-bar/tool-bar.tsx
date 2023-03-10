import { createRoot } from "react-dom/client";
import ToolLayout from "./layout";

import "./tool-bar.css";

function NewToolBar() {
  const toolBar = document.createElement("div");
  toolBar.id = "kzz-tool-bar";
  document.body.appendChild(toolBar);

  const root = createRoot(document.getElementById("kzz-tool-bar"));
  root.render(<ToolBar />);
  console.log("tool loaded");
}

export default NewToolBar;

const ToolBar = () => {
  return (
    <ToolLayout>
      <h1>Hellos</h1>
    </ToolLayout>
  );
};
