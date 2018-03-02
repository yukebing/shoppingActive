import { setStore } from "./setStorage";


let mutations = {

    // 初始化套餐list
    defaultTypelist(state, typeObject) {
        for (let i in typeObject) {
            state.typeObject[i] = typeObject[i].map(item => {
                return {
                    id: item.id,
                    name: item.name,
                    hot: item.hot? item.hot: false,
                    chooseAll: item.chooseAll? item.chooseAll: false,
                    orderNum: item.orderNum? item.orderNum: 0,
                    typeNum: item.children?item.children.length: 0,
                    discount: 0,
                    isMore:3,
                    children: item.children.map(ele => {
                        return {
                            id: ele.id,
                            name: ele.name,
                            money: ele.money,
                            ordered: ele.ordered? ele.ordered: false
                        }
                    })
                }
            });
        }
    },
    // 更新套餐list
    updateTypelist(state, paramObjeck) {
        state.typeObject[paramObjeck.sex] = paramObjeck.typeList
        setStore('typeObject', state.typeObject)
    },
    // 修改是否为返回至首页
    setFirstTime(state) {
        state.firstTime = false
        setStore('hasChooseSex', state.firstTime)
    },
    // 更新默认选择套餐的性别
    updatePackageSexType(state, sex) {
        state.packageSexType = sex
    }
}

export default mutations
