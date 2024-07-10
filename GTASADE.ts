/**
 * @description GTASADE 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from "node:path"
import { FileHandler } from "@src/model/FileHandler";
import { UnrealEngine } from "@src/model/UnrealEngine";

export const supportedGames: ISupportedGames = {
    GlossGameId: 258,
    steamAppID: 1547000,
    NexusMods: {
        game_domain_name: 'grandtheftautothetrilogy',
        game_id: 4142
    },
    installdir: join("GTA San Andreas - Definitive Edition", "Gameface", "Binaries", "Win64"),
    gameName: "GTA San Andreas Definitive Edition",
    gameExe: [
        {
            name: "SanAndreas.exe",
            rootPath: join('..', '..', '..')
        }
    ],
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1547000"
        },
        {
            name: "直接启动",
            exePath: join("Gameface", "Binaries", "Win64", "SanAndreas.exe")
        }
    ],
    archivePath: join(FileHandler.getMyDocuments(), "Rockstar Games", "GTA San Andreas Definitive Edition"),
    gameCoverImg: "imgs/gtasade_logo.jpg",
    modType: UnrealEngine.modType("Gameface", false),
    checkModType: UnrealEngine.checkModType
}