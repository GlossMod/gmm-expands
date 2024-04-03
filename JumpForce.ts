/**
 * @description Jump大乱斗 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { UnrealEngine } from "@src/model/UnrealEngine";


export const supportedGames: ISupportedGames = {
    GlossGameId: 181,
    steamAppID: 816020,
    installdir: join("JUMP FORCE"),
    gameName: "JUMP FORCE",
    gameExe: "JUMP_FORCE.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/816020"
        },
        {
            name: "直接启动",
            exePath: "JUMP_FORCE.exe"
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/181.jpg",
    modType: UnrealEngine.modType("JUMP_FORCE", false),
    checkModType: UnrealEngine.checkModType
}