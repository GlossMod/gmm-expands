/**
 * @description 缉私警察 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join, basename, extname } from "node:path"
import { UnityGame } from "@src/model/UnityGame";


export const supportedGames: ISupportedGames = {
    GlossGameId: 339,
    steamAppID: 756800,
    installdir: join("Contraband Police"),
    gameName: "Contraband Police",
    gameExe: "ContrabandPolice.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/756800"
        },
        {
            name: "直接启动",
            exePath: join("ContrabandPolice.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/65f1169237040.webp",
    modType: [
        ...UnityGame.modType
    ],
    checkModType: UnityGame.checkModType
}