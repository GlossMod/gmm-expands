import { FileHandler } from "@src/model/FileHandler";
import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { useManager } from "@src/stores/useManager";
import { join, basename, dirname } from 'path'
import { Manager } from "@src/model/Manager";
import { ElMessage } from "element-plus";

function handlePlugins(mod: IModInfo, installPath: string, isInstall: boolean) {
    if (isInstall) if (!Manager.checkInstalled("SMAPI", 197894)) return false
    let res: IState[] = []
    const manager = useManager()
    let modStorage = join(manager.modStorage, mod.id.toString())
    let gameStorage = join(manager.gameStorage ?? "", installPath)
    let folder: string[] = []
    mod.modFiles.forEach(item => {
        if (basename(item) == "manifest.json") {
            folder.push(dirname(join(modStorage, item)))
        }
    })
    if (folder.length > 0) {
        folder.forEach(item => {
            let target = join(gameStorage, basename(item))
            if (isInstall) {
                // FileHandler.copyFolder(item, target)               
                FileHandler.createLink(item, target)
            } else {
                // FileHandler.deleteFolder(target)         
                FileHandler.removeLink(target)
            }
        })

    }

    return res
}

export const supportedGames: ISupportedGames = {
    gameID: 10,
    steamAppID: 413150,
    NexusMods: {
        game_domain_name: 'stardewvalley',
        game_id: 1303
    },
    installdir: "Stardew Valley",
    gameName: "Stardew Valley",
    gameExe: 'Stardew Valley.exe',
    startExe: [
        {
            name: '启用 Mod 并启动游戏',
            exePath: 'StardewModdingAPI.exe'
        },
        {
            name: '禁用 Mod 并启动游戏',
            exePath: 'Stardew Valley.exe'
        },
        {
            name: 'Steam 启动 (无Mod)',
            exePath: 'steam://rungameid/413150'
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/10.jpg",
    modType: [
        {
            id: 1,
            name: "SMAPI",
            installPath: "",
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", true)
            }
        },
        {
            id: 2,
            name: "通用",
            installPath: "Mods",
            async install(mod) {
                return handlePlugins(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handlePlugins(mod, this.installPath ?? "", false)
            }
        },
        {
            id: 3,
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

        if (mod.webId == 197894) return 1

        let plugins = false
        // manifest.json
        mod.modFiles.forEach(item => {
            if (basename(item) == "manifest.json") plugins = true
        })

        if (plugins) return 2

        return 3
    }
}