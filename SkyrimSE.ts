// /**
//  * @description 上古卷轴 重制版 安装支持
//  */

// import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
// import { basename, join } from 'node:path'
// import { FileHandler } from "@src/model/FileHandler"
// import { statSync } from "fs";
// import { Manager } from "@src/model/Manager"
// import { useManager } from "@src/stores/useManager";
// import { ElMessage } from "element-plus";

// export const supportedGames: ISupportedGames = {
//     gameID: 2,
//     steamAppID: 489830,
//     installdir: "Skyrim Special Edition",
//     gameName: "SkyrimSE",
//     gameExe: [
//         {
//             name: "SkyrimSE.exe",
//             rootPath: ""
//         },
//         {
//             name: "SkyrimSELauncher.exe",
//             rootPath: ""
//         }
//     ],
//     startExe: 'SkyrimSE.exe',
//     gameCoverImg: "https://mod.3dmgame.com/static/upload/game/2.jpg",
//     modType: [
//         {
//             id: 1,
//             name: '基础类型',
//             installPath: '\\mods',
//             async install(mod) {
//                 return true
//             },
//             async uninstall(mod) {
//                 return true
//             },
//         },

//     ],
//     checkModType(mod) {
//         return 1
//     }
// }