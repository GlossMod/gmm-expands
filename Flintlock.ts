/**
 * @description Flintlock 支持
 */


import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { FileHandler } from "@src/model/FileHandler";
import { UnrealEngine } from "@src/model/UnrealEngine";

export const supportedGames: ISupportedGames = {
    GlossGameId: 368,
    steamAppID: 1832040,
    installdir: join("Flintlock The Siege of Dawn"),
    gameName: "Flintlock The Siege of Dawn",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1832040"
        },
        {
            name: "直接启动",
            exePath: "Saltpeter.exe"
        }
    ],
    gameExe: "Saltpeter.exe",
    archivePath: join(FileHandler.GetAppData(), "Local", "Saltpeter", "Saved"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/mod/202407/MOD669a223b01b15.webp@webp",
    modType: UnrealEngine.modType("Saltpeter", false),
    checkModType: UnrealEngine.checkModType
}