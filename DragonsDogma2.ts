import type { IModInfo, IState, ISupportedGames } from "@src/model/Interfaces";
import { join, extname, basename } from 'path'
import { Manager } from "@src/model/Manager";
import { ElMessage } from "element-plus";
import { useManager } from "@src/stores/useManager";
import { statSync } from "fs"
import { FileHandler } from "@src/model/FileHandler";

let pakList = {
    get data() {
        let manager = useManager()
        let file = join(manager.modStorage, 'pakList.txt')
        console.log(file);

        let data = FileHandler.readFile(file, '')
        // 将字符串转为数组
        let dataList = data.split('\n')
        // 将里面的空字符串去掉
        let list = dataList.filter(item => item != '')
        // 将数组转换为二维数组, 使用 | 分割
        let pakList = list.map(item => item.split('|'))
        return pakList
    },
    set data(value) {
        // console.log("写入");

        let manager = useManager()
        let file = join(manager.modStorage, 'pakList.txt')
        let data = value.map(item => item.join('|')).join('\n')
        FileHandler.writeFile(file, data)
    }
}

function getGamePakName() {
    const manager = useManager()
    let gameStorage = manager.gameStorage
    // 获取游戏目录下所有 *.pak 文件
    let pakFiles = FileHandler.getFolderFiles(gameStorage).filter(item => extname(item) == '.pak')
    // console.log(pakFiles);
    // 获取 "re_chunk_000.pak.patch_001.pak" 中的 patch_001.pak 为 1
    let pakNum = pakFiles.map(item => {
        let name = basename(item)
        let num = name.split('.pak')
        // 获取 倒数第二个
        let num2 = num[num.length - 2]
        return Number.isNaN(Number(num2.split('_')[1])) ? 0 : Number(num2.split('_')[1])
    })
    // 获取最大的数字
    let maxNum = Math.max(...pakNum)

    // 001 或 010
    let num = String(maxNum + 1).padStart(3, '0')
    let pakName = `re_chunk_000.pak.patch_${num}.pak`

    return pakName
}


async function handlePak(mod: IModInfo, isInstall: boolean) {
    const manager = useManager()

    let pakListData = pakList.data
    console.log(pakListData);
    mod.modFiles.forEach(item => {
        let modStorage = join(manager.modStorage ?? "", mod.id.toString(), item)
        if (statSync(modStorage).isFile() && extname(modStorage) == '.pak') {
            let gameStorage = join(manager.gameStorage ?? "")


            if (isInstall) {
                let pakName = getGamePakName()
                let gamePak = join(gameStorage, pakName)
                FileHandler.copyFile(modStorage, gamePak)
                console.log(pakName);
                pakListData.push([basename(modStorage), pakName])
                console.log(pakListData);

            } else {
                // 从 modPakInGamePak 中获取 包含 basename(modStorage) 的数组
                let modPakInGamePak = pakListData.filter(item => item.includes(basename(modStorage)))
                let pakName = modPakInGamePak[0][1];
                pakListData = pakListData.filter(item => !item.includes(pakName))
                let gamePak = join(gameStorage, pakName)
                FileHandler.deleteFile(gamePak)
            }
        }
    })

    if (!isInstall) {
        /** 
         * 卸载逻辑 文件命名规则为 
           re_chunk_000.pak
           re_chunk_000.pak.patch_001.pak
           re_chunk_000.pak.patch_002.pak
           re_chunk_000.pak.patch_003.pak
           re_chunk_000.pak.patch_004.pak
           re_chunk_000.pak.patch_005.pak
           re_chunk_000.pak.patch_006.pak
           如果卸载的是 re_chunk_000.pak.patch_002.pak, 那么后面的 patch_003.pak 以后的文件都要往前移动
           先获取所有pak文件，然后判断缺少了哪个 pak 再将后面的pak 往前移动序号
           pakListData 里面是当前剩余的 pak 列表
        */

        // 按照 patch 序号进行排序
        pakListData.sort((a, b) => {
            const patchNumA = parseInt(a[1].split('_').pop() ?? "0")
            const patchNumB = parseInt(b[1].split('_').pop() ?? "0")
            return patchNumA - patchNumB
        })

        let expectedPatchNum = 1
        for (let index in pakListData) {
            let item = pakListData[index]
            const currentPatchNum = parseInt(item[1].split('_').pop() ?? "0")

            // 如果当前的补丁号和预期的补丁号不匹配，并且预期的补丁号也不是0（跳过原始的 .pak 文件）
            // 那么我们就找到了所需跳动的补丁号
            if (currentPatchNum !== expectedPatchNum && expectedPatchNum !== 0) {
                const manager = useManager()
                const pakName = `re_chunk_000.pak.patch_${String(expectedPatchNum).padStart(3, '0')}.pak`
                await FileHandler.renameFile(join(manager.gameStorage, item[1]), join(manager.gameStorage, pakName))
                item[1] = pakName
            }

            // 预期的补丁号进行加 1 操作
            expectedPatchNum++
        }

    }

    pakList.data = pakListData

    return true
}


