import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { FileHandler } from "@src/model/FileHandler";
import { UnrealEngine } from "@src/model/UnrealEngine";

export const supportedGames: ISupportedGames = {
    GlossGameId: 157,
    steamAppID: 678950,
    gameName: "DRAGON BALL FighterZ",
    installdir: "DRAGON BALL FighterZ",
    gameExe: 'DBFighterZ.exe',
    startExe: [
        {
            name: 'Steam 启动',
            exePath: 'steam://rungameid/678950'
        },
        {
            name: '直接启动',
            exePath: 'DBFighterZ.exe'
        }
    ],
    archivePath: join(FileHandler.GetAppData(), "Local", "DBFighterZ", "Saved"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/157.jpg",
    modType: UnrealEngine.modType("RED", false),
    checkModType: UnrealEngine.checkModType
}