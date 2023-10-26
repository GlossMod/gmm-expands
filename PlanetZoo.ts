/**
 * @description 无人深空 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { basename, join, extname } from "node:path"
import { ElMessage } from "element-plus";
import { Manager } from "@src/model/Manager";

export const supportedGames: ISupportedGames = {
    gameID: 327,
    steamAppID: 703080,
    installdir: join("Planet Zoo"),
    gameName: "Planet Zoo",
    gameExe: "PlanetZoo.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/703080"
        },
        {
            name: "直接启动",
            exePath: join("PlanetZoo.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/653a085c9ddd7.webp",
    modType: [
        {
            id: 1,
            name: "Mods",
            installPath: join("win64", "ovldata"),
            async install(mod) {
                return Manager.installByFile(mod, this.installPath ?? "", 'manifest.xml', true)
            },
            async uninstall(mod) {
                return Manager.installByFile(mod, this.installPath ?? "", 'manifest.xml', false)
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
        let mods = false

        mod.modFiles.forEach(item => {
            if (basename(item).toLowerCase() == 'manifest.xml') mods = true
        })

        if (mods) return 1

        return 99
    }
}