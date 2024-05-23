/**
 * @description 堕落之主 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { UnrealEngine } from "@src/model/UnrealEngine";


export const supportedGames: ISupportedGames = {
    GlossGameId: 352,
    steamAppID: 1501750,
    installdir: join("Lords of the Fallen"),
    gameName: "Lords of the Fallen",
    gameExe: "LOTF2.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1501750"
        },
        {
            name: "直接启动",
            exePath: "LOTF2.exe"
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/664db7b3148f8.webp",
    modType: UnrealEngine.modType("LOTF2", false),
    checkModType: UnrealEngine.checkModType
}