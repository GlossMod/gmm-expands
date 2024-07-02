/**
 * @description 庄园领主 支持
 */
import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'

import { UnrealEngine } from "@src/model/UnrealEngine"
import { FileHandler } from "@src/model/FileHandler";


export const supportedGames: ISupportedGames = {
    GlossGameId: 348,
    steamAppID: 1363080,
    installdir: join("Manor Lords"),
    gameName: "Manor Lords",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1363080"
        },
        {
            name: "直接启动",
            exePath: "ManorLords.exe"
        }
    ],
    gameExe: "ManorLords.exe",
    archivePath: join(FileHandler.GetAppData(), "Local", "ManorLords", "Saved"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/662db2a8b4521.webp",
    modType: UnrealEngine.modType("ManorLords", false),
    checkModType: UnrealEngine.checkModType
}