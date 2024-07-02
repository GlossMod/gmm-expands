/**
 * @description 木卫四协议 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { UnrealEngine } from "@src/model/UnrealEngine";
import { FileHandler } from "@src/model/FileHandler";


export const supportedGames: ISupportedGames = {
    GlossGameId: 345,
    steamAppID: 1544020,
    installdir: join("The Callisto Protocol"),
    gameName: "The Callisto Protocol",
    gameExe: "TheCallistoProtocol.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1544020"
        },
        {
            name: "直接启动",
            exePath: "TheCallistoProtocol.exe"
        }
    ],
    archivePath: join(FileHandler.GetAppData(), "Local", "CallistoProtocol", "Saved"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/6605404b51bc3.webp",
    modType: UnrealEngine.modType("TheCallistoProtocol", false),
    checkModType: UnrealEngine.checkModType
}