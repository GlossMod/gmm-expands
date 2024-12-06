/**
 * @description 十字军之王3 支持
 */

import { basename, join, extname } from "node:path"
import { ElMessage } from "element-plus";

export const supportedGames: ISupportedGames = {
    GlossGameId: 236,
    steamAppID: 1158310,
    installdir: join("Crusader Kings III", 'binaries'),
    gameName: "Crusader Kings 3",
    gameExe: "ck3.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1158310"
        },
        {
            name: "直接启动",
            exePath: join("ck3.exe")
        }
    ],
    archivePath: join(FileHandler.getMyDocuments(), "Paradox Interactive", "Crusader Kings III"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/236.png",
    modType: [
        {
            id: 1,
            name: "Mods",
            installPath: join(FileHandler.getMyDocuments(), "Paradox Interactive", "Crusader Kings III", "mod"),
            async install(mod) {
                return Manager.installByFileSibling(mod, this.installPath ?? "", '.mod', true, true, false, ["descriptor.mod"])
            },
            async uninstall(mod) {
                return Manager.installByFileSibling(mod, this.installPath ?? "", '.mod', false, true, false, ["descriptor.mod"])
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
            if (extname(item) == '.mod') mods = true
        })

        if (mods) return 1

        return 99
    }
}