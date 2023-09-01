// 星空 Mod支持
import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { extname, basename, join } from 'path'
import { FileHandler } from "@src/model/FileHandler"
import { useManager } from "@src/stores/useManager";
import { ElMessage } from "element-plus";
import { homedir, } from "os";
import { Manager } from "@src/model/Manager";
import { statSync } from "fs";

// 安装 卸载 data 类型的mod
async function handleDataMod(mod: IModInfo, installPath: string, isInstall: boolean) {
    const manager = useManager()
    let res: IState[] = []
    mod.modFiles.forEach(async item => {
        let modStorage = join(manager.modStorage ?? "", mod.id.toString(), item)

        if (statSync(modStorage).isFile()) {
            let path = FileHandler.getFolderFromPath(modStorage, 'data')
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

// 安装到游戏根目录
async function handleRootMod(mod: IModInfo, installPath: string, isInstall: boolean) {
    const manager = useManager()
    let res: IState[] = []
    mod.modFiles.forEach(async item => {
        let modStorage = join(manager.modStorage ?? "", mod.id.toString(), item)
        let gameStorage = join(manager.gameStorage ?? "", installPath, item)
        if (isInstall) {
            let state = await FileHandler.copyFile(modStorage, gameStorage)
            res.push({ file: item, state: state })
        } else {
            let state = FileHandler.deleteFile(gameStorage)
            res.push({ file: item, state: state })
        }
    })
    return res
}

export const supportedGames: ISupportedGames = {
    gameID: 321,
    steamAppID: 1716740,
    installdir: join("Starfield"),
    gameName: "Starfield",
    gameExe: "Starfield.exe",
    startExe: [
        {
            name: 'Steam 启动',
            exePath: 'steam://rungameid/1716740'
        },
        {
            name: '直接启动',
            exePath: join('Starfield.exe')
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/64db454e9f5c4.webp",
    modType: [
        {
            id: 1,
            name: 'data',
            installPath: join("Data"),
            async install(mod) {
                return handleDataMod(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handleDataMod(mod, this.installPath ?? "", false)
            },
        },
        {
            id: 2,
            name: '游戏根目录',
            installPath: join(""),
            async install(mod) {
                return handleRootMod(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handleRootMod(mod, this.installPath ?? "", false)
            },
        },
        {
            id: 99,
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

        let data = false

        mod.modFiles.forEach(item => {
            if (item.toLowerCase().includes('data')) data = true
        })

        if (data) return 1

        return 99
    }
}