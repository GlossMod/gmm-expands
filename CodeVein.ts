import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { FileHandler } from "@src/model/FileHandler";
import { UnrealEngine } from "@src/model/UnrealEngine";

export const supportedGames: ISupportedGames = {
    GlossGameId: 207,
    steamAppID: 678960,
    NexusMods: {
        game_id: 2981,
        game_domain_name: "codevein",
    },
    gameName: "CODE VEIN",
    installdir: "CodeVein",
    gameExe: 'CodeVein.exe',
    startExe: [
        {
            name: 'Steam 启动',
            exePath: 'steam://rungameid/678960'
        },
        {
            name: '直接启动',
            exePath: 'CodeVein.exe'
        }
    ],
    archivePath: join(FileHandler.GetAppData(), "Local", "CodeVein", "Saved"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/207.png",
    modType: UnrealEngine.modType("CodeVein", false),
    checkModType: UnrealEngine.checkModType
}