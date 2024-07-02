/**
 * @description 活侠传 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from "node:path"
import { UnityGame } from "@src/model/UnityGame";
import { FileHandler } from "@src/model/FileHandler";


export const supportedGames: ISupportedGames = {
    GlossGameId: 357,
    steamAppID: 1859910,
    installdir: join("LegendOfMortal"),
    gameName: "Legend Of Mortal",
    gameExe: "Mortal.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1859910"
        },
        {
            name: "直接启动",
            exePath: join("Mortal.exe")
        }
    ],
    archivePath: join(FileHandler.GetAppData(), "LocalLow", "Obb Studio", "Mortal"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/667126e01ba80.webp",
    modType: UnityGame.modType,
    checkModType: UnityGame.checkModType
}