/**
 * @description 漫漫长夜 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { UnityGameILCPP2 } from "@src/model/UnityGame";


export const supportedGames: ISupportedGames = {
    GlossGameId: 65,
    steamAppID: 305620,
    installdir: join("TheLongDark"),
    gameName: "The Long Dark",
    gameExe: "tld.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/305620"
        },
        {
            name: "直接启动",
            exePath: "tld.exe"
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/65.png",
    modType: UnityGameILCPP2.modType,
    checkModType: UnityGameILCPP2.checkModType
}