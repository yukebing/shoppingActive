import { getStore } from "./setStorage";

let getters = {
    //获取typeList
    getTypeList(state) {
        let initTypeObj = getStore('typeObject');
        if (initTypeObj) {
            state.typeObject = JSON.parse(initTypeObj);
        }
        return state.typeObject
    },
    //是否是第一次进入页面
    getFirstTime(state) {
        let hasChooseSex = getStore('hasChooseSex');
        if (hasChooseSex) {
            state.firstTime = JSON.parse(hasChooseSex);
        }
        return state.firstTime
    },
    //是否第一次进入页面
    getPackageSexType(state) {
        return state.packageSexType
    }
}

export default getters