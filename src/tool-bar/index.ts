import { createRoot } from "react-dom/client";


function NewToolBar() {
    const toolBar = document.createElement('div');
    toolBar.style.position = 'fixed';
    toolBar.style.bottom = '0';
    toolBar.style.left = '0';
    toolBar.style.width = '100%';
    toolBar.style.height = '200px';
    toolBar.style.backgroundColor = 'lightblue';

    toolBar.id = 'kzz-tool-bar';
    document.body.appendChild(toolBar);

    const root = createRoot(document.getElementById("kzz-tool-bar"));
    root.render('<h1>hello world</h1>');
    console.log('tool loaded')
}


export default NewToolBar;