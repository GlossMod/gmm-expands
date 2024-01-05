/**
 * @description GTA5 支持
 */

import type { IModInfo, ISupportedGames } from "@src/model/Interfaces";
import { basename, join, extname, } from "node:path"
import { ElMessage } from "element-plus";
import { Manager } from "@src/model/Manager";
import { FileHandler } from "@src/model/FileHandler";
import { useManager } from "@src/stores/useManager";
import { execSync } from 'child_process';


const xml2js = require('xml2js')

//#region 脚本相关

let mods_xml = {
    get data() {
        let manager = useManager()
        let gameStorage = join(manager.gameStorage ?? "")
        let data = FileHandler.readFile(join(gameStorage, 'lml', 'mods.xml'), `<ModsManager> 
        <Mods />
        <LoadOrder />
        </ModsManager>`)
        return xml2js.parseStringPromise(data)
    },
    set data(value) {
        let manager = useManager()
        let gameStorage = join(manager.gameStorage ?? "")
        let file = join(gameStorage, 'lml', 'mods.xml')
        let data = new xml2js.Builder().buildObject(value)
        if (data) FileHandler.writeFile(file, data)
    }
}


function asi(mod: IModInfo, isInstall: boolean) {
    let manager = useManager()
    let modStorage = join(manager.modStorage, mod.id.toString())
    mod.modFiles.forEach(item => {
        if (basename(item) == 'install.xml') {
            install_xml(join(modStorage, item), isInstall)
        }
    })
    return Manager.installByFileSibling(mod, "", '.asi', isInstall, true)
}

async function install_xml(file: string, isInstall: boolean) {
    let data = FileHandler.readFile(file)
    let xml = await xml2js.parseStringPromise(data)
    let name = xml.EasyInstall.Name[0]
    let folder = basename(join(file, '..'))

    let mods_xml_data = await mods_xml.data;
    let { ModsManager } = mods_xml_data
    console.log(ModsManager);

    let Mods = ModsManager.Mods
    let mod = Mods[0].Mod?.find((item: any) => item.$?.folder == folder)
    if (mod) {
        // 如果存在 将 Enabled 设为 true
        mod.Enabled[0] = isInstall
    } else {
        if (!Mods[0].Mod) Mods[0] = { Mod: [] }
        Mods[0].Mod.push({
            $: {
                folder: folder,
            },
            Name: [name],
            Enabled: [isInstall],
            Overwrite: ['false'],
            DisabledGroups: ['']
        })
    }

    let LoadOrder: any[] = ModsManager.LoadOrder

    // let list = LoadOrder[0].Mod
    // 判断 folder 是否在 LoadOrder[0].Mod 中
    if (!LoadOrder[0].Mod?.includes(folder)) {
        if (!LoadOrder[0].Mod) LoadOrder[0] = { Mod: [] }
        LoadOrder[0].Mod.push(folder)
    }

    mods_xml.data = mods_xml_data
}



//#endregion

//#region 添加式

/**
 * 获取 dlc 的名称
 * @param dlc 
 * @returns 
 */
async function GetDlcName(dlc: string) {
    const manager = useManager()
    const tools = manager.getModInfoByWebId(205014);
    const read_path = join(manager.modStorage, tools?.id.toString() ?? "", "_read.bat")
    const cmd = `"${read_path}" "${dlc}" "setup2.xml"`
    // console.log(cmd);
    let xmlData = await xml2js.parseStringPromise(execSync(cmd, { encoding: 'utf8' }).toString());
    // console.log(xmlData);
    return xmlData?.SSetupData?.nameHash[0];
}
/**
 * 写入 dlc 名称到 dlclist.xml
 * @param name 
 */
