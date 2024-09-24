/**
 * @description 生化危机3 重制版 支持
 */
import type { ISupportedGames } from "@src/model/Interfaces";
import { join, basename } from 'path'
import { Manager } from "@src/model/Manager";
import { ElMessage } from "element-plus";
import { Steam } from "@src/model/Steam";


export const supportedGames: ISupportedGames = {
    GlossGameId: 224,
    steamAppID: 952060,
    NexusMods: {
        game_domain_name: "residentevil32020",
        game_id: 3191
    },
    installdir: "RE3",
    gameName: "Resident Evil 3",
    gameExe: 're3.exe',
    startExe: [
        {
            name: 'Steam 启动',
            exePath: 'steam://rungameid/952060'
        },
        {
            name: '直接启动',
            exePath: 're3.exe'
        }
    ],
    archivePath: join(Steam.getSteamInstallPath() || "", "userdata", Steam.GetLastSteamId32(), "952060", "remote"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/224.png",
    modType: [
        {
            id: 1,
            name: "REFramework",
            installPath: join(''),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", true)
            }
        },
        {
            id: 2,
            name: "autorun",
            installPath: join('reframework', 'autorun'),
            async install(mod) {
                if (!Manager.checkInstalled("REFramework", 204228)) return false
                return Manager.installByFolder(mod, this.installPath ?? "", 'autorun', true)
            },
            async uninstall(mod) {
                return Manager.installByFolder(mod, this.installPath ?? "", 'autorun', false)
            }
        },
        {
            id: 4,
            name: 'plugins',
            installPath: join('reframework', 'plugins'),
            async install(mod) {
                if (!Manager.checkInstalled("REFramework", 204228)) return false
                return Manager.installByFolder(mod, this.installPath ?? "", 'plugins', true)
            },
            async uninstall(mod) {
                return Manager.installByFolder(mod, this.installPath ?? "", 'plugins', false)
            }
        },
        {
            id: 3,
            name: "模型替换",
            installPath: join('natives'),
            async install(mod) {
                if (!Manager.checkInstalled("REFramework", 204228)) return false
                if (!Manager.checkInstalled("FirstNatives", 202971)) return false

                return Manager.installByFolder(mod, this.installPath ?? "", 'natives', true)
            },
            async uninstall(mod) {
                return Manager.installByFolder(mod, this.installPath ?? "", 'natives', false)
            }
        },
        {
            id: 5,
            name: '主目录',
            installPath: join(''),
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
            installPath: join(''),
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
        let natives = false
        let plugins = false
        let autorun = false
        let REFramework = false
        mod.modFiles.forEach(item => {
            if (basename(item) == 'dinput8.dll') REFramework = true
            if (item.toLowerCase().includes('natives')) natives = true
            if (item.toLowerCase().includes('autorun')) autorun = true
            if (item.toLowerCase().includes('plugins')) plugins = true
        })

        if (REFramework) return 1
        if (autorun) return 2
        if (plugins) return 4
        if (natives) return 3

        return 99
    }
}