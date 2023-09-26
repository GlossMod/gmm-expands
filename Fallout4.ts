/**
 * @description 辐射4 安装支持
 */

import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { basename, join, extname, dirname } from 'node:path'
import { FileHandler } from "@src/model/FileHandler"
import { statSync } from "fs";
import { useManager } from "@src/stores/useManager";
import { ElMessage } from "element-plus";
import { Manager } from "@src/model/Manager";

function getModFolder(mod: IModInfo) {
    let modFolder = ""
    const manager = useManager()
    for (let index = 0; index < mod.modFiles.length; index++) {
        const item = mod.modFiles[index];
        let modStorage = join(manager.modStorage ?? "", mod.id.toString(), item)
        if (statSync(modStorage).isFile()) {
            if (extname(modStorage) == '.esp') {
                modFolder = dirname(modStorage)
                break
            }
        }
    }
    return modFolder
}

// 处理 mods
function handleMods(mod: IModInfo, installPath: string, isInstall: boolean) {

    let modFolder = getModFolder(mod)
    const manager = useManager()
    let res: IState[] = []
    mod.modFiles.forEach(async item => {
        try {
            let modStorage = join(manager.modStorage ?? "", mod.id.toString(), item)
            if (statSync(modStorage).isFile()) {
                // console.log(modStorage);
                // 从 modStorage 中移除 modFolder
                let gamePath = modStorage.replace(modFolder, "")
                let target = join(manager.gameStorage ?? "", installPath, gamePath)
                // console.log(target);
                if (isInstall) {
                    let state = await FileHandler.copyFile(modStorage, target)
                    res.push({ file: item, state: state })
                } else {
                    let state = FileHandler.deleteFile(target)
                    res.push({ file: item, state: state })
                }
            }
        } catch (error) {
            res.push({ file: item, state: false })
        }

    })

    return res
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
            name: 'steam 启动',
            exePath: 'steam://rungameid/377160'
        },
        {
            name: '直接启动',
            exePath: "Fallout4.exe"
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/6b.png",
    modType: [
        {
            id: 1,
            name: 'esp',
            installPath: 'Data',
            async install(mod) {
                return handleMods(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handleMods(mod, this.installPath ?? "", false)
            },
        },
        {
            id: 2,
            name: "Data",
            installPath: "Data",
            async install(mod) {
                return Manager.installByFolder(mod, this.installPath ?? "", "data", true, false, true)
            },
            async uninstall(mod) {
                return Manager.installByFolder(mod, this.installPath ?? "", "data", false, false, true)
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
        let esp = false
        let data = false

        mod.modFiles.forEach(item => {
            if (extname(item) == '.esp') esp = true
            if (item.toLowerCase().includes('data')) data = true
        })

        if (data) return 2

        if (esp) return 1

        return 99
    }
}