async function writeDlcName(name: string, isInstall: boolean) {
    const manager = useManager()
    const tools = manager.getModInfoByWebId(205014);

    const tools_path = join(manager.modStorage, tools?.id.toString() ?? "")

    const update_path = join(manager.gameStorage, "mods", "update", "update.rpf")
    // 判断文件是否存在
    if (!FileHandler.fileExists(update_path)) {
        // 在 mods 中创建 update.rpf 文件
        await FileHandler.copyFile(join(manager.gameStorage, "update", "update.rpf"), update_path)
    }

    // 获取 dlclist.xml
    const _getDlcList_path = join(tools_path, "_getDlcList.bat");

    const cmd = `"${_getDlcList_path}" "${update_path}"`
    let xmlData = await xml2js.parseStringPromise(execSync(cmd, { encoding: 'utf8' }).toString());

    let dlclist = xmlData?.SMandatoryPacksData?.Paths[0]?.Item as string[]
    if (isInstall) {
        dlclist.push(`dlcpacks:/${name}/`)
    } else {
        // 从 dlclist 中 移除所有 `dlcpacks:/${name}/`
        xmlData.SMandatoryPacksData.Paths[0].Item = dlclist.filter(item => item != `dlcpacks:/${name}/`)
    }

    console.log(xmlData);


    let file = join(tools_path, 'dlclist.xml')
    let data = new xml2js.Builder().buildObject(xmlData)
    if (data) {
        await FileHandler.writeFile(file, data)
        const _write_path = join(tools_path, '_write.bat')
        const path = join("common", "data", "dlclist.xml");
        const cmd2 = `"${_write_path}" "${update_path}" "${file}" "${path}"`
        execSync(cmd2, { encoding: 'utf8' }).toString()
    }
}

function dlcHandler(mod: IModInfo, installPath: string, isInstall: boolean) {
    let manager = useManager()
    let modStorage = join(manager.modStorage, mod.id.toString())
    let gameStorage = join(manager.gameStorage ?? "")

    mod.modFiles.forEach(async item => {
        if (basename(item) == 'dlc.rpf') {
            let name = await GetDlcName(join(modStorage, item))
            writeDlcName(name, isInstall);
            if (isInstall) {
                FileHandler.copyFile(join(modStorage, item), join(gameStorage, installPath, name, 'dlc.rpf'))
            } else {
                FileHandler.deleteFile(join(gameStorage, installPath, name, 'dlc.rpf'))
            }
        }
    })

    return true
}

//#endregion

//#region 载具 替换式


function buidGmm() {
    const manager = useManager()
    const gameStorage = join(manager.gameStorage ?? "")
    const tools = manager.getModInfoByWebId(205014);
    const tools_path = join(manager.modStorage, tools?.id.toString() ?? "")

    // 如果不存在 则生成
    let dlcpacks_path = join(gameStorage, "mods", "update", "x64", "dlcpacks")
    const cmd = `"${join(tools_path, "_buidGMM.bat")}" "${dlcpacks_path}"`
    console.log(cmd);

    execSync(cmd, { encoding: 'utf8' }).toString()
}

// 初始化 gmm 的 dlc.rpf
function initGmm_rpf() {
    const manager = useManager()
    const gameStorage = join(manager.gameStorage ?? "")

    // 判断 gmm 的 dlc.rpf 是否存在
    const gmm_rpf = join(gameStorage, "mods", "update", "x64", "dlcpacks", "gmm", "dlc.rpf")
    if (FileHandler.fileExists(gmm_rpf)) {
        //如果存在 则跳过
        console.log("gmm 的 dlc.rpf 已存在");
        return
    }
    // buidGmm();
    writeDlcName('gmm', true)

}

async function tyfHandler(mod: IModInfo, isInstall: boolean) {
    initGmm_rpf()
    const manager = useManager()
    const tools = manager.getModInfoByWebId(205014);
    const tools_path = join(manager.modStorage, tools?.id.toString() ?? "")

    const target = join(tools_path, "gmm", "x64", "vehicles.rpf")

    for (let index = 0; index < mod.modFiles.length; index++) {
        const item = mod.modFiles[index];
        let types = ['.yft', '.ytd']
        // 判断文件后缀是否是 types
        if (types.includes(extname(item))) {
            // 如果是 则复制到 gmm 的 dlc.rpf
            if (isInstall) {
                await FileHandler.copyFile(join(manager.modStorage, mod.id.toString(), item), join(target, basename(item)))
            } else {
                await FileHandler.deleteFile(join(target, basename(item)))
            }
        }
    }

    // 生成 gmm 的 dlc.rpf
    buidGmm()

    return true
}

//#endregion


//#region 人物

