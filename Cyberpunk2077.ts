import { FileHandler } from "@src/model/FileHandler";
import type { IModInfo, ISupportedGames } from "@src/model/Interfaces";
import { useManager } from "@src/stores/useManager";
import { join, extname, sep, basename, dirname } from 'path'
import { statSync } from "fs";
import { Manager } from "@src/model/Manager";
import { ElMessage } from "element-plus";

function getCommonParentFolder(paths: string[]): string {

    /// AI 给的写法 虽然看不懂 但感觉很酷
    const dirs = paths.map((p) => p.split(sep));
    if (dirs.some((d) => d.length === 0)) return "";
    for (let i = 0; i < dirs[0].length; i++) {
        const current = dirs[0][i];
        if (dirs.some((d) => d[i] !== current)) {
            return dirs[0].slice(0, i).join(sep);
        }
    }
    return dirs[0].join(sep);
}

function handlePlugins(mod: IModInfo, installPath: string, isInstall: boolean) {

    if (isInstall) {
        if (!Manager.checkInstalled("Cyber Engine Tweaks (CET)", 197625)) return false
    }


    const manager = useManager()
    let modStorage = join(manager.modStorage, mod.id.toString())
    let gameStorage = join(manager.gameStorage ?? "", installPath ?? "")
    let files: string[] = []
    mod.modFiles.forEach(item => {
        try {
            let file = join(modStorage, item)
            if (statSync(file).isFile()) {
                files.push(file)
            }
        } catch { }

    })

    let folder = getCommonParentFolder(files);
    let lastFolder = basename(folder)

    // 如果只有一个文件
    if (files.length == 1) {
        folder = dirname(files[0])
        lastFolder = basename(folder)
    }
    if (isInstall) {
        return FileHandler.copyFolder(folder, join(gameStorage, lastFolder))
    } else {
        return FileHandler.deleteFolder(join(gameStorage, lastFolder))
    }
}

function handleMixed(mod: IModInfo, isInstall: boolean) {

    const manager = useManager()
    let modStorage = join(manager.modStorage, mod.id.toString())
    let gameStorage = manager.gameStorage ?? ""

    let plugins: string[] = []

    mod.modFiles.forEach(item => {
        try {
            let file = join(modStorage, item)
            if (statSync(file).isFile()) {
                let exe = extname(item)
                if (exe == ".archive") {
                    if (isInstall) {
                        FileHandler.copyFile(file, join(gameStorage, 'archive', 'pc', 'mod', basename(item)))
                    } else {
                        FileHandler.deleteFile(join(gameStorage, 'archive', 'pc', 'mod', basename(item)))
                    }
                } else {
                    plugins.push(file)
                }
            }
        } catch { }
    })

    let folder = getCommonParentFolder(plugins)
    let lastFolder = basename(folder)

    // 如果只有一个文件
    if (plugins.length == 1) {
        folder = dirname(plugins[0])
        lastFolder = basename(folder)
    }
    if (isInstall) {
        return FileHandler.copyFolder(folder, join(gameStorage, 'bin', 'x64', 'plugins', 'cyber_engine_tweaks', 'mods', lastFolder))
    } else {
        return FileHandler.deleteFolder(join(gameStorage, 'bin', 'x64', 'plugins', 'cyber_engine_tweaks', 'mods', lastFolder))
    }
}

export const supportedGames: ISupportedGames = {
    gameID: 195,
    steamAppID: 1091500,
    installdir: join("Cyberpunk 2077", 'bin', 'x64', 'Cyberpunk2077.exe'),
    gameName: "Cyberpunk 2077",
    startExe: join('bin', 'x64', 'Cyberpunk2077.exe'),
    gameExe: [
        {
            name: 'Cyberpunk2077.exe',
            rootPath: join('..', '..'),
        },
        {
            name: 'REDprelauncher.exe',
            rootPath: '',
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/195.png",
    modType: [
        {
            id: 1,
            name: 'CET',
            installPath: '\\',
            async install(mod) {
                const manager = useManager()
                let modStorage = join(manager.modStorage, mod.id.toString())
                let gameStorage = join(manager.gameStorage ?? "", this.installPath ?? "")
                mod.modFiles.forEach(item => {
                    try {
                        let file = join(modStorage, item)
                        let target = join(gameStorage, item)
                        if (statSync(file).isFile()) {
                            FileHandler.copyFile(file, target)
                        }
                    } catch { }
                })
                return true
            },
            async uninstall(mod) {
                const manager = useManager()
                let gameStorage = join(manager.gameStorage ?? "", this.installPath ?? "")

                mod.modFiles.forEach(item => {
                    try {
                        let target = join(gameStorage, item)
                        // 判断是否是文件
                        if (statSync(target).isFile()) {
                            FileHandler.deleteFile(target)
                        }
                    } catch { }
                })

                return true
            }
        },
        {
            id: 2,
            name: 'archive',
            installPath: join('archive', 'pc', 'mod'),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "")
                // return true
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "")
            }
        },
        {
            id: 3,
            name: '脚本',
            installPath: join('bin', 'x64', 'plugins', 'cyber_engine_tweaks', 'mods'),
            async install(mod) {
                return handlePlugins(mod, this.installPath ?? '', true)
            },
            async uninstall(mod) {
                return handlePlugins(mod, this.installPath ?? '', false)
            }
        },
        {
            id: 4,
            name: '混合',
            installPath: '\\',
            async install(mod) {

                handleMixed(mod, true)


                return true
            },
            async uninstall(mod) {
                handleMixed(mod, false)
                return true
            }
        },
        {
            id: 5,
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
        // 判断是否是CET
        if (mod.webId == 197625) return 1


        let archive = false
        let lua = false
        mod.modFiles.forEach(item => {
            // 是否有archive文件
            let exe = extname(item)
            if (exe == ".archive") archive = true
            if (exe == ".lua") lua = true
        })

        if (archive && lua) return 4
        if (archive) return 2
        if (lua) return 3
        return 5
    }
}