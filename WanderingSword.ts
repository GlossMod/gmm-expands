/**
 * @description 逸剑风云决 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { FileHandler } from "@src/model/FileHandler";
import { UnrealEngine } from "@src/model/UnrealEngine";

export const supportedGames: ISupportedGames = {
    GlossGameId: 328,
    steamAppID: 1876890,
    installdir: join("Wandering Sword"),
    gameName: "Wandering Sword",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1876890"
        },
        {
            name: "直接启动",
            exePath: "JH.exe"
        }
    ],
    gameExe: "JH.exe",
    archivePath: join(FileHandler.GetAppData(), "Local", "Wandering_Sword", "Saved"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/656d920e5f559.webp",
    modType: UnrealEngine.modType("Wandering_Sword", false),
    checkModType: UnrealEngine.checkModType
}