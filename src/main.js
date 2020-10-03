import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式表
import './assets/css/global.css'
// 引入字体图标样式
import './assets/fonts/iconfont.css'

import axios from 'axios'

// 将axios挂载到http原型对象上使用
Vue.prototype.$http = axios
// 绑定axios默认访问地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
