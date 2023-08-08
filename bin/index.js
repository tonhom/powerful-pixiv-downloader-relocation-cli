#! /usr/bin/env node

const chalk = require("chalk")
const boxen = require("boxen")
const figlet = require("figlet")
const path = require("path")
const fs = require("fs").promises
const yargs = require("yargs")
const configReader = require('yml-config-reader')
const utility = require("../src/utility")

let currentPath = process.cwd()

// const greeting = chalk.white.bold("PIXIV download relocation tool");
// const boxenOptions = {
//     padding: 1,
//     margin: 1,
//     borderStyle: "round",
//     borderColor: "green",
//     backgroundColor: "#555555"
// }
// const msgBox = boxen(greeting, boxenOptions)
// console.log(msgBox)

const usage = chalk.keyword('violet')("\nUsage: pixiv-re -l <location>  \n")
const options = yargs
    .usage(usage)
    .option("l", { alias: "location", describe: "Set directory to move to (default to upper directory)", type: "string", demandOption: false })
    .help(true)
    .argv
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

if (argv.location == null && argv.l == null) {
    console.log(
        chalk.yellow(
            figlet.textSync('Pixiv Tool', { horizontalLayout: 'full' })
        )
    )
    yargs.showHelp()
    return
}

let targetDir = path.resolve(currentPath)
if (argv.location != null) {
    if (path.isAbsolute(argv.location)) {
        targetDir = path.resolve(argv.location)
    } else {
        targetDir = path.resolve(currentPath, argv.location)
    }
}

// reading ignore list
const ignoreDirs = configReader.getByFiles('../src/config/ignore.yaml')

//#region main process
async function relocateContents (dir, targetDir) {
    return new Promise(async (resolve, reject) => {
        let files = await utility.getFiles(dir)

        for (const file of files) {
            try {
                await fs.rename(path.join(dir, file), path.join(targetDir, file))
            } catch (error) {
                console.log(chalk.redBright("can not move file because: "))
                console.log(error)

                reject(error)
            }
        }

        resolve(true)
    })
}

async function removeDir (dir) {
    await fs.rm(dir, {
        recursive: true,
        force: true
    })

    console.log(chalk.greenBright('relocate from ' + dir + ' completed'))
    return true
}

async function main () {
    console.log(chalk.yellowBright('start listing directory'))
    let files = await utility.getFiles(currentPath, true)
    for (const dir of files) {
        let imgDir = path.join(currentPath, dir)
        let lStat = await fs.lstat(imgDir)
        let isDir = lStat.isDirectory()
        let isInIgnoreDirs = ignoreDirs.dirs.indexOf(dir) > -1
        let isPixivDownloadDir = dir.endsWith("pixiv")

        if (isDir && !isInIgnoreDirs && isPixivDownloadDir) {
            await relocateContents(imgDir, targetDir)
            await removeDir(imgDir)
        }
    }
}

//#endregion main process


main()