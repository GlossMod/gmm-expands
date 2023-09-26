import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { join, extname, sep, basename, dirname } from 'path'
import { Manager } from "@src/model/Manager";
import { ElMessage } from "element-plus";

export const supportedGames: ISupportedGames = {
    gameID: 266,
    steamAppID: 1462040,
    installdir: join("FINAL FANTASY VII REMAKE"),
    gameName: "FINAL FANTASY VII REMAKE",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1462040"
        },
        {
            name: "直接启动",
            exePath: "ff7remake.exe"
        }
    ],
    gameExe: "ff7remake.exe",
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/61c027ed1cbc1.png",
    modType: [
        {
            id: 1,
            name: 'pak',
            installPath: join('End', 'Content', 'Paks', '~mods'),
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