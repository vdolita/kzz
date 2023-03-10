import { Stack, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import TabPanel from "../components/tab-panel";
import AutoHelper from "./auto-helper/helper";
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
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <ToolLayout>
      <Stack spacing={0}>
        <Tabs value={tabIndex} onChange={handleChange}>
          <Tab label="自动功能" {...a11yProps(0)} />
          <Tab label="互动" {...a11yProps(1)} />
          <Tab label="日志" {...a11yProps(2)} />
        </Tabs>
        <TabPanel value={tabIndex} index={0}>
          <AutoHelper />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          Item Two
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          Item Three
        </TabPanel>
      </Stack>
    </ToolLayout>
  );
};
