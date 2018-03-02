import Vue from 'vue'
import Router from 'vue-router'
import index from '@/views/index/index'
import order from '@/views/order/order'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/order',
      name: 'order',
      component: order
    }
  ]
})