export const supportedGames: ISupportedGames = {
    GlossGameId: 343,
    steamAppID: 2054970,
    installdir: "Dragons Dogma 2",
    gameName: "Dragons Dogma 2",
    gameExe: 'DD2.exe',
    startExe: [
        {
            name: 'Steam 启动',
            exePath: 'steam://rungameid/2054970'
        },
        {
            name: '直接启动',
            exePath: 'DD2.exe'
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/65f8f21471754.webp",
    modType: [
        {
            id: 1,
            name: "autorun",
            installPath: join('reframework', 'autorun'),
            async install(mod) {
                if (!Manager.checkInstalled("REFramework", 207695)) return false
                return Manager.installByFolder(mod, this.installPath ?? "", 'autorun', true)
            },
            async uninstall(mod) {
                return Manager.installByFolder(mod, this.installPath ?? "", 'autorun', false)
            }
        },
        {
            id: 2,
            name: "REFramework",
            installPath: join(''),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", true)
            }
        },
        // {
        //     id: 3,
        //     name: "模型替换",
        //     installPath: join('natives'),
        //     async install(mod) {
        //         if (!Manager.checkInstalled("REFramework", 202993)) return false
        //         if (!Manager.checkInstalled("FirstNatives", 202971)) return false

        //         return Manager.installByFolder(mod, this.installPath ?? "", 'natives', true)
        //     },
        //     async uninstall(mod) {
        //         return Manager.installByFolder(mod, this.installPath ?? "", 'natives', false)
        //     }
        // },
        {
            id: 4,
            name: 'plugins',
            installPath: join('reframework', 'plugins'),
            async install(mod) {
                if (!Manager.checkInstalled("REFramework", 207695)) return false
                return Manager.installByFolder(mod, this.installPath ?? "", 'plugins', true)
            },
            async uninstall(mod) {
                return Manager.installByFolder(mod, this.installPath ?? "", 'plugins', false)
            }
        },
        {
            id: 5,
            name: '主目录',
            installPath: join(''),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", true)
            }
        },
        {
            id: 6,
            name: "pak",
            installPath: join(''),
            async install(mod) {
                return handlePak(mod, true)
            },
            async uninstall(mod) {
                return handlePak(mod, false)
            },
        },
        {
            id: 7,
            name: 'RefPubgins',
            installPath: join('reframework'),
            async install(mod) {
                if (!Manager.checkInstalled("REFramework", 207695)) return false
                return Manager.installByFolder(mod, this.installPath ?? "", 'reframework', true)
            },
            async uninstall(mod) {
                return Manager.installByFolder(mod, this.installPath ?? "", 'reframework', false)
            }
        },
        {
            id: 99,
            name: "未知",
            installPath: join(''),
            async install(mod) {
                ElMessage.warning("未知类型, 请手动安装")
                return false
            },
            async uninstall(mod) {
                return true
            }
        }
    ],
    checkModType(mod) {
        let natives = false
        let plugins = false
        let autorun = false
        let REFramework = false
        let pak = false

        let refPubgins = false

        mod.modFiles.forEach(item => {

            let list = FileHandler.pathToArray(item)

            if (list.some(item => FileHandler.compareFileName(item, 'reframework'))) {
                console.log(list);
            }

            if (basename(item) == 'dinput8.dll') REFramework = true
            if (list.some(item => FileHandler.compareFileName(item, 'natives'))) natives = true
            if (list.some(item => FileHandler.compareFileName(item, 'autorun'))) autorun = true
            if (list.some(item => FileHandler.compareFileName(item, 'plugins'))) plugins = true
            if (list.some(item => FileHandler.compareFileName(item, 'reframework'))) refPubgins = true
            if (extname(item) == '.pak') pak = true
        })

        if (REFramework) return 2

        if (refPubgins) return 7

        if (autorun) return 1
        if (plugins) return 4
        if (natives) return 3
        if (pak) return 6

        return 99
    }
}