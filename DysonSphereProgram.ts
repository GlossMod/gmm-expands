/**
 * @description 戴森球计划 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from "node:path"
import { UnityGame } from "@src/model/UnityGame";


export const supportedGames: ISupportedGames = {
    gameID: 245,
    steamAppID: 1366540,
    Thunderstore: {
        community_identifier: 'dyson-sphere-program'
    },
    installdir: join("Dyson Sphere Program"),
    gameName: "Dyson Sphere Program",
    gameExe: "DSPGAME.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1366540"
        },
        {
            name: "直接启动",
            exePath: join("DSPGAME.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/60112fb1bdafa.png",
    modType: UnityGame.modType,
    checkModType: UnityGame.checkModType
}