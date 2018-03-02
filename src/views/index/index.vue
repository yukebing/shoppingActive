<template>
    <div class="index_page">
        <div class="message_box" v-if="showChooseSexPackageBox">
            <div class="shadow"></div>
            <div class="message_content">
                <p>请选择你要购买的套餐类型</p>
                <p @click="chooseSexPackage('male')"><i><img :src="packageSexType === 'male'? '/static/img/chosse-sex-package-focus.png':'/static/img/choose-sex-package-default.png'" alt=""></i>男性套餐</p>
                <p @click="chooseSexPackage('female')"><i><img :src="packageSexType === 'female'? '/static/img/chosse-sex-package-focus.png':'/static/img/choose-sex-package-default.png'" alt=""></i>女性套餐</p>
                <button @click="next">下一步</button>
            </div>
        </div>
        <div class="banner">
            <div class="nav">
                <button :class="{'focus': packageSexType === 'male'}"  @click="chooseSexPackage('male')"><span>男性套餐</span></button>
                <button :class="{'focus': packageSexType === 'female'}" @click="chooseSexPackage('female')"><span>女性套餐</span></button>
            </div>
            <img src="/static/img/banner.png" alt="">
            <p class="discount">
                <i>减</i>
                <span>满500减100</span>
                <span>满1000减300</span>
                <span>满2000减1000</span>
            </p>
        </div>
        <div class="wrapper">
            <div class="left_nav">
                <button class="left_nav_item" @click="changeChildrenType(index), changeSelectedIndex(index)" :class="{'focus': selectedIndex === index}" v-for='(item, index) of typeArr' :key='item.name'>
                    <i v-if='item.hot' class="hot">
                        <img src="/static/img/热门-01.png" alt="">
                    </i>
                    {{item.name}}
                    <i class="checkbox" :class="{'non_chooseall':!item.chooseAll}" v-if='item.orderNum != 0'>
                        <img src="/static/img/checkbox.png" alt="" v-if='item.chooseAll'>
                        <span v-if='!item.chooseAll'>{{item.orderNum}}</span>
                    </i>
                </button>
            </div>
            <div class="right_wrapper">
                <div class="right_wrapper_nav">
                    <span class="title">{{childrenType.name}}({{childrenType.typeNum}}项)</span>
                    <i class="discount">选的越多，折扣越高</i>
                    <!-- <span class="money">￥{{childrenType.discountMoney}}</span> -->
                    <i class="checkbox" @click="toggleChooseAll(childrenType.id)">
                        <img src="/static/img/checkbox.png" alt="" v-if="childrenType.chooseAll">
                    </i>
                </div>
                <div class="right_nav_item" v-for='item of childrenType.itemList' :key='item.id'>
                    <p>
                        <span class="title">{{item.name}}</span>
                        <span class="money">￥{{item.money}}</span>
                        <a href="javascript:void(0);" @click="toggleOrder(childrenType.id, item.id)">
                            <img src="/static/img/加号 (1)-02.png" alt="" v-if='item.ordered'>
                            <img src="/static/img/加号 (1)-01.png" alt=""  v-if='!item.ordered'>
                        </a>
                    </p>
                </div>
            </div>
        </div>
        <div class="footer">
            <span class="total_mount">￥{{afterDiscountMoney}}</span>
            <span class="total_num_default" v-if='hasDiscount'>￥{{totalMoney}}</span>
            <span class="total_num">{{typeNumDesc}}</span>
            <button @click="toSettleAcount" :class="{'disabled': !canOrder}">{{btnText}}</button>
        </div>
    </div>
</template>
<style scoped lang='sass'>
    @import './index.scss'
