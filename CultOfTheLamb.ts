/**
 * @description 咩咩启示录 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join, basename, extname } from "node:path"
import { UnityGame } from "@src/model/UnityGame";
import { FileHandler } from "@src/model/FileHandler";


export const supportedGames: ISupportedGames = {
    GlossGameId: 342,
    steamAppID: 1313140,
    Thunderstore: {
        community_identifier: 'cult-of-the-lamb'
    },
    installdir: join("Cult Of The Lamb"),
    gameName: "Cult Of The Lamb",
    gameExe: "Cult Of The Lamb.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1313140"
        },
        {
            name: "直接启动",
            exePath: join("Cult Of The Lamb.exe")
        }
    ],
    archivePath: join(FileHandler.GetAppData(), "LocalLow", "Massive Monster", "Cult Of The Lamb"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/65f2c99bb3e08.webp",
    modType: UnityGame.modType,
    checkModType: UnityGame.checkModType
}