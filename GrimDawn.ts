/**
 * @description 恐怖黎明 支持
 */

import type { IModInfo, ISupportedGames } from "@src/model/Interfaces";
import { basename, join, extname } from "node:path"
import { ElMessage } from "element-plus";
import { Manager } from "@src/model/Manager";
import { FileHandler } from "@src/model/FileHandler";
import { useManager } from "@src/stores/useManager";


function handleMods(mod: IModInfo, installPath: string, isInstall: boolean) {
    const manager = useManager()
    let modStorage = join(manager.modStorage, mod.id.toString())
    let gameStorage = join(manager.gameStorage ?? "", installPath)


    let folders = [] as string[]
    let folderList = ['resources', 'database', 'localization']

    mod.modFiles.forEach(item => {
        if (folderList.includes(basename(item))) {
            console.log(basename(item));
            folders.push(join(modStorage, item, ".."))
        }
    })

    // files 去重
    folders = [...new Set(folders)]
    console.log(folders);

    folders.forEach(item => {
        let target = join(gameStorage, basename(item))
        if (isInstall) {
            FileHandler.createLink(item, target)
        } else {
            FileHandler.removeLink(target)
        }
    })
    return true
}


export const supportedGames: ISupportedGames = {
    gameID: 80,
    steamAppID: 219990,
    NexusMods: {
        game_id: 1190,
        game_domain_name: "grimdawn",
    },
    installdir: join("Grim Dawn"),
    gameName: "Grim Dawn",
    gameExe: "Grim Dawn.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/219990"
        },
        {
            name: "直接启动",
            exePath: join("Grim Dawn.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/80.jpg",
    modType: [
        {
            id: 1,
            name: "mods",
            installPath: join("mods"),
            async install(mod) {
                return handleMods(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handleMods(mod, this.installPath ?? "", false)
            }
        },
        {
            id: 2,
            name: "游戏根目录",
            installPath: join(""),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", false)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", false)
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

        let folderList = ['resources', 'database', 'localization']

        let mods = false
        let plugins = false

        mod.modFiles.forEach(item => {

            // 判断目录是否包含 folderList
            let list = FileHandler.pathToArray(item)
            if (list.some(item => folderList.includes(item))) mods = true
        })

        if (mods) return 1

        return 99
    }
}