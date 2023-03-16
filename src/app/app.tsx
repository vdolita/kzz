import { createRoot } from "react-dom/client";
import Activate from "./activate";

import "./index.css";

const NewApp = () => {
  const root = document.querySelector("#root");
  const app = createRoot(root);
  app.render(<App />);
};

const App = () => {
  return <Activate loading={false} onActivate={() => {}} />;
};

export default NewApp;
