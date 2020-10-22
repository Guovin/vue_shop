import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 引入全局样式表
import './assets/css/global.css'
// 引入字体图标样式
import './assets/fonts/iconfont.css'
// 引入第三方树形表格依赖
import TableTree from 'vue-table-with-tree-grid'

import axios from 'axios'

// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 进度条
// 导入nprogress的js
import NProgress from 'nprogress'

Vue.use(VueQuillEditor)

// 绑定axios默认访问地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// axios请求头拦截器
// 发起request请求时展示进度条 Nprogress.start()
axios.interceptors.request.use(config => {
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config // 在最后必须return config
})

// 接收到response时隐藏进度条 Nprogress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

// 时间过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 将axios挂载到http原型对象上使用
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('table-tree', TableTree)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')