import { FileHandler } from "@src/model/FileHandler";
import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { useManager } from "@src/stores/useManager";
import { join, basename, extname, parse } from 'path'
import { statSync } from "fs";
import { Manager } from "@src/model/Manager";
import { ElMessage } from "element-plus";

function handlePlugins(mod: IModInfo, installPath: string, split: string, isInstall: boolean) {
    if (isInstall) if (!Manager.checkInstalled("REFramework", 199521)) return false
    let res: IState[] = []
    const manager = useManager()
    mod.modFiles.forEach(async item => {
        let modStorage = join(manager.modStorage ?? "", mod.id.toString(), item)
        if (statSync(modStorage).isFile()) {
            let path = modStorage.split(split)[1]
            let gameStorage = join(manager.gameStorage ?? "", installPath, path ?? item)

            if (isInstall) {
                let state = await FileHandler.copyFile(modStorage, gameStorage)
                res.push({ file: item, state: state })
            } else {
                let state = FileHandler.deleteFile(gameStorage)
                res.push({ file: item, state: state })
            }
        }
    })
    return res
}

function handleMod(mod: IModInfo, installPath: string, isInstall: boolean) {
    if (isInstall) {
        if (!Manager.checkInstalled("First Natives", 199507)) return false
    }

    const manager = useManager()
    let res: IState[] = []
    mod.modFiles.forEach(async item => {
        try {
            let modStorage = join(manager.modStorage ?? "", mod.id.toString(), item)

            if (statSync(modStorage).isFile()) {
                // 获取 natives 后的路径, 包含 natives
                // let path = modStorage.split(/natives/i)[1]
                let path = FileHandler.getFolderFromPath(modStorage, "natives")
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
        } catch {
            res.push({ file: item, state: false })
        }
    })

    return res
}

export const supportedGames: ISupportedGames = {

    gameID: 270,
    steamAppID: 1446780,
    installdir: "MonsterHunterRise",
    gameName: "MonsterHunterRise",
    gameExe: "MonsterHunterRise.exe",
    startExe: [
        {
            name: '直接启动',
            exePath: 'MonsterHunterRise.exe'
        },
        {
            name: 'Steam 启动',
            exePath: 'steam://rungameid/1446780'
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/61dbdb30cdbce.png",
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
            name: "Lua插件",
            installPath: join('reframework', 'autorun'),
            async install(mod) {
                return handlePlugins(mod, this.installPath ?? "", "autorun", true)
            },
            async uninstall(mod) {
                return handlePlugins(mod, this.installPath ?? "", "autorun", false)
            }
        },
        {
            id: 3,
            name: "Dll插件",
            installPath: join('reframework', 'plugins'),
            async install(mod) {
                return handlePlugins(mod, this.installPath ?? "", "plugins", true)
            },
            async uninstall(mod) {
                return handlePlugins(mod, this.installPath ?? "", "plugins", false)
            }
        },
        {
            id: 4,
            name: "natives",
            installPath: join('natives'),
            async install(mod) {
                return handleMod(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handleMod(mod, this.installPath ?? "", false)
            }
        },
        {
            id: 5,
            name: "pak",
            installPath: join(''),
            async install(mod) {
                ElMessage.warning("pak 类型暂时无法自动安装, 需要您手动去修改文件名, 重命名为最新的顺位 patch_00x ")
                return false
            },
            async uninstall(mod) {
                return true
            }
        },
        {
            id: 6,
            name: "组合插件",
            installPath: join('reframework'),
            async install(mod) {
                return handlePlugins(mod, this.installPath ?? "", "reframework", true)
            },
            async uninstall(mod) {
                return handlePlugins(mod, this.installPath ?? "", "reframework", false)
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
        let luaPlugins = false
        let dllPlugins = false
        let pak = false
        let reframework = false

        if (mod.webId == 199521) return 1

        mod.modFiles.forEach(item => {
            if (item.toLowerCase().includes('natives')) natives = true
            if (item.toLowerCase().includes('reframework')) reframework = true
            if (extname(item) == '.lua') luaPlugins = true
            if (extname(item) == '.dll') dllPlugins = true
            if (extname(item) == '.pak') pak = true
        })

        // if (natives && plugins) return 4

        if (reframework) return 6
        if (luaPlugins) return 2
        if (dllPlugins) return 3
        if (natives) return 4
        if (pak) return 5

        return 99
    }
}