/**
 * 导出所有扩展
 */
import { join } from 'path'
import { homedir } from "os";

import type { ISupportedGames } from "@src/model/Interfaces"
import { FileHandler } from '@src/model/FileHandler';

// 批量导入当前目录中的所有组件
const modules = import.meta.glob('./*', { eager: true })

let plugs = join(homedir(), 'My Documents', 'Gloss Mod Manager', 'Plug-ins')
// 获取 plugs 目录中的所有文件列表
let pulugsList = FileHandler.getFolderFiles(plugs)

pulugsList.forEach(async item => {
    let a = await import(join(plugs, item))

    console.log(a);

})



function getLangFiles(mList: any) {
    let msg: ISupportedGames[] = []
    for (let path in mList) {
        // console.log(mList[path]);
        if (mList[path].supportedGames) {
            let item = mList[path].supportedGames
            // console.log(item);
            msg.push(item)
        }
    }
    return msg
}

export function getAllExpands(): any {
    let message = getLangFiles(modules)
    return message
}