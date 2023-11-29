/**
 * @description 深海迷航 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { basename, join, extname } from "node:path"
import { ElMessage } from "element-plus";
import { Manager } from "@src/model/Manager";


export const supportedGames: ISupportedGames = {
    gameID: 105,
    steamAppID: 264710,
    NexusMods: {
        game_id: 1155,
        game_domain_name: "subnautica",
    },
    installdir: join("Subnautica"),
    gameName: "Subnautica",
    gameExe: "Subnautica.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/264710"
        },
        {
            name: "直接启动",
            exePath: join("Subnautica.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/105a.jpg",
    modType: [
        {
            id: 1,
            name: "BepInEx",
            installPath: join(""),
            async install(mod) {
                return Manager.installByFileSibling(mod, this.installPath ?? "", 'winhttp.dll', true)
            },
            async uninstall(mod) {
                return Manager.installByFileSibling(mod, this.installPath ?? "", 'winhttp.dll', false)
            }
        },
        {
            id: 2,
            name: "plugins",
            installPath: join("BepInEx", "plugins"),
            async install(mod) {
                return Manager.installByFolder(mod, this.installPath ?? "", "plugins", true, false, true)
            },
            async uninstall(mod) {
                return Manager.installByFolder(mod, this.installPath ?? "", "plugins", false, false, true)
            }
        },
        {
            id: 3,
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
        let BepInEx = false
        let plugins = false

        mod.modFiles.forEach(item => {
            if (basename(item).toLowerCase() == 'winhttp.dll') BepInEx = true
            if (extname(item) == '.dll') plugins = true
        })

        if (BepInEx) return 1
        if (plugins) return 2

        return 99
    }
}