// 博德之门3 Mod支持
import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { extname, basename, join } from 'path'
import { FileHandler } from "@src/model/FileHandler"
import { useManager } from "@src/stores/useManager";
import { ElMessage } from "element-plus";
import { homedir, } from "os";
import { Manager } from "@src/model/Manager";
import { statSync } from "fs";

const xml2js = require('xml2js')

interface IAttribute {
    $: {
        id: string
        type: string
        value: string
    }
}

let modsettings = {
    get data() {
        let file = join(homedir(), 'AppData', 'Local', 'Larian Studios', "Baldur's Gate 3", 'PlayerProfiles', 'Public', 'modsettings.lsx')
        let data = FileHandler.readFile(file)
        return xml2js.parseStringPromise(data)
    },
    set data(value) {
        let file = join(homedir(), 'AppData', 'Local', 'Larian Studios', "Baldur's Gate 3", 'PlayerProfiles', 'Public', 'modsettings.lsx')
        let data = new xml2js.Builder().buildObject(value)
        // console.log(data);

        if (data) FileHandler.writeFile(file, data)
    }
}



async function handleMod(mod: IModInfo, installPath: string, isInstall: boolean) {
    const manager = useManager()
    let res: IState[] = []
    mod.modFiles.forEach(async item => {
        try {
            let modStorage = join(manager.modStorage ?? "", mod.id.toString(), item)

            if (statSync(modStorage).isFile()) {
                // 获取 nativePC 后的路径, 包含 nativePC
                let path = modStorage.split(/public/i)[1]
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

        } catch (error) {
            res.push({ file: item, state: false })
        }
    })

    return res
}

async function LoadModDataFromPak(pakPath: string) {
    const edge = require('electron-edge-js')

    const manager = useManager()



    let Invoke = edge.func({
        assemblyFile: join(manager.modStorage ?? "", manager.getModInfoByWebId(200783)?.id.toString() ?? "", 'BaldursGate3.dll'),
        typeName: 'BaldursGate3.Program',
        methodName: 'LoadModDataFromPakAsync'
    })

    return new Promise<IAttribute[]>((resolve, reject) => {
        try {
            Invoke(pakPath, async (error: any, result: any) => {
                if (error) reject(error);
                let attribute
                if (result) {
                    let data = await xml2js.parseStringPromise(result)
                    attribute = data.save.region[0].node[0].children[0].node[1].attribute
                }

                resolve(attribute);
            })
        } catch (error) {
            reject(error)
        }

    })
}




async function handlePak(mod: IModInfo, installPath: string, isInstall: boolean) {

    if (!Manager.checkInstalled("博德之门3 前置插件 For GMM", 200783)) return false

    if (isInstall) if (!Manager.checkInstalled("Patch 3 Mod Fixer", 200740)) return false
    let res: IState[] = []
    let manager = useManager()

    let modsettings_data = await modsettings.data
    let root = modsettings_data.save.region[0].node[0].children[0].node
    // console.log(root);
    if (!root[0].children[0].node) {
        // 如果用户是第一次装Mod
        // console.log('第一次装Mod');
        root[0].children[0] = {
            node: []
        }
    }

    for (let index = 0; index < mod.modFiles.length; index++) {
        const item = mod.modFiles[index];
        let modStorage = join(manager.modStorage ?? "", mod.id.toString(), item)
        if (statSync(modStorage).isFile()) {
            if (extname(item) == '.pak') {

                if (isInstall) FileHandler.copyFile(modStorage, join(installPath, basename(item)))
                else FileHandler.deleteFile(join(installPath, basename(item)))

                let meta = await LoadModDataFromPak(modStorage)
                if (meta) {
                    let ModuleShortDesc = meta.filter(item => (item.$.id == 'Folder' || item.$.id == 'MD5' || item.$.id == 'Name' || item.$.id == 'UUID' || item.$.id == 'Version64'))
                    if (isInstall) {
                        // 安装
                        // ModOrder 中添加 UUID
                        root[0].children[0].node.push({
                            $: {
                                id: "Module"
                            },
                            attribute: [
                                {
                                    $: {
                                        id: "UUID",
                                        type: "FixedString",
                                        value: ModuleShortDesc.find(item => item.$.id == 'UUID')?.$.value,
                                    }
                                }
                            ]
                        })
                        // Mods 中添加 数据
                        root[1].children[0].node.push({
                            $: {
                                id: 'ModuleShortDesc'
                            },
                            attribute: [...ModuleShortDesc]
                        })
                    } else {
                        // 卸载
                        // ModOrder 中删除 UUID
                        root[0].children[0].node = root[0].children[0].node.filter((item: any) => item.attribute[0].$.value != ModuleShortDesc.find(item => item.$.id == 'UUID')?.$.value)
                        // Mods 中删除 数据
                        root[1].children[0].node = root[1].children[0].node.filter((item: any) => {
                            let uuid = item.attribute.find((item: any) => item.$.id == 'UUID')
                            if (uuid) return uuid.$.value != ModuleShortDesc.find(item => item.$.id == 'UUID')?.$.value
                            else return true
                        })
                    }
                    modsettings.data = modsettings_data
                }
            }
        }
    }
    return true
}

export const supportedGames: ISupportedGames = {
    gameID: 240,
    steamAppID: 1086940,
    installdir: join("Baldurs Gate 3", "bin"),
    gameName: "Baldurs Gate 3",
    gameExe: [
        {
            name: 'bg3.exe',
            rootPath: join('..')
        },
        {
            name: 'bg3_dx11.exe',
            rootPath: join('..')
        }
    ],
    startExe: join('bin', 'bg3_dx11.exe'),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/5f9fc80ea912c.png",
    modType: [
        {
            id: 1,
            name: 'pak',
            installPath: join(homedir(), 'AppData', 'Local', 'Larian Studios', "Baldur's Gate 3", 'Mods'),
            async install(mod) {
                return handlePak(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handlePak(mod, this.installPath ?? "", false)
            },
        },
        {
            id: 2,
            name: 'Data',
            installPath: join('Data', 'Public'),
            async install(mod) {
                return handleMod(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handleMod(mod, this.installPath ?? "", false)
            }
        },
        {
            id: 3,
            name: '插件',
            installPath: '',
            async install(mod) {
                return true
            },
            async uninstall(mod) {
                return true
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

        if (mod.webId == 200783) return 3

        let pak = false
        let data = false

        mod.modFiles.forEach(item => {
            let exe = extname(item)
            if (exe === '.pak') pak = true
            if (item.toLowerCase().includes('public')) data = true
        })

        if (pak) return 1
        if (data) return 2

        return 99
    }
}