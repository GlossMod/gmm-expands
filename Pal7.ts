/**
 * @description 仙剑奇侠传7 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { UnrealEngine } from "@src/model/UnrealEngine";


export const supportedGames: ISupportedGames = {
    GlossGameId: 277,
    steamAppID: 1543030,
    installdir: join("仙剑奇侠传七"),
    gameName: "Pal7",
    gameExe: "Pal7.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1543030"
        },
        {
            name: "直接启动",
            exePath: "Pal7.exe"
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/6256729d72a41.png",
    modType: UnrealEngine.modType("Pal7", false),
    checkModType: UnrealEngine.checkModType
}