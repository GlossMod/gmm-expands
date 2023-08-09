import { FileHandler } from "@src/model/FileHandler";
import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { useManager } from "@src/stores/useManager";
import { join, basename, extname } from 'path'
import { homedir } from "os";

function handleMod(mod: IModInfo, isInstall: boolean) {

    let manager = useManager()
    let srcPath = join(manager.modStorage, mod.id.toString())
    let destPath = join(homedir(), "My Documents", "Electronic Arts", "The Sims 4", "Mods", "Gloss Mod Manager", mod.id.toString())
    if (isInstall) {
        return FileHandler.createLink(srcPath, destPath)

    } else {
        return FileHandler.removeLink(destPath)
    }
}


export const supportedGames: ISupportedGames = {
    gameID: 8,
    steamAppID: 1222670,
    installdir: join("The Sims 4", "Game", "Bin"),
    gameName: "The Sims 4",
    gameExe: [
        {
            name: 'TS4_x64.exe',
            rootPath: join('..', '..')
        }
    ],
    startExe: 'TS4_x64.exe',
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/8a.jpg",
    modType: [
        {
            id: 1,
            name: "通用类型",
            installPath: join("The Sims 4", "Mods"),
            install: async (mod: IModInfo) => {
                return handleMod(mod, true)
            },
            uninstall: async (mod: IModInfo) => {
                return handleMod(mod, false)
            }
        }
    ],
    checkModType(mod) {


        return 1
    }
}