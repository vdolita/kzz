import { protocol } from "electron"

function registerFileProtocol() {
    protocol.registerFileProtocol('kzz', (request, callback) => {
        const url = request.url.replace('kzz://', '')
        callback(url)
    })
}

export { registerFileProtocol}