/**
 * @description 高达创坏者 4 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from "node:path"
import { FileHandler } from "@src/model/FileHandler";
import { UnrealEngine } from "@src/model/UnrealEngine";

export const supportedGames: ISupportedGames = {
    GlossGameId: 388,
    steamAppID: 1672500,
    installdir: join("GBBBB"),
    gameName: "GUNDAM BREAKER 4",
    gameExe: "GB4.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1672500"
        },
        {
            name: "直接启动",
            exePath: join("GB4.exe")
        }
    ],
    archivePath: join(FileHandler.GetAppData(), "Local", "GB4", "Saved"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/mod/202410/MOD670635775ec6c.webp@webp",
    modType: UnrealEngine.modType("GB4", false),
    checkModType: UnrealEngine.checkModType
}