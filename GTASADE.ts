/**
 * @description 无人深空 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { basename, join, extname } from "node:path"
import { ElMessage } from "element-plus";
import { Manager } from "@src/model/Manager";
import { FileHandler } from "@src/model/FileHandler";

export const supportedGames: ISupportedGames = {
    gameID: 258,
    steamAppID: 1547000,
    NexusMods: {
        game_domain_name: 'grandtheftautothetrilogy',
        game_id: 4142
    },
    installdir: join("GTA San Andreas - Definitive Edition", "Gameface", "Binaries", "Win64"),
    gameName: "GTA San Andreas Definitive Edition",
    gameExe: [
        {
            name: "SanAndreas.exe",
            rootPath: join('..', '..', '..')
        }
    ],
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1547000"
        },
        {
            name: "直接启动",
            exePath: join("Gameface", "Binaries", "Win64", "SanAndreas.exe")
        }
    ],
    gameCoverImg: "imgs/gtasade_logo.jpg",
    modType: [
        {
            id: 1,
            name: "pak",
            installPath: join("Gameface", "Content", "Paks", "~mods"),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", false)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", false)
            }
        },
        {
            id: 2,
            name: "游戏根目录",
            installPath: "",
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", true)
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
        let pak = false
        let rootFolder = false
        let folderList = ['Engine', 'Gameface', 'Redistributables']

        mod.modFiles.forEach(item => {
            // 判断目录是否包含 folderList
            let list = FileHandler.pathToArray(item)
            if (list.some(item => folderList.includes(item))) rootFolder = true
            if (extname(item) == '.pak') pak = true
        })

        if (rootFolder) return 2
        if (pak) return 1

        return 99
    }
}