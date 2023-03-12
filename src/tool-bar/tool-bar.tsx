import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { createRoot } from "react-dom/client";

import "./tool-bar.css";
import Helper from "./helper/helper";

function NewToolBar() {
  const toolBar = document.createElement("div");
  toolBar.id = "kzz-tool-bar";
  toolBar.classList.add("w-full");
  toolBar.classList.add("fixed");
  toolBar.classList.add("bottom-0");

  document.body.appendChild(toolBar);

  const root = createRoot(document.getElementById("kzz-tool-bar"));
  root.render(<ToolBar />);
  console.log("tool loaded");
}

export default NewToolBar;

const ToolBar = () => {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "功能设置",
      children: <Helper />,
    },
    // {
    //   key: "2",
    //   label: "ex",
    //   children: "Content of Tab Pane 2",
    // },
    // {
    //   key: "3",
    //   label: "其他功能",
    //   children: "Content of Tab Pane 3",
    // },
  ];

  return (
    <div className="px-2.5">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};
