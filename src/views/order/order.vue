<template>
  <div class="wrap" ref="wrap">
    <div class="set">
      <div class="set-title">自选套餐</div>
      <div class="set-main-info"  v-for="(obj,index) in goodsList" v-if="index<classNum">
        <div class="set-name">
          {{obj.name}}
          <span>共{{obj.orderNum}}项</span>
          <b v-if="obj.discount!==10">{{obj.discount}}折</b>
          <p class="fr">
            <u v-if="obj.discount!==10">￥{{filterGoodsList(obj)}}</u>
            <span ref="obj.name">￥{{Math.ceil((filterGoodsList(obj)*obj.discount/10)*10)/10}}</span>
          </p>
        </div>
        <div class="set-list" v-for="(items,index) in obj.children.filter(item => item.ordered === true)" v-show="index<obj.isMore">
          <div>{{items.name}}<span>￥{{items.money}}</span></div>
        </div>
        <div :class="obj.isMore===3?'more':'nomore'" v-if="obj.orderNum>3" @click="ismore(obj)"></div>
      </div>
      <div class="moreClass" @click="isMoreClass" v-html="totalClass===classNum?'点击收起':'查看更多'" v-if="totalClass>2"></div>
      <div class="set-reduction">
        <i>减</i>
        满减优惠
        <span>-￥{{afterDiscountMoney>=500&&afterDiscountMoney<1000?100:afterDiscountMoney>=1000&&afterDiscountMoney<2000?300:afterDiscountMoney>=2000?1000:0}}</span>
      </div>
      <div class="set-all">
        共计{{totalItem}}件 小计
        <span>￥{{trueMoney}}</span>
      </div>
    </div>
    <div class="line"></div>
    <div class="user-info" v-for="(obj,index) in objLength">
      <div class="user-num">
        <span class="s1">受检人{{index+1}}</span>
        <span class="s2" @click="bindUserInfo(index)" :class="userObj[index].uname===undefined?'ce0e0e0':'c000'">{{userObj[index].uname===undefined?'请填写受检人信息':userObj[index].uname+' '+userObj[index].phone}}</span>
        <span class="s3" v-if="index!==0" @click="deleteUser(index)">一</span>
      </div>
    </div>
    <div class="add-user">
      <div class="add" @click="addUser(userObj.length)">+ 添加受检人</div>
      <div class="add-readMe">每添加一位受检人相当于多买一份套餐</div>
    </div>
    <div class="message-box" v-show="isShadowBlock">
      <div class="shadow"></div>
      <div class="message-content">
        <div class="m-user"><i></i>受检者</div>
        <input type="text" placeholder="请输入受检者姓名" id="uname" name="uname" class="info-list-one" v-model="obj.uname">
        <div class="line"></div>
        <input type="text" placeholder="请输入受检者手机号" id="phone" name="phone" class="info-list-one" v-model="obj.phone" :class="!/^1[34578]\d{9}$/.test(obj.phone)?'cf00':''">
        <div class="line"></div>
        <input type="text" placeholder="请输入受检者年龄" id="age" name="age" class="info-list-one" v-model="obj.age">
        <div class="line"></div>
        <span id="sex" name="sex">{{gender}}</span>
        <select id="relations" name="relations" v-model="relations">
          <option value="" selected>与本人关系</option>
          <option v-for="option of options" :value="option.key">{{option.value}}</option>
        </select>
        <input type="checkbox" id="address" name="address" v-model="obj.isAddress"><label for="address">是否作为收货人</label>
        <div class="sure" @click="closeShadow(clickIndex)">确认</div>
        <div class="closeShadow" @click="onlyClose"></div>
        <div class="alertShadow" v-show="isAlert">{{alertShadow}}</div>
      </div>
    </div >
    <div class="line"></div>
    <div class="receipt">
      <div class="receipt-info">
        <i></i>
        收货信息
      </div>
      <div class="receipt-user list">
        <p>收货人</p>
        <input type="text" placeholder="请输入收货人姓名" v-model="addressObj.uname">
      </div>
      <div class="receipt-phone list">
        <p>手机号</p>
        <input type="text" placeholder="请输入手机号" v-model="addressObj.phone" :class="!/^1[34578]\d{9}$/.test(addressObj.phone)?'cf00':''">
      </div>
      <div class="receipt-code list">
        <p>验证码</p>
        <input type="text" placeholder="请输入验证码" class="short">
        <button @click="getCode">{{getCodeBtnText}}</button>
      </div>
      <div class="receipt-add list">
        <x-address title="所在地区"  class="weui-vcode" v-model="region" raw-value :list="addressData"></x-address>
      </div>
      <div class="receipt-more-add list">
        <p>详细地址</p>
        <input type="text" placeholder="请输入详细地址" v-model="detailedAddress">
      </div>
      <div class="under-img"></div>
    </div>
    <div class="line"></div>
    <group>
        <cell title="支付方式" style="border-bottom: 1px solid #eee">
            <img slot="icon" src="/static/img/pay-way.png" width="26" style="margin-right: 10px;">
        </cell>
        <radio title="title" :options="pay" v-model="payWay"></radio>
    </group>
    <div class="line"></div>
    <div class="total">
      合计 <span>￥{{Math.ceil(trueMoney*userObj.length*10)/10}}</span>
      <button @click="SubmitOrder">提交订单</button>
    </div>
  </div>

