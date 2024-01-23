/**
 * @description 师父 支持
 */

import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { basename, join, extname } from "node:path"
import { FileHandler } from "@src/model/FileHandler"
import { statSync } from "fs";
import { useManager } from "@src/stores/useManager";
import { ElMessage } from "element-plus";
import { Manager } from "@src/model/Manager";

function handlePack(mod: IModInfo, installPath: string, install: boolean) {
    const manager = useManager()
    const modStorage = join(manager.modStorage ?? "", mod.id.toString())
    mod.modFiles.forEach(item => {
        if (extname(item) === ".pack") {
            let source = join(modStorage, item)
            let target = join(manager.gameStorage, installPath ?? "", basename(item))
            if (install) FileHandler.copyFile(source, target)
            else FileHandler.deleteFile(target)
        }
    })
    return true
}

export const supportedGames: ISupportedGames = {
    GlossGameId: 64,
    steamAppID: 2138710,
    NexusMods: {
        game_domain_name: "sifu",
        game_id: 4309
    },
    installdir: join("Sifu"),
    gameName: "SiFu",
    gameExe: "Sifu.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/2138710"
        },
        {
            name: "直接启动",
            exePath: join("Sifu.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/62207195e18a2.png",
    modType: [
        {
            id: 1,
            name: "pak",
            installPath: join("Sifu", "Content", "Paks", "~mods"),
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
        let pak = false

        mod.modFiles.forEach(item => {
            if (extname(item) === ".pak") pak = true
        })

        if (pak) return 1

        return 99
    }
}