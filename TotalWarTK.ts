/**
 * @description 全面战争 三国 支持
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
    gameID: 193,
    steamAppID: 779340,
    installdir: join("Total War THREE KINGDOMS"),
    gameName: "Total War THREE KINGDOMS",
    gameExe: "Three_Kingdoms.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/779340"
        },
        {
            name: "直接启动",
            exePath: join("Three_Kingdoms.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/193.png",
    modType: [
        {
            id: 1,
            name: "pack",
            installPath: "data",
            async install(mod) {

                return handlePack(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {

                return handlePack(mod, this.installPath ?? "", false)
            }
        },
        {
            id: 2,
            name: "UI",
            installPath: join('data', 'UI'),
            async install(mod) {

                return Manager.installByFolder(mod, this.installPath ?? "", "ui", true, false, true)
            },
            async uninstall(mod) {

                return Manager.installByFolder(mod, this.installPath ?? "", "ui", false, false, true)
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
        let pack = false
        let ui = false

        mod.modFiles.forEach(item => {
            if (extname(item) === ".pack") pack = true
            if (item.toLowerCase().includes('ui')) ui = true
        })

        if (pack) return 1
        if (ui) return 2

        return 99
    }
}