</template>

<script>
  import myaddress from './lists.json'
  import {MessageBox,Toast} from 'mint-ui'
  import { Group, Cell, Radio, ChinaAddressV4Data, XAddress } from 'vux'



  export default {
    components: {
      MessageBox,
      Group,
      Cell,
      ChinaAddressV4Data,
      XAddress,
      Radio,
      Toast
    },
    data() {
      return {
        region: [],
        addressData: ChinaAddressV4Data,
        options: [
            {
              key:  'self',
              value: '本人'
            },
          {
            key:  'parents',
            value: '父母'
          },
          {
            key:  'children',
            value: '子女'
          },
          {
            key:  'partner',
            value: '配偶'
          },
          {
            key:  'others',
            value: '其他'
          }
        ],
        pay:[
          {
            icon: '/static/img/wechat-pay.png',
            key: 'weChatPay',
            value: '微信支付'
          },
          {
            icon: '/static/img/alipay.jpg',
            key: 'alipay',
            value: '支付宝'
          }
        ],
        getCodeBtnText:'获取验证码',
        payWay:'weChatPay',//支付方式，默认微信
        alertShadow:'',//警告文字
        isAlert:false,//提示警告框
        objLength:-1,//存储受检人数组长度
        gender:'',//性别
        totalMoney:0,//购买套餐总价
        allMoney:0,//支付总价
        afterDiscountMoney:0,//折后总价
        trueMoney:0,//折后满减后实际套餐价
        totalClass:0,//总共选择的大类数
        totalItem:0,//总共选择的小类数
        classNum:2,//默认展示两大类
        goodsList:[],//选购商品数据
        isShadowBlock:false,//遮罩层
        clickIndex:-1,//点击第几个受检人
        relations:"",//与我的关系
        obj:{uname:'',phone:'',age:'',gender:'',relations:'',isAddress:false},//存储用户信息的临时对象
        userObj:[{}],//存储用户信息的数组对象
        addressObj:{},//收获地址对象
        isAddressShadow:false,
        detailedAddress:'',
        sTop:0
      }
    },
    created() {
      if(this.$store.getters.getPackageSexType==='male'){
        this.gender='男';
        for(let i=0;i<this.$store.getters.getTypeList.male.length;i++){
          if(this.$store.getters.getTypeList.male[i].orderNum!==0){
            this.goodsList.push(this.$store.getters.getTypeList.male[i])
          }
        }
      }else{
        this.gender='女';
        for(let i=0;i<this.$store.getters.getTypeList.female.length;i++){
          if(this.$store.getters.getTypeList.female[i].orderNum!==0){
            this.goodsList.push(this.$store.getters.getTypeList.female[i])
          }
        }
      }
      this.getTotalMoney();
      this.objLength = this.userObj.length
    },
    computed:{


    },
    mounted() {
      let self = this;
      window.onscroll=function(){
        // self.sTop = document.body.scrollTop
          //在vue中操作dom尽量用ref, 但它不是响应式的
          self.sTop = self.getScrollTop()

      }

    },
    watch: {},
    methods: {
      //
      getScrollTop(){
        var scrollTop=0;
        if(document.documentElement&&document.documentElement.scrollTop)
        {
          scrollTop=document.documentElement.scrollTop;
        }
        else if(document.body)
        {
          scrollTop=document.body.scrollTop;
        }
        return scrollTop;
      },
      //手机号正则匹配

      //所有选项填完，确认提交订单
      SubmitOrder(){
        let l = 0; //初始长度为0，遍历数组，如果存在未填的受检人，长度加一
        this.userObj.forEach(item=>{
          if (!item.uname){
            l++;
          }
        });
        if(l>0){ //长度大于0说明有未填的受检人
          Toast({
            message: '请填写受检人！',
            position: 'middle',
            duration:1000
          });
          return false
        }
        if (!this.addressObj.uname){
          console.log(this.addressObj.uname)
          Toast({
            message: '请填写收货人！',
            position: 'middle',
            duration:1000
          });
          return false
        }
        if (!this.addressObj.phone){
          Toast({
            message: '请填写收货电话！',
            position: 'middle',
            duration:1000
          });
          return false
        }
        if (!/^1[34578]\d{9}$/.test(this.addressObj.phone)){
          Toast({
            message: '请填写正确手机号！',
            position: 'middle',
            duration:1000
          });
          return false
        }
        if (this.myAddressAll === '请选择'){
          Toast({
            message: '请填写收货地址！',
            position: 'middle',
            duration:1000
          });
          return false
        }
        if (!this.detailedAddress){
          console.log(this.detailedAddress)
          Toast({
            message: '请填写详细收货地址！',
            position: 'middle',
            duration:1000
          });
          return false
        }
      },
      //点击发送验证码
      getCode () {
        if(!this.addressObj.phone){
          MessageBox.alert('请输入手机号码').then(action => {

          });
          return false;
        };
        if (!/^1[34578]\d{9}$/.test(this.addressObj.phone)){
          Toast({
            message: '请填写正确手机号！',
            position: 'middle',
            duration:1000
          });
          return false
        }
        let count = 60
        if (this.getCodeBtnText !== '获取验证码') {
          return
        }
        Toast({
          message: '验证码已发送！',
          position: 'middle'
        })
        this.getCodeBtnText = '验证码(' + count + ')s'
        let timer = setInterval(() => {
          count--
          if (count === 0) {
            this.getCodeBtnText = '获取验证码'
            clearInterval(timer)
          } else {
            this.getCodeBtnText = '验证码(' + count + ')s'
          }
        }, 1000)
      },
      //删除受检人
      deleteUser(index){
        let self = this;

        if(this.userObj[index].isAddress === true){
          this.addressObj={};
        };
        this.userObj.splice(index,1);
        this.objLength = this.userObj.length
      },

      //地址遮罩层显示
      showAddress(){
        console.log(this.sTop);
        this.isAddressShadow = true
        document.body.style='position:fixed,top:this.sTop'
      },
      //地址遮罩层隐藏
      hideAddress(){
        this.isAddressShadow = false
        document.body.style='position:relative'
      },
      //完成地址选择
      addressOver(){
        this.isAddressShadow = false
        this.myAddressAll = this.myAddressProvince+this.myAddressCity+this.myAddresscounty
        document.body.style='position:relative'
      },
      //添加一个受检人
      addUser(index){
        this.userObj[index] = {};
        this.objLength = this.userObj.length
      },
      //打开遮罩层，把当前受检人的下标赋值给变量
      bindUserInfo(index){
        document.body.style = 'position:fixed;width:100%';
        if(this.userObj[index].uname){
          this.obj.uname = this.userObj[index].uname;
          this.obj.phone = this.userObj[index].phone ;
          this.obj.age = this.userObj[index].age;
          this.gender = this.userObj[index].gender;
          this.relations = this.userObj[index].relations;
          this.obj.isAddress = this.userObj[index].isAddress;
        }else{
          this.obj.uname = '';
          this.obj.phone = '' ;
          this.obj.age = '';
          this.relations = '';
          this.obj.isAddress = false;
        }
        this.isShadowBlock = true;
        this.clickIndex = index;
        this.obj.relations = '与本人的关系'

      },
      //关闭遮罩层，不存储信息
      onlyClose(){
        this.isShadowBlock = false;
        document.body.style = 'position:relative'
      },
      //关闭遮罩层，并把存储用户信息的临时对象中的信息都赋值给存储信息的数组对象，并最终清空临时数组
      closeShadow(clickIndex){

        if(this.obj.uname && this.obj.phone && this.obj.age && this.relations){
          this.isShadowBlock = false;
          this.userObj[clickIndex].uname = this.obj.uname;
          this.userObj[clickIndex].phone = this.obj.phone;
          this.userObj[clickIndex].age = this.obj.age;
          this.userObj[clickIndex].gender = this.gender;
          this.userObj[clickIndex].relations = this.relations;
          this.userObj[clickIndex].isAddress = this.obj.isAddress;

          let self = this;
          if(this.userObj[clickIndex].isAddress === true){
            this.userObj.forEach(function (items) {
              items.isAddress=false;
              // if (items.isAddress === true){
              //   items.isAddress=false;
              //   self.userObj[clickIndex].isAddress;
              // }else {
              //   self.userObj[clickIndex].isAddress
              // }
            });
            this.userObj[clickIndex].isAddress = true
            this.addressObj.uname = this.userObj[clickIndex].uname;
            this.addressObj.phone = this.userObj[clickIndex].phone;
          }
        }

        if(this.obj.uname === ''){
          this.isAlert = true;
          this.alertShadow = '请输入受检人';
          let self = this;
          setTimeout(function () {
            self.alertShadow = '';
            self.isAlert = false
          },2000)
          //this.relations = '';
          //this.obj = {uname:'',phone:'',age:'',gender:'',relations:'',isAddress:''};

          return false
        }
        if(this.obj.phone === ''){
          this.isAlert = true;
          this.alertShadow = '请输入手机号';
          let self = this;
          setTimeout(function () {
            self.alertShadow = '';
            self.isAlert = false
          },2000)
          //this.relations = '';
          //this.obj = {uname:'',phone:'',age:'',gender:'',relations:'',isAddress:''};
          return false
        }
        if (!/^1[34578]\d{9}$/.test(this.obj.phone)){
          Toast({
            message: '请填写正确手机号！',
            position: 'middle',
            duration:1000
          });
          return false
        }
        if(this.obj.age === ''){
          this.isAlert = true;
          this.alertShadow = '请输入年龄';
          let self = this;
          setTimeout(function () {
            self.alertShadow = '';
            self.isAlert = false
          },2000)
          //this.relations = '';
          //this.obj = {uname:'',phone:'',age:'',gender:'',relations:'',isAddress:''};
          return false
        }
        if(this.relations === ''){
          this.isAlert = true;
          this.alertShadow = '请选择与我的关系';
          let self = this;
          setTimeout(function () {
            self.alertShadow = '';
            self.isAlert = false
          },2000)
          //this.relations = '';
          //this.obj = {uname:'',phone:'',age:'',gender:'',relations:'',isAddress:''};
          return false
        }

        this.obj.uname = '';
        this.obj.phone = '';
        this.obj.age = '';
        this.obj.gender = '';
        this.obj.relations = '';
        this.obj.isAddress = false;
        this.relations = ''
        document.body.style = 'position:relative'
      },
      //判断小项是否超过3个
      isMoreClass(){
        this.totalClass===this.classNum?this.classNum=2:this.classNum=this.totalClass
      },
      ismore(obj){
        obj.isMore===obj.orderNum?obj.isMore=3:obj.isMore=obj.orderNum
      },
      //筛选已选中的商品列表
      filterGoodsList(obj){
        let sum=0;
        for(let j=0;j<obj.children.filter(item => item.ordered==true).length;j++){
          sum+=obj.children.filter(item => item.ordered==true)[j].money
        }
        return sum;
      },
      //获取价钱，大类数，小项总和
      getTotalMoney () {
        // 总价钱
        let totalMoney = 0
        let totalItem = 0
        let totalClass = 0
        this.goodsList.forEach(function(item){
          if(item.orderNum!==0){
            totalClass++
          }
          item.children.forEach(function(ele){
            if(ele.ordered === true){
              totalMoney += (ele.money*1)
              totalItem +=1
            }
          })
        })
        this.totalMoney = totalMoney;
        this.totalItem = totalItem;
        this.totalClass = totalClass;

        // 打折后价钱
        let afterDiscountMoney = 0
        this.goodsList.forEach(function(item){
          let thisTypetotalMoney = 0
          item.children.forEach(function(ele){
            if(ele.ordered === true){
              thisTypetotalMoney += (ele.money*1)
            }
          })
          afterDiscountMoney += thisTypetotalMoney*item.discount/10
        })

        this.afterDiscountMoney = Math.ceil(afterDiscountMoney*10)/10
        this.trueMoney = (this.afterDiscountMoney>=500&&this.afterDiscountMoney<1000?this.afterDiscountMoney-100:
                            this.afterDiscountMoney>=1000&&this.afterDiscountMoney<2000?this.afterDiscountMoney-300:
                              this.afterDiscountMoney>=2000?this.afterDiscountMoney-1000:this.afterDiscountMoney)
      },


    }
  }

