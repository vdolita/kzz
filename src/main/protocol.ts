import { protocol, Session } from 'electron';

function registerFileProtocol(s?: Session) {
    let ptl = protocol;
    if (s) {
        ptl = s.protocol;
    }
    ptl.registerFileProtocol('kzz', (request, callback) => {
        const filePath = request.url.replace('kzz://', '');
        callback(filePath);
    });
}

export { registerFileProtocol };
