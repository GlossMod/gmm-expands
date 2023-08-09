import { FileHandler } from "@src/model/FileHandler";
import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { useManager } from "@src/stores/useManager";
import { join, extname } from 'path'
import { statSync } from "fs";
import { Manager } from "@src/model/Manager";
import { ElMessage } from "element-plus";

function handlePlugins(mod: IModInfo, installPath: string, isInstall: boolean) {
    if (isInstall) if (!Manager.checkInstalled("REFramework", 197869)) return false
    let res: IState[] = []
    const manager = useManager()
    mod.modFiles.forEach(async item => {
        let modStorage = join(manager.modStorage ?? "", mod.id.toString(), item)
        if (statSync(modStorage).isFile()) {
            let path = modStorage.split(/autorun/i)[1]
            if (path) {
                let gameStorage = join(manager.gameStorage ?? "", installPath, path ?? "")
                if (isInstall) {
                    let state = await FileHandler.copyFile(modStorage, gameStorage)
                    res.push({ file: item, state: state })
                } else {
                    let state = FileHandler.deleteFile(gameStorage)
                    res.push({ file: item, state: state })
                }
            }
        }
    })
    return res
}


export const supportedGames: ISupportedGames = {
    gameID: 303,
    steamAppID: 2050650,
    installdir: "RESIDENT EVIL 4  BIOHAZARD RE4",
    gameName: "RE4Remake",
    gameExe: 're4.exe',
    startExe: 're4.exe',
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/63e310bf62591.webp",
    modType: [
        {
            id: 1,
            name: "插件",
            installPath: join('reframework', 'autorun'),
            async install(mod) {
                return handlePlugins(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handlePlugins(mod, this.installPath ?? "", false)
            }
        },
        {
            id: 2,
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
            id: 3,
            name: "模型替换",
            installPath: join('natives'),
            async install(mod) {
                ElMessage.warning("暂时还未支持该类型的安装")
                return false
            },
            async uninstall(mod) {
                return false
            }
        },
        {
            id: 4,
            name: "混合",
            installPath: join('natives'),
            async install(mod) {
                ElMessage.warning("暂时还未支持该类型的安装")
                return false
            },
            async uninstall(mod) {
                return true
            }
        },
        {
            id: 5,
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
        if (mod.webId == 197869) return 2

        mod.modFiles.forEach(item => {
            if (item.toLowerCase().includes('natives')) natives = true
            if (extname(item) == '.lua') plugins = true
        })

        if (natives && plugins) return 4

        if (natives) return 3
        if (plugins) return 1

        return 5
    }
}