async function pedItem(name: string, isInstall: boolean) {
    let xml = {
        "Name": [name],
        "PropsName": [
            "null"
        ],
        "ClipDictionaryName": [
            "move_f@generic"
        ],
        "BlendShapeFileName": [
            "null"
        ],
        "ExpressionSetName": [
            "expr_set_ambient_female"
        ],
        "ExpressionDictionaryName": [
            "null"
        ],
        "ExpressionName": [
            "null"
        ],
        "Pedtype": [
            "CIVFEMALE"
        ],
        "MovementClipSet": [
            "move_f@generic"
        ],
        "StrafeClipSet": [
            "move_ped_strafing"
        ],
        "MovementToStrafeClipSet": [
            "move_ped_to_strafe"
        ],
        "InjuredStrafeClipSet": [
            "move_strafe_injured"
        ],
        "FullBodyDamageClipSet": [
            "dam_ko"
        ],
        "AdditiveDamageClipSet": [
            "dam_ad"
        ],
        "DefaultGestureClipSet": [
            "ANIM_GROUP_GESTURE_F_GENERIC"
        ],
        "FacialClipsetGroupName": [
            "facial_clipset_group_gen_female"
        ],
        "DefaultVisemeClipSet": [
            "ANIM_GROUP_VISEMES_F_LO"
        ],
        "SidestepClipSet": [
            "CLIP_SET_ID_INVALID"
        ],
        "PoseMatcherName": [
            "Male"
        ],
        "PoseMatcherProneName": [
            "Male_prone"
        ],
        "GetupSetHash": [
            "NMBS_SLOW_GETUPS"
        ],
        "CreatureMetadataName": [
            "null"
        ],
        "DecisionMakerName": [
            "DEFAULT"
        ],
        "MotionTaskDataSetName": [
            "STANDARD_PED"
        ],
        "DefaultTaskDataSetName": [
            "STANDARD_PED"
        ],
        "PedCapsuleName": [
            "STANDARD_FEMALE"
        ],
        "PedLayoutName": [
            ""
        ],
        "PedComponentSetName": [
            ""
        ],
        "PedComponentClothName": [
            ""
        ],
        "PedIKSettingsName": [
            ""
        ],
        "TaskDataName": [
            ""
        ],
        "IsStreamedGfx": [
            {
                "$": {
                    "value": "false"
                }
            }
        ],
        "AmbulanceShouldRespondTo": [
            {
                "$": {
                    "value": "true"
                }
            }
        ],
        "CanRideBikeWithNoHelmet": [
            {
                "$": {
                    "value": "false"
                }
            }
        ],
        "CanSpawnInCar": [
            {
                "$": {
                    "value": "true"
                }
            }
        ],
        "IsHeadBlendPed": [
            {
                "$": {
                    "value": "false"
                }
            }
        ],
        "bOnlyBulkyItemVariations": [
            {
                "$": {
                    "value": "false"
                }
            }
        ],
        "RelationshipGroup": [
            "CIVFEMALE"
        ],
        "NavCapabilitiesName": [
            "STANDARD_PED"
        ],
        "PerceptionInfo": [
            "DEFAULT_PERCEPTION"
        ],
        "DefaultBrawlingStyle": [
            "BS_AI"
        ],
        "DefaultUnarmedWeapon": [
            "WEAPON_UNARMED"
        ],
        "Personality": [
            "Streamed_Female"
        ],
        "CombatInfo": [
            "DEFAULT"
        ],
        "VfxInfoName": [
            "VFXPEDINFO_HUMAN_GENERIC"
        ],
        "AmbientClipsForFlee": [
            "FLEE"
        ],
        "Radio1": [
            "RADIO_GENRE_PUNK"
        ],
        "Radio2": [
            "RADIO_GENRE_JAZZ"
        ],
        "FUpOffset": [
            {
                "$": {
                    "value": "0.000000"
                }
            }
        ],
        "RUpOffset": [
            {
                "$": {
                    "value": "0.000000"
                }
            }
        ],
        "FFrontOffset": [
            {
                "$": {
                    "value": "0.000000"
                }
            }
        ],
        "RFrontOffset": [
            {
                "$": {
                    "value": "0.147000"
                }
            }
        ],
        "MinActivationImpulse": [
            {
                "$": {
                    "value": "20.000000"
                }
            }
        ],
        "Stubble": [
            {
                "$": {
                    "value": "0.000000"
                }
            }
        ],
        "HDDist": [
            {
                "$": {
                    "value": "3.000000"
                }
            }
        ],
        "TargetingThreatModifier": [
            {
                "$": {
                    "value": "1.000000"
                }
            }
        ],
        "KilledPerceptionRangeModifer": [
            {
                "$": {
                    "value": " - 1.000000"
                }
            }
        ],
        "Sexiness": [
            ""
        ],
        "Age": [
            {
                "$": {
                    "value": "0"
                }
            }
        ],
        "MaxPassengersInCar": [
            {
                "$": {
                    "value": "0"
                }
            }
        ],
        "ExternallyDrivenDOFs": [
            ""
        ],
        "PedVoiceGroup": [
            "BAR_PERSON_PVG"
        ],
        "AnimalAudioObject": [
            ""
        ],
        "AbilityType": [
            "SAT_NONE"
        ],
        "ThermalBehaviour": [
            "TB_WARM"
        ],
        "SuperlodType": [
            "SLOD_HUMAN"
        ],
        "ScenarioPopStreamingSlot": [
            "SCENARIO_POP_STREAMING_NORMAL"
        ],
        "DefaultSpawningPreference": [
            "DSP_NORMAL"
        ],
        "DefaultRemoveRangeMultiplier": [
            {
                "$": {
                    "value": "1.000000"
                }
            }
        ],
        "AllowCloseSpawning": [
            {
                "$": {
                    "value": "false"
                }
            }
        ]
    }
    const manager = useManager()
    const tools = manager.getModInfoByWebId(205014);
    const tools_path = join(manager.modStorage, tools?.id.toString() ?? "")

    const meta_path = join(tools_path, "gmm", "data", "pedmodelinfo.meta")

    let metaData = FileHandler.readFile(meta_path, `<?xml version="1.0" encoding="UTF-8"?>
<CPedModelInfo__InitDataList>
    <InitDatas />
</CPedModelInfo__InitDataList>`);

    let PedModelInfo = await xml2js.parseStringPromise(metaData)
    if (!PedModelInfo.CPedModelInfo__InitDataList.InitDatas[0].Item) {
        PedModelInfo.CPedModelInfo__InitDataList = {
            InitDatas: [{
                Item: []
            }]
        }
    }

    if (isInstall) {
        PedModelInfo.CPedModelInfo__InitDataList.InitDatas[0].Item.push(xml)
    } else {
        PedModelInfo.CPedModelInfo__InitDataList.InitDatas[0].Item = PedModelInfo.CPedModelInfo__InitDataList.InitDatas[0].Item.filter((item: any) => {
            return item.Name[0] != name
        })
    }

    let data = new xml2js.Builder().buildObject(PedModelInfo)

    if (data) {
        // console.log(PedModelInfo);
        FileHandler.writeFile(meta_path, data)
    }

}

