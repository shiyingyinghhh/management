import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import globalComponents from '@/components';
import router from './router';
import store from './store';
import directive from './directive';
import App from './App.vue';
// Styles are imported via arco-plugin. See config/plugin/arcoStyleImport.ts in the directory for details
// 样式通过 arco-plugin 插件导入。详见目录文件 config/plugin/arcoStyleImport.ts
// https://arco.design/docs/designlab/use-theme-package
import '@/assets/style/global.less';
import '@/assets/style/tailwindcss.css';
import 'remixicon/fonts/remixicon.css';


import _ from 'lodash'

import setting, { req } from '@/setting';

const app = createApp(App);

app
  .use(ArcoVue, {})
  .use(ArcoVueIcon)
  .use(router)
  .use(store)
  .use(globalComponents)
  .use(directive);

app.provide('req', req);
app.provide('setting', setting);
app.provide('_', _);

app.mount('#app');
