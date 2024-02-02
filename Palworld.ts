/**
 * @description 幻兽帕鲁 支持
 */
import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { Manager } from "@src/model/Manager";

import { UnrealEngine } from "@src/model/UnrealEngine"


export const supportedGames: ISupportedGames = {
    GlossGameId: 333,
    steamAppID: 1623730,
    installdir: join("Palworld"),
    gameName: "Palworld",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/1623730"
        },
        {
            name: "直接启动",
            exePath: "Palworld.exe"
        }
    ],
    gameExe: [
        {
            name: "Palworld.exe",
            rootPath: "."
        },
        {
            name: "PalServer.exe",
            rootPath: ".",
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/65ae3cdbc7680.webp",
    modType: UnrealEngine.modType("Pal"),
    checkModType: UnrealEngine.checkModType
}