async function yddHandler(mod: IModInfo, isInstall: boolean) {
    initGmm_rpf()
    const manager = useManager()
    const tools = manager.getModInfoByWebId(205014);
    const tools_path = join(manager.modStorage, tools?.id.toString() ?? "")

    let names = []

    const target = join(tools_path, "gmm", "x64", "peds.rpf")
    for (let index = 0; index < mod.modFiles.length; index++) {
        const item = mod.modFiles[index];
        let types = ['.ydd', '.yft', '.yld', '.ymt', '.ytd']
        if (types.includes(extname(item))) {
            // 不包含后缀的文件名
            names.push(basename(item, extname(item)))

            if (isInstall) {
                await FileHandler.copyFile(join(manager.modStorage, mod.id.toString(), item), join(target, basename(item)))
            } else {
                await FileHandler.deleteFile(join(target, basename(item)))
            }
        }
    }

    // name 去重
    names = [...new Set(names)]
    for (let index = 0; index < names.length; index++) {
        const item = names[index];
        await pedItem(item, isInstall);
    }

    buidGmm()

    return true
}



//#endregion

// 上限补丁
async function gameconfig(mod: IModInfo, isInstall: boolean) {

    const manager = useManager()
    const tools = manager.getModInfoByWebId(205014);
    const tools_path = join(manager.modStorage, tools?.id.toString() ?? "")

    const update_path = join(manager.gameStorage, "mods", "update", "update.rpf")
    // 判断文件是否存在
    if (!FileHandler.fileExists(update_path)) {
        // 在 mods 中创建 update.rpf 文件
        await FileHandler.copyFile(join(manager.gameStorage, "update", "update.rpf"), update_path)
    }

    mod.modFiles.forEach(item => {

        if (basename(item) == 'gameconfig.xml') {
            const filename = join(manager.modStorage, mod.id.toString(), item)
            const inputFile = join("common", "data", "gameconfig.xml")

            const _write_bat = join(tools_path, '_write.bat')

            const cmd = `"${_write_bat}" "${update_path}" "${filename}" "${inputFile}"`

            console.log(cmd);


            execSync(cmd, { encoding: 'utf8' }).toString()
        }

    })

    return true;
}