</style>
<script>

    export default {

        components: {

        },
        props: {
        },
        data () {
            return {
                btnText: '满300结算',
                canOrder: false,
                packageSexType: 'male',
                showChooseSexPackageBox: true,
                selectedIndex: 0,
                totalMoney: 0,
                afterDiscountMoney:0 ,
                typeNumDesc: '共0件',
                hasDiscount: false,
                childrenType: {
                    name: '',
                    typeNum: 0,
                    chooseAll: false,
                    itemList: []
                },
                typeArr: []
            }
        },
        created () {
            if (!this.$store.getters.getTypeList.male) {
                this.$store.commit('defaultTypelist', require('./data.json'))
            }
            this.packageSexType = this.$store.getters.getPackageSexType
            this.typeArr = this.packageSexType === 'male'? this.$store.getters.getTypeList.male: this.$store.getters.getTypeList.female

            if (this.$store.getters.getFirstTime) {
                 this.$store.commit('setFirstTime')
            } else {
                this.showChooseSexPackageBox = false
            }

            // 设置右边初始显示第一类
            this.childrenType = {
                id: this.typeArr[0].id,
                name: this.typeArr[0].name,
                typeNum: this.typeArr[0].children?this.typeArr[0].children.length: 0,
                chooseAll: this.typeArr[0].chooseAll,
                discount: this.typeArr[0].discount,
                orderNum: this.typeArr[0].orderNum,
                itemList: this.typeArr[0].children
            }
            this.getEveryTypeDiscount()
            this.getTotalMoney()
            this.getTypeNum()
        },
        mounted () {
          console.log(this.typeArr)
        },
        watch: {
        },
        methods: {
            // 去结算页
            toSettleAcount (){
                if (!this.canOrder) {return}
                this.$store.commit('updateTypelist', {
                    sex: this.packageSexType,
                    typeList: this.typeArr
                })
                this.$router.push({name: 'order'})
            },
            // 选择男性套餐还是女性套餐
            chooseSexPackage(sex) {
                this.$store.commit('updateTypelist', {
                    sex: this.packageSexType,
                    typeList: this.typeArr
                })
                this.$store.commit('updatePackageSexType', sex)
                this.packageSexType = sex
                this.typeArr = this.packageSexType === 'male'? this.$store.getters.getTypeList.male: this.$store.getters.getTypeList.female
                this.changeSelectedIndex(0)
                this.changeChildrenType(0)
                this.getEveryTypeOrderedNum()
                this.isChooseAll()
                this.getEveryTypeDiscount()
                this.getTotalMoney()
                this.getTypeNum()
            },
            // 关闭遮罩
            next() {
                this.showChooseSexPackageBox = false
            },
            // 修改左边导航栏选中index
            changeSelectedIndex(index) {
                this.selectedIndex = index
            },
            // 获取每一大类的总价钱
            getEverytypeTotalMoney (index) {
                let discountMoney = 0
                this.typeArr[index].children.forEach(item => {
                    discountMoney += (item.money*1)
                });
                return discountMoney
            },
            // 获取每一类已经下单的数量
            getEveryTypeOrderedNum () {
                this.typeArr.forEach(function(item){
                    let orderNum = 0
                    item.children.forEach(function(ele){
                        if(ele.ordered){
                            orderNum ++
                        }
                    })
                    item.orderNum = orderNum
                })
            },
            // 根据左边选中的导航栏，右边显示对应的小类
            changeChildrenType (index) {
                let _this = this
                this.childrenType = {
                    id: this.typeArr[index].id,
                    name: this.typeArr[index].name,
                    typeNum: this.typeArr[index].children?this.typeArr[index].children.length: 0,
                    chooseAll: this.typeArr[index].chooseAll,
                    discount: this.typeArr[index].discount,
                    itemList: this.typeArr[index].children
                }
            },
            // 是否一大类全选
            toggleChooseAll (typeId) {
                let _this = this
                this.typeArr.forEach(function(item){
                    if (typeId === item.id) {
                        if (item.chooseAll) {
                            item.children.forEach(function(ele){
                                ele.ordered = false
                            })
                        } else {
                           item.children.forEach(function(ele){
                                ele.ordered = true
                            })
                        }
                    }
                })
                this.getEveryTypeOrderedNum()
                this.isChooseAll()
                this.getEveryTypeDiscount()
                this.getTotalMoney()
                this.getTypeNum()
            },
            // 下单与取消下单
            toggleOrder(typeId, id) {
                this.typeArr.forEach(function(item){
                    if (typeId === item.id) {
                        item.children.forEach(function(ele){
                            if(ele.id === id){
                                ele.ordered = !ele.ordered
                            }
                        })
                    }
                })
                this.getEveryTypeOrderedNum()
                this.isChooseAll()
                this.getEveryTypeDiscount()
                this.getTotalMoney()
                this.getTypeNum()
            },
            // 判断是否全选了一大类
            isChooseAll () {
                let _this = this
                this.typeArr.forEach(function(item){
                    let orderNum = 0
                    item.children.forEach(function(ele){
                        if(ele.ordered === true){
                            orderNum += 1
                        }
                    })
                    item.chooseAll = orderNum === item.children.length? true: false
                })
                _this.childrenType.chooseAll = this.typeArr[this.selectedIndex].chooseAll
            },
            // 获取下单总金额
            getTotalMoney () {

                // 总价钱
                let totalMoney = 0
                this.typeArr.forEach(function(item){
                    item.children.forEach(function(ele){
                        if(ele.ordered === true){
                            totalMoney += (ele.money*1)
                        }
                    })
                })
                this.totalMoney = totalMoney

                // 打折后价钱
                let afterDiscountMoney = 0
                this.typeArr.forEach(function(item){
                    let thisTypetotalMoney = 0
                    item.children.forEach(function(ele){
                        if(ele.ordered === true){
                            thisTypetotalMoney += (ele.money*1)
                        }
                    })
                    afterDiscountMoney += thisTypetotalMoney*item.discount/10
                })
                this.afterDiscountMoney = Math.ceil(afterDiscountMoney*10)/10
                if (this.afterDiscountMoney != 0 && this.afterDiscountMoney < 300) {
                    this.btnText = `差${Math.round((300-this.afterDiscountMoney)*10)/10}元结算`
                    this.canOrder = false
                } else if( this.afterDiscountMoney >= 300 ){
                    this.btnText = `去结算`
                    this.canOrder = true
                } else {
                    this.btnText = `满300结算`
                    this.canOrder = false
                }
            },
            // 获取下单件数
            getTypeNum() {
                let chooseAllNum = 0;
                let chooseTypeNum = 0;
                this.typeArr.forEach(function(item){
                    item.children.forEach(function(ele){
                        if(ele.ordered === true){
                            chooseTypeNum ++
                        }
                    })
                })
                this.typeNumDesc = `共${chooseTypeNum}件`
            },
            // 获取各大类的打折数
            getEveryTypeDiscount() {
                let hasDiscount = 0
                this.typeArr.forEach((item) => {
                    let discount = 10
                    let childrenTypeNum = item.children.length
                    let childenOrderNum = 0
                    item.children.forEach((ele) => {
                        if (ele.ordered) {
                           childenOrderNum ++
                        }
                    })
                    if (childenOrderNum > 0) {
                        discount = Math.floor(10*(10-5*(childenOrderNum-1)/(childrenTypeNum-1)))/10
                        console.log(`${item.name}:${discount}`)
                        hasDiscount = childenOrderNum > 1? hasDiscount + 1: hasDiscount
                    }
                    item.discount = discount
                })
                this.hasDiscount = false
                if (hasDiscount > 0) {
                    this.hasDiscount = true
                }
            }
        }
    }

</script>
