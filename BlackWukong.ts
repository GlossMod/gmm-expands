/**
 * @description 黑神话 悟空 支持
 */


import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { FileHandler } from "@src/model/FileHandler";
import { UnrealEngine } from "@src/model/UnrealEngine";

export const supportedGames: ISupportedGames = {
    GlossGameId: 376,
    steamAppID: 2358720,
    installdir: join("BlackMythWukong"),
    gameName: "Black Myth Wukong",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/2358720"
        },
        {
            name: "直接启动",
            exePath: "b1.exe"
        }
    ],
    gameExe: "b1.exe",
    // archivePath: join(FileHandler.getMyDocuments(), "My Games", "FINAL FANTASY VII REMAKE"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/mod/202408/MOD66b5c72696594.webp@webp",
    modType: UnrealEngine.modType("b1", false),
    checkModType: UnrealEngine.checkModType
}