</script>

<style scoped lang="sass">
  .wrap
    width: 100%
    max-width: 750px
    background: #eee
    padding-bottom: 0.88rem
    overflow: hidden
    .line
      width: 100%
      height: 0.16rem
      background: #eee
    .addressShadow
      width: 100%
      height: 100%
      background: rgba(0,0,0,0.7)
      position: fixed
      bottom: 0
      .picker
        position: fixed
        width: 100%
        bottom: 0
        background: #eeeeee
        .picker-toolbar
          height: 0.8rem
          line-height: 0.8rem
          background: #707070
          .cancel
            color: #55a2f7
            height: 0.8rem
            line-height: 0.8rem
            margin-left: 0.2rem
            font-size: 0.32rem
          .complete
            color: #55a2f7
            height: 0.8rem
            line-height: 0.8rem
            margin-right: 0.2rem
            font-size: 0.32rem
    .set
      background: #ffffff
      .set-title
        padding-left: 1.0rem
        color: #707070
        height: 1rem
        line-height: 1rem
        font-size: 0.32rem
        background: url("../../../static/img/微信图片_20171207102002.png") no-repeat
        -webkit-background-size: 6%
        background-size: 6%
        background-position: 0.41rem 0.25rem
        border-bottom: 1px solid #eee
      .set-main-info
        overflow: hidden
        .set-name
          padding-left: 1rem
          font-size: 0.3rem
          height: 0.9rem
          line-height: 0.9rem
          span
            font-size: 0.26rem
            color: #707070
            margin-left: 0.26rem
          b
            font-size: 0.2rem
            color: #E61E1E
            margin-left: 0.16rem
            font-weight: normal
        .set-list
          div
            padding-left: 1.32rem
            font-size: 0.3rem
            color: #707070
            line-height: 0.64rem
            span
              float: right
              margin-right: 0.66rem
              color: #242624
              font-size: 0.28rem
        .more
          width: 100%
          height: 0.4rem
          background: url("/static/img/down.png") no-repeat
          background-position: center center
          background-size: 5%
        .nomore
          width: 100%
          height: 0.4rem
          background: url("/static/img/up.png") no-repeat
          background-position: center center
          background-size: 5%
        p.fr
          float: right
          margin-right: 0.66rem
          u
            text-decoration: line-through
          span
            color: #E61E1E
            font-weight: bold
            font-size: 0.3rem

      .moreClass
        text-align: center
        border-top: 1px solid #eee
        width: 100%
        height: 0.56rem
        font-size: 0.28rem
        line-height: 0.56rem
        color: #a6a6a6
      .set-reduction
        padding-left: 0.5rem
        height: 1rem
        line-height: 1rem
        border-bottom: 1px solid #eee
        i
          width: 0.42rem
          height: 0.32rem
          margin-top: 0.34rem
          margin-right: 0.18rem
          float: left
          font-size: 0.2rem
          font-style: normal
          text-align: center
          color: #ffffff
          line-height: 0.32rem
          background: #fa2549
        span
          float: right
          color: #e51c23
          margin-right: 0.56rem
      .set-all
        height: 1.1rem
        text-align: right
        line-height: 1.1rem
        font-size: 0.28rem
        color: #a6a6a6
        span
          float: right
          color: #e61e1e
          font-weight: bold
          font-size: 0.32rem
          margin-left: .44rem
          margin-right: 0.56rem
    .user-info
      width: 100%
      background: #ffffff
      height: 0.9rem
      line-height: 0.9rem
      padding-left: 0.42rem
      font-size: 0.28rem
      max-width: 750px
      .user-num
        span.s1
          font-size: 0.3rem
        span.s2
          margin-left: 0.64rem
          font-size: 0.28rem
          display: inline-block
          min-width: 4rem
        span.c000
          color: #000
        span.ce0e0e0
          color: #e0e0e0
        span.s3
          float: right
          margin-right: 0.42rem
          color: #999
          font-size: 0.32rem
    .add-user
      margin-top: 0.06rem
      .add
        background: #ffffff
        width: 100%
        height: 0.8rem
        line-height: 0.8rem
        text-align: center
        font-size: 0.3rem
      .add-readMe
        width: 100%
        height: 0.46rem
        line-height: 0.46rem
        background: #F7F7F7
        color: #bfbfbf
        font-size: 0.24rem
        text-align: center
    .message-box
      position: fixed
      top: 0
      width: 100%
      height: 100%
      z-index: 11
      .shadow
        width: 100%
        height: 100%
        background: #000
        opacity: 0.7
      .message-content
        position: absolute
        top: 20%
        left: 0.75rem
        width: 6rem
        background: #fff
        padding: 0 0.5rem
        .line
          width: 100%
          height: 1px
          margin-top: 0.22rem
          border-bottom: 1px solid #d6d6d6
        label
          height: 0.8rem
          line-height: 0.8rem
          margin-left: 0.22rem
        .m-user
          height: 0.8rem
          line-height: 1rem
          font-size: 0.3rem
          i
            width: 0.4rem
            height: 0.4rem
            float: left
            margin-top: 0.3rem
            margin-right: 0.1rem
            background: url("/static/img/身份证.png") no-repeat
            background-size: cover
        .info-list-one
          height: 0.46rem
          width: 5rem
          padding: 0.22rem 0 0 0
          color: #333
          font-size: 0.26rem
          box-sizing: content-box
          border: none
          outline: none
        .cf00
          color: #f00
        #sex
          display: inline-block
          width: 2.2rem
          height: 0.54rem
          line-height: 0.54rem
          border-radius: 5px
          color: #333
          font-size: 0.28rem
          outline: none
          margin: 0.32rem 0.3rem 0.02rem 0
          border: 1px solid #d6d6d6
          padding-left: 0.96rem
        #relations
          width: 2.2rem
          height: 0.54rem
          border-radius: 5px
          color: #333
          font-size: 0.28rem
          outline: none
          float: right
          border: 1px solid #d6d6d6
          margin: 0.32rem 0 0.02rem 0
        #address
          position: relative
          top: 0.03rem
        .sure
          width: 6rem
          margin-left: -0.5rem
          margin-top: 0.1rem
          height: 0.9rem
          line-height: 0.9rem
          text-align: center
          background: #2488ed
          color: #ffffff
        .closeShadow
          position: absolute
          top: 0.15rem
          right: 0.15rem
          width: 0.56rem
          height: 0.56rem
          background: url("/static/img/close.png") no-repeat
          background-size: cover
        .alertShadow
          width: 3rem
          height: 3rem
          background: rgba(0,0,0,0.7)
          color: #ffffff
          position: absolute
          top: 0
          left: 0
          bottom: 0
          right: 0
          margin: auto auto
          line-height: 3rem
          text-align: center
    .receipt
      background: #ffffff
      .receipt-info
        padding-left: 1.1rem
        height: 0.9rem
        color: #707070
        line-height: 0.9rem
        font-size: 0.32rem
        background: url("../../../static/img/微信图片_20171207101949.png") no-repeat
        background-size: 6.8%
        background-position: 0.41rem 0.18rem
        border-bottom: 1px solid #eee
      .receipt-phone
        .cf00
          color: #f00
      .receipt-add
        span
          color: #D8D8D8
          display: inline-block
          width: 4.26rem
        .cd8d8d8
          color: #D8D8D8
        .c000
          color: #000
      .list
        border-bottom: 1px solid #eee
        line-height: 0.8rem
        height: 0.8rem
        p
          width: 1.32rem
          height: 0.8rem
          line-height: 0.8rem
          margin-left: 0.41rem
          margin-right: 0.12rem
          font-size: 0.3rem
          float: left
        input
          width: 4.26rem
          height: 0.7rem
          float: left
          font-size: 0.28rem
          margin-top: 0.05rem
          border: none
          outline: none
        .short
          width: 2.26rem
        button
          width: 2.5rem
          outline: none
          border-radius: 5px
          background: #ffffff
          color: #2488ed
          float: right
          margin-right: 0.2rem
          margin-top: 0.06rem
          border: 1px solid #2488ed
          height: 0.6rem
      .receipt-more-add
        border-bottom: 0 solid #ffffff
      .under-img
        width: 100%
        height: 0.14rem
        background: url("../../../static/img/下单页信封条.png") no-repeat
        background-size: cover
        margin-top: 0.4rem
        max-width: 750px
    .pay
      background: #ffffff
      width: 100%
      .pay-style
        padding-left: 0.42rem
        line-height: 0.86rem
        font-size: 0.32rem
        color: #000
        width: 100%
        height: 0.86rem
        border-bottom: 1px solid #eee
        u
          float: right
          width: 0.35rem
          height: 0.35rem
          margin-top: 0.26rem
          margin-right: 0.42rem
          background: url("/static/img/Oval.png") no-repeat
          background-size: 100%
      .pay-way
        color: #707070
        i
          float: left
          background: url("../../../static/img/pay-way.png") no-repeat
          background-size: cover
          margin-top: 0.2rem
          margin-right: 0.24rem
          height: 0.45rem
          width: 0.45rem
      .wechat-pay
        i
          float: left
          background: url("../../../static/img/wechat-pay.png") no-repeat
          background-size: cover
          margin-top: 0.12rem
          margin-right: 0.24rem
          height: 0.6rem
          width: 0.6rem
      .ali-pay
        i
          float: left
          background: url("../../../static/img/alipay.jpg") no-repeat
          background-size: cover
          margin-top: 0.12rem
          margin-right: 0.24rem
          height: 0.6rem
          width: 0.6rem
      .choseWechat
        u
          background: url("/static/img/Group.png") no-repeat
          background-size: 100%
      .choseAli
        u
          background: url("/static/img/Group.png") no-repeat
          background-size: 100%
    .mint-radiolist
      background: #ffffff
      width: 100%
    .total
      width: 100%
      position: fixed
      bottom: 0
      left: 0
      padding-left: 0.44rem
      line-height: 0.88rem
      height: 0.88rem
      background: #ffffff
      span
        color: #e51c23
        font-size: 0.32rem
      button
        width: 2.9rem
        float: right
        border: none
        font-size: 0.28rem
        height: 0.88rem
        background: #e51c23
        color: #ffffff


</style>
