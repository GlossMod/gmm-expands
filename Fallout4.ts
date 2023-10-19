/**
 * @description 辐射4 安装支持
 */

import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { basename, join, extname, dirname } from 'node:path'
import { FileHandler } from "@src/model/FileHandler"
import { useManager } from "@src/stores/useManager";
import { ElMessage } from "element-plus";
import { Manager } from "@src/model/Manager";
import ini from 'ini'
import { statSync, readFileSync, writeFileSync } from "fs";
import { homedir } from 'os'

// 修改 Archive配置
async function setArchive() {
    try {
        let documents = await FileHandler.getMyDocuments()
        const Starfield = join(documents, "My Games", "Fallout4", "Fallout4.ini")
        let config = ini.parse(readFileSync(Starfield, 'utf-8'))
        console.log(config);
        if (config.Archive?.bInvalidateOlderFiles == 1) {
            console.log('Fallout4.ini 已配置过, 无需再次配置.');
            return
        }
        if (config.Archive) {
            config.Archive.bInvalidateOlderFiles = 1
            config.Archive.sResourceDataDirsFinal = ""
            writeFileSync(Starfield, ini.stringify(config))
        }
    } catch (error) {
        ElMessage.error(`配置 Fallout4.ini 失败! ${error}`)
    }
}
// 修改 plugins
async function setPlugins(mod: IModInfo, install: boolean) {
    // AppData\Local\Fallout4\plugins.txt
    let documents = join(homedir(), "AppData", "Local", "Fallout4", "plugins.txt")
    let plugins = await FileHandler.readFileSync(documents)
    let arr = plugins.split('\n')
    mod.modFiles.forEach(item => {
        if (extname(item) == '.esp' || extname(item) == '.esm') {
            if (install) {
                arr.push(`*${basename(item)}`)
            } else {
                arr = arr.filter(i => i != `*${basename(item)}`)
            }
        }
    })
    // arr 中移除空内容
    arr = arr.filter(i => i != "")

    FileHandler.writeFile(documents, arr.join('\n'))

}

// 获取 f4se_loader.exe 所在目录
function getBaseFolder(mod: IModInfo) {
    let folder = ""
    mod.modFiles.forEach(item => {
        if (basename(item) == 'f4se_loader.exe') {
            folder = dirname(item)
        }
    })
    return folder
}

function handleF4se(mod: IModInfo, install: boolean) {
    const manager = useManager()
    const modStorage = join(manager.modStorage ?? "", mod.id.toString())

    let baseFolder = getBaseFolder(mod)
    if (baseFolder == "") {
        ElMessage.error(`未找到 f4se_loader.exe, 请不要随意修改MOD类型`)
        return false
    }

    mod.modFiles.forEach(item => {
        let source = join(modStorage, item)
        if (statSync(source).isFile()) {
            // 从 item 中移除 folder
            let path = item.replace(baseFolder, "")
            let target = join(manager.gameStorage ?? "", path)
            if (install) FileHandler.copyFile(source, target)
            else FileHandler.deleteFile(target)
        }
    })

    return true
}

export const supportedGames: ISupportedGames = {
    gameID: 6,
    steamAppID: 377160,
    installdir: join("Fallout 4"),
    gameName: "Fallout 4",
    gameExe: [
        {
            name: "Fallout4.exe",
            rootPath: ""
        },
        {
            name: "Fallout4Launcher.exe",
            rootPath: ""
        }
    ],
    // startExe: join('bin', 'x64', 'witcher3.exe'),
    startExe: [
        {
            name: 'Steam 启动',
            exePath: 'steam://rungameid/377160'
        },
        {
            name: '直接启动',
            exePath: "Fallout4.exe"
        },
        {
            name: 'F4SE 启动',
            exePath: 'f4se_loader.exe'
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/6b.png",
    modType: [
        // {
        //     id: 1,
        //     name: 'esp',
        //     installPath: 'Data',
        //     async install(mod) {
        //         setPlugins(mod, true)
        //         return handleMods(mod, this.installPath ?? "", true)
        //     },
        //     async uninstall(mod) {
        //         setPlugins(mod, false)
        //         return handleMods(mod, this.installPath ?? "", false)
        //     },
        // },
        {
            id: 2,
            name: "Data",
            installPath: "Data",
            async install(mod) {
                setPlugins(mod, true)
                setArchive()
                return Manager.installByFolder(mod, this.installPath ?? "", "data", true, false, true)
            },
            async uninstall(mod) {
                setPlugins(mod, false)
                return Manager.installByFolder(mod, this.installPath ?? "", "data", false, false, true)
            }
        },
        {
            id: 3,
            name: 'f4se',
            installPath: '',
            async install(mod) {
                return handleF4se(mod, true)
            },
            async uninstall(mod) {
                return handleF4se(mod, false)
            }
        },
        {
            id: 99,
            name: "未知",
            installPath: "",
            async install(mod) {
                ElMessage.warning("未知类型, 请手动安装")
                return false
            },
            async uninstall(mod) {
                return true
            }
        }
    ],
    checkModType(mod) {
        // let esp = false
        let data = false
        // let esm = false
        let f4se = false

        mod.modFiles.forEach(item => {
            // if (extname(item) == '.esp') esp = true
            // if (extname(item) == '.esm') esm = true
            if (item.toLowerCase().includes('data')) data = true
            if (basename(item) == 'f4se_loader.exe') f4se = true
        })

        if (f4se) return 3

        if (data) return 2

        // if (esp) return 1
        // if (esm) return 3


        return 99
    }
}