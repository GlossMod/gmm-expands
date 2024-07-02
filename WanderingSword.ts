/**
 * @description 逸剑风云决 支持
 */

import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { join, extname, sep, basename, dirname } from 'path'
import { Manager } from "@src/model/Manager";
import { ElMessage } from "element-plus";
import { FileHandler } from "@src/model/FileHandler";

export const supportedGames: ISupportedGames = {
    GlossGameId: 328,
    steamAppID: 1876890,
    installdir: join("Wandering Sword"),
    gameName: "Wandering Sword",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1876890"
        },
        {
            name: "直接启动",
            exePath: "JH.exe"
        }
    ],
    gameExe: "JH.exe",
    archivePath: join(FileHandler.GetAppData(), "Local", "Wandering_Sword", "Saved"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/656d920e5f559.webp",
    modType: [
        {
            id: 1,
            name: 'pak',
            installPath: join('Wandering_Sword', 'Content', 'Paks', '~mods'),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "")
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "")
            }
        },
        {
            id: 99,
            name: '未知',
            installPath: '\\',
            async install(mod) {
                ElMessage.warning("该mod类型未知, 无法自动安装, 请手动安装!")
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
            let ext = extname(item)
            if (ext == '.pak') pak = true
        })

        if (pak) return 1

        return 99
    }
}