/**
 * @description 致命公司 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from "node:path"
import { UnityGame } from "@src/model/UnityGame";


export const supportedGames: ISupportedGames = {
    GlossGameId: 329,
    steamAppID: 1966720,
    Thunderstore: {
        community_identifier: 'lethal-company'
    },
    installdir: join("Lethal Company"),
    gameName: "Lethal Company",
    gameExe: "Lethal Company.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1966720"
        },
        {
            name: "直接启动",
            exePath: join("Lethal Company.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/65a0f0fb13a40.webp",
    modType: UnityGame.modType,
    checkModType: UnityGame.checkModType
}