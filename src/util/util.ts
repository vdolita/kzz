import { protocol } from "electron"

function registerFileProtocol() {
    protocol.registerFileProtocol('kzz', (request, callback) => {
        const filePath = request.url.replace('kzz:', 'file:')
        callback(filePath)
    })
}



export { registerFileProtocol }