/** 
 * @description 霍格沃茨之遗 安装
*/
import type { IModInfo, ISupportedGames } from "@src/model/Interfaces";
import { join, extname } from 'node:path'
import { FileHandler } from "@src/model/FileHandler";
import { Manager } from "@src/model/Manager"
import { ElMessage } from "element-plus";

export const supportedGames: ISupportedGames = {
    gameID: 302,
    steamAppID: 990080,
    NexusMods: {
        game_domain_name: "hogwartslegacy",
        game_id: 5113
    },
    installdir: "HogwartsLegacy",
    gameName: "Hogwarts Legacy",
    gameExe: 'HogwartsLegacy.exe',
    startExe: [
        {
            name: 'Steam 启动',
            exePath: 'steam://rungameid/990080'
        },
        {
            name: '直接启动',
            exePath: 'HogwartsLegacy.exe'
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/63e2f9656f092.webp",
    modType: [
        {
            id: 1,
            name: '基础类型',
            // installPath: 'Phoenix\\Content\\Paks\\~mods',
            installPath: join('Phoenix', 'Content', 'Paks', '~mods'),
            async install(mod) {
                try {
                    let res = Manager.generalInstall(mod, this.installPath ?? "")
                    return res
                } catch (e) {
                    console.log(e);
                    FileHandler.writeLog(`错误:${e}`);
                    return false
                }
            },
            async uninstall(mod) {
                try {
                    return Manager.generalUninstall(mod, this.installPath ?? "")
                } catch (e) {
                    console.log(e);
                    FileHandler.writeLog(`错误:${e}`);
                    return false
                }
            }
        },
        {
            id: 2,
            name: '未知',
            installPath: "",
            async install(mod) {
                ElMessage.warning("未知类型, 请手动安装")
                return false
            },
            async uninstall(mod) {
                return false
            }
        }
    ],
    checkModType(mod: IModInfo) {
        let pak = false
        mod.modFiles.forEach(item => {
            if (extname(item) == '.pak') pak = true
        })
        if (pak) return 1

        return 2
    }
}

