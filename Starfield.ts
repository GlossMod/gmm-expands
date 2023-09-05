// 星空 Mod支持
import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { extname, basename, join, dirname } from 'path'
import { FileHandler } from "@src/model/FileHandler"
import { useManager } from "@src/stores/useManager";
import { ElMessage } from "element-plus";
import { statSync, readFileSync, writeFileSync, readdirSync } from "fs";
import ini from 'ini'
import { Manager } from "@src/model/Manager";


//#region  data 类型的mod

// 设置 StarfieldPrefs.ini
async function setArchive() {
    try {
        let documents = await FileHandler.getMyDocuments()
        const StarfieldPrefs = join(documents, "My Games", "Starfield", "StarfieldPrefs.ini")
        let config = ini.parse(readFileSync(StarfieldPrefs, 'utf-8'))
        console.log(config);
        if (config.Archive.bInvalidateOlderFiles != 1) {
            console.log(config.Archive.bInvalidateOlderFiles);
            config.Archive = {
                bInvalidateOlderFiles: 1,
                sResourceDataDirsFinal: ""
            }
            writeFileSync(StarfieldPrefs, ini.stringify(config))
        } else {
            console.log('StarfieldPrefs.ini 已配置过, 无需再次配置.');
        }
    } catch (error) {
        ElMessage.error(`配置 StarfieldPrefs.ini 失败! ${error}`)
    }

}

// 安装 卸载 data 类型的mod
async function handleDataMod(mod: IModInfo, installPath: string, isInstall: boolean) {
    if (isInstall) setArchive();

    return Manager.installByFolder(mod, installPath, "data", isInstall, false, true)

}
//#endregion

//#region  Plugins 类型的mod

// 安装到 Plugins
async function handlePlugins(mod: IModInfo, installPath: string, isInstall: boolean) {

    if (isInstall) Manager.checkInstalled("SFSE", 201756)

    const manager = useManager()
    let modStorage = join(manager.modStorage ?? "", mod.id.toString())

    let files: string[] = []
    mod.modFiles.forEach(item => {
        try {
            let file = join(modStorage, item)
            if (statSync(file).isFile()) {
                files.push(file)
            }
        } catch { }

    })
    let lastFolder = basename(FileHandler.getCommonParentFolder(files))

    return Manager.installByFolder(mod, installPath, lastFolder, isInstall)

}

//#endregion

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
            name: 'SFSE 启动',
            exePath: 'sfse_loader.exe'
        },
        {
            name: '直接启动',
            exePath: 'Starfield.exe'
        },
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/64db454e9f5c4.webp",
    modType: [
        {
            id: 1,
            name: 'data',
            installPath: join("Data"),
            async install(mod) {
                return handleDataMod(mod, this.installPath ?? "", true,)
            },
            async uninstall(mod) {
                return handleDataMod(mod, this.installPath ?? "", false,)
            },
        },
        {
            id: 2,
            name: '游戏根目录',
            installPath: join(""),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", true)
            },
        },
        {
            id: 3,
            name: '前置插件',
            installPath: join(""),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", true)
            },
        },
        {
            id: 4,
            name: 'Plugins',
            installPath: join("Data", "SFSE", "plugins"),
            async install(mod) {
                return handlePlugins(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handlePlugins(mod, this.installPath ?? "", false)
            }
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
        let plugins = false

        if (mod.webId == 201756) {
            return 3
        }

        mod.modFiles.forEach(item => {
            if (item.toLowerCase().includes('data')) data = true
            if (extname(item) == '.dll') plugins = true
        })

        if (data) return 1
        if (plugins) return 4

        return 99
    }
}