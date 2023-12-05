/**
 * @description 雨中冒险2 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from "node:path"
import { UnityGame } from "@src/model/UnityGame";


export const supportedGames: ISupportedGames = {
    gameID: 250,
    steamAppID: 632360,
    Thunderstore: {
        community_identifier: 'riskofrain2'
    },
    installdir: join("Risk of Rain 2"),
    gameName: "Risk of Rain 2",
    gameExe: "Risk of Rain 2.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/632360"
        },
        {
            name: "直接启动",
            exePath: join("Risk of Rain 2.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/607926e04c16a.png",
    modType: UnityGame.modType,
    checkModType: UnityGame.checkModType
}