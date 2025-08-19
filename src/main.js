import { createApp } from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import router from './router';
import App from './App.vue';
 // Import component
import Loading from 'vue3-loading-overlay';
    // Import stylesheet
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
import { currency, date } from './methods/filters';
import $httpMessageState from './methods/pushMessageState';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {
  Form, Field, ErrorMessage, defineRule, configure,
} from 'vee-validate';
import * as AllRules from '@vee-validate/rules';
import { localize, setLocale } from '@vee-validate/i18n';
import zhTW from '@vee-validate/i18n/dist/locale/zh_TW.json';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app=createApp(App);
app.config.globalProperties.$filters={
  currency,date
};
Object.keys(AllRules).forEach((rule) => {
  if (typeof AllRules[rule] === 'function') {
    defineRule(rule, AllRules[rule]);
  }
});

configure({
  generateMessage: localize({ zh_TW: zhTW }), // 載入繁體中文語系
  validateOnInput: true, // 當輸入任何內容直接進行驗證
});
// 設定預設語系
setLocale('zh_TW');
app.config.globalProperties.$httpMessageState = $httpMessageState;

app.use(router);
app.use(VueAxios, axios);
app.component('Loading',Loading);
app.component('Form', Form);
app.component('Field', Field);
app.component('ErrorMessage', ErrorMessage);
app.mount('#app');
