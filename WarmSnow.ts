/**
 * @description 暖雪 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from "node:path"
import { UnityGame } from "@src/model/UnityGame";
import { FileHandler } from "@src/model/FileHandler";


export const supportedGames: ISupportedGames = {
    GlossGameId: 274,
    steamAppID: 1296830,
    installdir: join("WarmSnow"),
    gameName: "WarmSnow",
    gameExe: "WarmSnow.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1296830"
        },
        {
            name: "直接启动",
            exePath: join("WarmSnow.exe")
        }
    ],
    archivePath: join(FileHandler.GetAppData(), "LocalLow", "BadMudStudio", "WarmSnow"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/61eb6d1e3f646.png",
    modType: UnityGame.modType,
    checkModType: UnityGame.checkModType
}