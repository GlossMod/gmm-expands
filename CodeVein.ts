import type { IModInfo, ISupportedGames } from "@src/model/Interfaces";
import { join, extname } from 'path'
import { Manager } from "@src/model/Manager";
import { ElMessage } from "element-plus";

export const supportedGames: ISupportedGames = {
    gameID: 207,
    steamAppID: 678960,
    gameName: "CODE VEIN",
    installdir: "CodeVein",
    gameExe: 'CodeVein.exe',
    startExe: 'CodeVein.exe',
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/207.png",
    modType: [
        {
            id: 1,
            name: 'pak',
            installPath: join('CodeVein', 'Content', 'Paks', '~mods'),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "")
                // return true
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "")
            }
        },
        {
            id: 2,
            name: '未知',
            installPath: '',
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
            if (extname(item) == '.pak') pak = true
        })

        if (pak) return 1

        return 2
    }
}