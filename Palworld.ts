/**
 * @description 幻兽帕鲁 支持
 */
import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { join, extname, sep, basename, dirname } from 'path'
import { Manager } from "@src/model/Manager";
import { ElMessage } from "element-plus";
import { FileHandler } from "@src/model/FileHandler";

export const supportedGames: ISupportedGames = {
    GlossGameId: 333,
    steamAppID: 1623730,
    installdir: join("Palworld"),
    gameName: "Palworld",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1623730"
        },
        {
            name: "直接启动",
            exePath: "Palworld.exe"
        }
    ],
    gameExe: "Palworld.exe",
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/65ae3cdbc7680.webp",
    modType: [
        {
            id: 1,
            name: 'pak',
            installPath: join('Pal', 'Content', 'Paks', '~mods'),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "")
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "")
            }
        },
        {
            id: 2,
            name: "UE4SS",
            installPath: join("Pal", "Binaries", "Win64"),
            async install(mod) {
                for (let index in mod.modFiles) {
                    const item = mod.modFiles[index];
                    if (basename(item) == 'ue4ss.dll') {
                        return Manager.installByFileSibling(mod, this.installPath ?? "", "ue4ss.dll", true)
                    }
                    if (basename(item) == 'xinput1_3.dll') {
                        return Manager.installByFileSibling(mod, this.installPath ?? "", "xinput1_3.dll", true)
                    }
                }

                ElMessage.warning("未找到ue4ss.dll或xinput1_3.dll, 类型可能错误, 请重新导入! ")

                return false
            },
            async uninstall(mod) {
                for (let index in mod.modFiles) {
                    const item = mod.modFiles[index];
                    if (basename(item) == 'ue4ss.dll') {
                        return Manager.installByFileSibling(mod, this.installPath ?? "", "ue4ss.dll", false)
                    }
                    if (basename(item) == 'xinput1_3.dll') {
                        return Manager.installByFileSibling(mod, this.installPath ?? "", "xinput1_3.dll", false)
                    }
                }
                ElMessage.warning("未找到ue4ss.dll或xinput1_3.dll, 类型可能错误, 请重新导入! ")

                return false
            }
        },
        {
            id: 3,
            name: "mods",
            installPath: join("Pal", "Binaries", "Win64", "Mods"),
            async install(mod) {
                return Manager.installByFolderParent(mod, this.installPath ?? "", "Enabled.txt", true)
            },
            async uninstall(mod) {
                return Manager.installByFolderParent(mod, this.installPath ?? "", "Enabled.txt", false)
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
        let us4ss = false
        let mods = false
        mod.modFiles.forEach(item => {
            if (extname(item) == '.pak') pak = true
            if (FileHandler.compareFileName(item, 'Enabled.txt')) mods = true

            if (FileHandler.compareFileName(item, 'ue4ss.dll')) us4ss = true
            if (FileHandler.compareFileName(item, 'xinput1_3.dll')) us4ss = true
        })

        if (us4ss) return 2
        if (pak) return 1
        if (mods) return 3

        return 99
    }
}