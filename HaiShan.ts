/**
 * @description 海山 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from "node:path"
import { UnityGame } from "@src/model/UnityGame";


export const supportedGames: ISupportedGames = {
    GlossGameId: 366,
    steamAppID: 2180340,
    Thunderstore: {
        community_identifier: 'dyson-sphere-program'
    },
    installdir: join("HaiShan", "HaiShan"),
    gameName: "HaiShan",
    gameExe: "海山.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/2180340"
        },
        {
            name: "直接启动",
            exePath: join("海山.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/mod/202407/MOD669638c34fae8.webp@webp",
    modType: UnityGame.modType,
    checkModType: UnityGame.checkModType
}