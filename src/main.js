import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式表
import './assets/css/global.css'
// 引入字体图标样式
import './assets/fonts/iconfont.css'
// 引入第三方树形表格依赖
import TableTree from 'vue-table-with-tree-grid'

import axios from 'axios'

// 绑定axios默认访问地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// axios请求头拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config // 在最后必须return config
})

// 将axios挂载到http原型对象上使用
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('table-tree', TableTree)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
