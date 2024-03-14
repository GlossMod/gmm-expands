/**
 * @description 幻兽帕鲁 支持
 */
import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'

import { UnrealEngine } from "@src/model/UnrealEngine"


export const supportedGames: ISupportedGames = {
    GlossGameId: 341,
    steamAppID: 502500,
    installdir: join("ACE COMBAT 7"),
    gameName: "ACE COMBAT 7",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/502500"
        },
        {
            name: "直接启动",
            exePath: "Ace7Game.exe"
        }
    ],
    gameExe: "Ace7Game.exe",
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/65f174af429dd.webp",
    modType: UnrealEngine.modType("Game", false),
    checkModType: UnrealEngine.checkModType
}