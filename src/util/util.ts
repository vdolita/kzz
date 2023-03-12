import { protocol } from 'electron';


function registerProtocol() {
    protocol.registerFileProtocol('file', (request, callback) => {
        const url = request.url.replace('file:///', '');
        callback({ path: url });
    })
}

export { registerProtocol }