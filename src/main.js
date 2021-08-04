import Vue from 'vue'
import App from './App.vue'
import store from './store'
import axios from 'axios'
import moment from 'moment'
import VueBus from 'vue-bus'

Vue.config.productionTip = false
Vue.prototype.$axios = axios.create()
moment.locale("pl")
Vue.prototype.$moment = moment
Vue.use(VueBus)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
