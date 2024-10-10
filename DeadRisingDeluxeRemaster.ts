/**
 * @description 丧尸围城豪华复刻版 支持
 */

import type { ISupportedGames } from "@src/model/Interfaces";
import { join } from 'path'
import { Steam } from "@src/model/Steam";
import { REEngine } from "@src/model/REEngine"



export const supportedGames: ISupportedGames = {
    GlossGameId: 391,
    steamAppID: 2527390,
    installdir: "DEAD RISING DELUXE REMASTER",
    gameName: "Dead Rising Deluxe Remaster",
    gameExe: 'DRDR.exe',
    startExe: [
        {
            name: 'Steam 启动',
            exePath: 'steam://rungameid/2527390'
        },
        {
            name: '直接启动',
            exePath: 'DRDR.exe'
        }
    ],
    archivePath: join(Steam.getSteamInstallPath() || "", "userdata", Steam.GetLastSteamId32(), "2527390", "remote"),
    gameCoverImg: "https://mod.3dmgame.com/static/upload/mod/202410/MOD67077f9f042f5.webp@webp",
    modType: REEngine.modType,
    checkModType: REEngine.checkModType
}