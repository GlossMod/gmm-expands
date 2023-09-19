// 星空 Mod支持
import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { extname, basename, join, dirname } from 'path'
import { FileHandler } from "@src/model/FileHandler"
import { useManager } from "@src/stores/useManager";
import { ElMessage } from "element-plus";
import { statSync, readFileSync, writeFileSync } from "fs";
import ini from 'ini'
import { Manager } from "@src/model/Manager";


//#region  data 类型的mod

// 设置 Starfield.ini
async function setArchive() {
    try {
        const manager = useManager()
        // let documents = await FileHandler.getMyDocuments()
        const Starfield = join(manager.gameStorage, "Starfield.ini")
        let config = ini.parse(readFileSync(Starfield, 'utf-8'))
        console.log(config);
        if (config.Archive?.bInvalidateOlderFiles == 1) {
            console.log('StarfieldPrefs.ini 已配置过, 无需再次配置.');
            return
        }
        if (config.Archive) {
            config.Archive.bInvalidateOlderFiles = 1
            config.Archive.sResourceDataDirsFinal = ""
            writeFileSync(Starfield, ini.stringify(config))
        }
    } catch (error) {
        ElMessage.error(`配置 StarfieldPrefs.ini 失败! ${error}`)
    }
}

// 软链 Data
async function symlinkData() {
    let documents = await FileHandler.getMyDocuments()

    const data = join(documents, "My Games", "Starfield", "Data")

    // 判断是否已经软链过了
    if (await FileHandler.isSymlink(data)) {
        console.log('Data 已软链过, 无需再次软链.');
        return
    }

    // FileHandler.deleteFolder(data)
    // 重命名旧的文件夹
    FileHandler.renameFile(data, join(dirname(data), 'old_data'))

    // 获取游戏目录中的Data
    const manager = useManager()
    const gameData = join(manager.gameStorage, "Data")

    // 软链
    FileHandler.createLink(gameData, data)

}

// 安装 卸载 data 类型的mod
async function handleDataMod(mod: IModInfo, installPath: string, isInstall: boolean) {
    if (isInstall) setArchive();
    if (isInstall) symlinkData();

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


//#region  esp 类型的mod

function setGeneral(name: string, isInstall: boolean) {
    const manager = useManager()
    // let documents = await FileHandler.getMyDocuments()
    const Starfield = join(manager.gameStorage, "Starfield.ini")
    let config = ini.parse(readFileSync(Starfield, 'utf-8'))
    // 获取 config.General 下面的所有 key
    let keys = Object.keys(config.General)
    console.log(keys);

    if (isInstall) {
        // 判断 key 中是否有包含 sTestFile 的
        let hasKey = keys.some(item => item.includes('sTestFile'))
        if (hasKey) {
            /**
             * sTestFile1
             * sTestFile2
             * sTestFile3
             */
            let lastKey = keys[keys.length - 1]
            let lastNum = parseInt(lastKey[lastKey.length - 1])
            config.General[`sTestFile${lastNum + 1}`] = name
        } else {
            config.General.sTestFile1 = name
        }
    } else {
        // 如果是卸载 将所有 sTestFileX=name 删除
        keys.forEach(item => {
            if (config.General[item] == name) {
                delete config.General[item]
            }
        })
    }

    writeFileSync(Starfield, ini.stringify(config))

}

function handleEsps(mod: IModInfo, installPath: string, isInstall: boolean) {
    const manager = useManager()
    mod.modFiles.forEach(item => {
        let file = join(manager.modStorage, mod.id.toString(), item)
        if (statSync(file).isFile()) {
            let name = basename(file)
            if (extname(file) == '.esp') setGeneral(name, isInstall)

            let target = join(manager.gameStorage ?? "", installPath, item)
            if (isInstall) {
                FileHandler.copyFile(file, target)
            } else {
                FileHandler.deleteFile(target)
            }
        }
    })

    return true
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
            id: 5,
            name: 'esp',
            installPath: join("Data"),
            async install(mod) {
                return handleEsps(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handleEsps(mod, this.installPath ?? "", false)
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
        let esp = false

        if (mod.webId == 201756) {
            return 3
        }

        mod.modFiles.forEach(item => {
            if (item.toLowerCase().includes('data')) data = true
            if (extname(item) == '.dll') plugins = true
            if (extname(item) == '.esp') esp = true
        })

        if (data) return 1
        if (plugins) return 4
        if (esp) return 5

        return 99
    }
}