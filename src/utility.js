const fs = require("fs").promises
const path = require("path")

module.exports = {
    async getFiles (currentPath, sort = false) {
        let files = await fs.readdir(currentPath)

        if (sort) {
            files.sort(async (a, b) => {
                let ta = await fs.stat(path.join(currentPath, a))
                let tb = await fs.stat(path.join(currentPath, b))
                return ta.mtime.getTime() - tb.mtime.getTime()
            })
        }
        
        return files
    }
}