export const supportedGames: ISupportedGames = {
    gameID: 261,
    steamAppID: 271590,
    installdir: join("Grand Theft Auto V"),
    gameName: "Grand Theft Auto V",
    gameExe: "GTA5.exe",
    startExe: [
        {
            name: "Steam 启动",
            exePath: "steam://rungameid/271590"
        },
        {
            name: "直接启动",
            exePath: join("PlayGTAV.exe")
        }
    ],
    gameCoverImg: "https://mod.3dmgame.com/static/upload/game/616cd448533b9.png",
    modType: [
        {
            id: 1,
            name: "asi",
            installPath: join(""),
            async install(mod) {
                return asi(mod, true)
            },
            async uninstall(mod) {
                return asi(mod, false)
            }
        },
        {
            id: 2,
            name: "gameconfig",
            installPath: join("gameconfig"),
            async install(mod) {
                if (!Manager.checkInstalled("RPF 文件编辑工具", 205014)) return false
                return gameconfig(mod, true)
            },
            async uninstall(mod) {
                return gameconfig(mod, false)
            }
        },
        {
            id: 3,
            name: "游戏根目录",
            installPath: "",
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", true)
            }
        },
        {
            id: 4,
            name: "ScriptHookV",
            installPath: "",
            async install(mod) {
                // ScriptHookV.dll
                return Manager.installByFileSibling(mod, this.installPath ?? "", 'ScriptHookV.dll', true)
            },
            async uninstall(mod) {
                return Manager.installByFileSibling(mod, this.installPath ?? "", 'ScriptHookV.dll', false)
            }
        },
        {
            id: 5,
            name: 'script',
            installPath: join('scripts'),
            async install(mod) {
                return Manager.generalInstall(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return Manager.generalUninstall(mod, this.installPath ?? "", true)
            }
        },
        {
            id: 6,
            name: 'dlc',    // 添加式
            installPath: join("mods", "update", "x64", "dlcpacks"),
            async install(mod) {
                if (!Manager.checkInstalled("RPF 文件编辑工具", 205014)) return false
                return dlcHandler(mod, this.installPath ?? "", true)
            },
            async uninstall(mod) {
                return dlcHandler(mod, this.installPath ?? "", false)
            }
        },
        {
            id: 7,
            name: 'tyf',    // 载具替换式
            installPath: join(""),
            async install(mod) {
                if (!Manager.checkInstalled("RPF 文件编辑工具", 205014)) return false
                return tyfHandler(mod, true)
            },
            async uninstall(mod) {
                return tyfHandler(mod, false)
            }
        },
        {
            id: 8,
            name: 'ydd',    // 人物
            installPath: join("mods", "update", "x64", "dlcpacks"),
            async install(mod) {
                if (!Manager.checkInstalled("RPF 文件编辑工具", 205014)) return false
                return yddHandler(mod, true)
            },
            async uninstall(mod) {
                return yddHandler(mod, false)
            }
        },
        {
            id: 9,
            name: "tools",
            installPath: "",
            async install(mod) {
                return true
            },
            async uninstall(mod) {
                return true
            }
        },
        {
            id: 10,
            name: "oiv",
            installPath: "",
            async install(mod) {
                ElMessage.warning("oiv 类型请使用 OpenIV 进行安装")
                return false
            },
            async uninstall(mod) {
                return true
            }
        },
        {
            id: 99,
            name: "未知",
            installPath: "",
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
        let asi = false
        // let rootFolder = false
        // let folderList = ['x64']
        let gameconfig = false
        let ScriptHookRDR2 = false
        let scripts = false
        let dlc = false
        let yft = false
        let ydd = false
        let oiv = false

        mod.modFiles.forEach(item => {
            // 判断目录是否包含 folderList
            let list = FileHandler.pathToArray(item)
            // if (list.some(item => folderList.includes(item))) rootFolder = true

            if (extname(item) == '.asi') asi = true
            if (extname(item) == '.dll') scripts = true
            if (basename(item) == 'gameconfig.xml') gameconfig = true
            if (basename(item) == 'ScriptHookV.dll') ScriptHookRDR2 = true
            if (basename(item) == 'dlc.rpf') dlc = true
            if (extname(item) == '.yft') yft = true
            if (extname(item) == '.ydd') ydd = true
            if (extname(item) == '.oiv') oiv = true

        })

        if (ScriptHookRDR2) return 4

        if (asi) return 1
        if (gameconfig) return 2
        // if (rootFolder) return 3
        if (scripts) return 5
        if (dlc) return 6
        if (ydd) return 8
        if (yft) return 7
        if (oiv) return 10

        return 99
    }
}