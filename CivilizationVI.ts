/**
 * @description 文明6 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join, extname, basename } from "node:path"
import { ElMessage } from "element-plus";
import { FileHandler } from "@src/model/FileHandler";
import { Manager } from "@src/model/Manager";



export const supportedGames: ISupportedGames = {
    gameID: 5,
    steamAppID: 289070,
    installdir: join("Sid Meier's Civilization VI", "Base", "Binaries", "Win64Steam"),
    gameName: "Sid Meier's Civilization VI",
    gameExe: [
        {
            name: "CivilizationVI.exe",
            rootPath: join("..", "..", "..")
        }
    ],
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/289070"
        },
        {
            name: "直接启动",
            exePath: join("Base", "Binaries", "Win64Steam", "CivilizationVI.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/5.jpg",
    modType: [
        {
            id: 1,
            name: "mods",
            installPath: join(FileHandler.getMyDocuments(), "My Games", "Sid Meier's Civilization VI", "Mods"),
            async install(mod) {
                return Manager.installByFile(mod, this.installPath ?? "", ".modinfo", true, true, false)
            },
            async uninstall(mod) {
                return Manager.installByFile(mod, this.installPath ?? "", ".modinfo", false, true, false)
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
        // let loader = false
        let mods = false

        mod.modFiles.forEach(item => {
            // if (basename(item) == 'python35.dll') loader = true
            // 判断路径是否包含 data
            if (extname(item) == '.modinfo') mods = true
        })

        // if (loader) return 1
        if (mods) return 1

        return 99
    }
}