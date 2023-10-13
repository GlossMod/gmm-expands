// 边缘世界 MOD
import type { IModInfo, ISupportedGames } from "@src/model/Interfaces";
import { join, extname, sep, basename, dirname } from 'path'
import { FileHandler } from "@src/model/FileHandler";
import { useManager } from "@src/stores/useManager";
import { ElMessage } from "element-plus";

async function handleMod(mod: IModInfo, installPath: string, isInstall: boolean) {

    let manager = useManager()

    let modBaseFolder = ""
    mod.modFiles.forEach(item => {
        let path = join(manager.modStorage, mod.id.toString(), item)
        if (basename(path).toLowerCase() == "about.xml") {
            modBaseFolder = join(path, '..', '..')
        }
    })
    if (modBaseFolder != "") {
        console.log(modBaseFolder);

        let destPath = join(manager.gameStorage, installPath, basename(modBaseFolder))
        if (isInstall) {
            return FileHandler.createLink(modBaseFolder, destPath)
        } else {
            return FileHandler.removeLink(destPath)
        }
    } else {
        ElMessage.error("未找到 about.xml 文件, 无法安装!")
        return false
    }

}

export const supportedGames: ISupportedGames = {
    gameID: 19,
    steamAppID: 294100,
    installdir: join("RimWorld"),
    gameName: "RimWorld",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/294100"
        },
        {
            name: "直接启动",
            exePath: join("RimWorldWin64.exe")
        }
    ],
    gameExe: "RimWorldWin64.exe",
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/19.jpg",
    modType: [
        {
            id: 1,
            name: "通用类型",
            installPath: "Mods",
            async install(mod) {
                return handleMod(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return handleMod(mod, this.installPath ?? "", false)
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

        let modType = 99

        mod.modFiles.forEach(item => {
            let filename = basename(item)
            if (filename.toLowerCase() == "about.xml") modType = 1
        })

        return modType
    }
}