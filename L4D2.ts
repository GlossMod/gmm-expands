import type { IState, ISupportedGames } from "@src/model/Interfaces";
import { extname, basename, join } from 'path'
import { FileHandler } from "@src/model/FileHandler"
import { useManager } from "@src/stores/useManager";

// console.log(settings.settings.managerGame);


export const supportedGames: ISupportedGames = {
    gameID: 12,
    steamAppID: 550,
    installdir: "Left 4 Dead 2",
    gameName: "Left 4 Dead 2",
    gameExe: 'left4dead2.exe',
    startExe: 'steam://rungameid/550',
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/12.jpg",
    modType: [
        {
            id: 1,
            name: '通用类型',
            // installPath: '\\left4dead2\\addons',
            installPath: join('left4dead2', 'addons'),
            async install(mod) {
                const manager = useManager()
                let modStorage = join(manager.modStorage, mod.id.toString())
                let gameStorage = join(manager.gameStorage ?? "", this.installPath ?? "")

                let res: IState[] = []

                mod.modFiles.forEach(async file => {
                    let fileExt = extname(file)
                    if (fileExt === '.vpk') {
                        let source = `${modStorage}\\${file}`
                        let target = `${gameStorage}\\${basename(file)}`
                        let state = await FileHandler.copyFile(source, target)
                        res.push({ file: file, state: state })
                    }
                })
                return res
            },
            async uninstall(mod) {
                const manager = useManager()

                let res: IState[] = []
                let gameStorage = join(manager.gameStorage ?? "", this.installPath ?? "")
                mod.modFiles.forEach(async file => {
                    let fileExt = extname(file)
                    if (fileExt === '.vpk') {
                        // let source = `${modStorage}\\${file}`
                        let target = `${gameStorage}\\${basename(file)}`
                        let state = FileHandler.deleteFile(target)
                        res.push({ file: file, state: state })
                    }
                })
                return res
            },
        },
    ],
    checkModType(mod) {
        return 1
    }
}