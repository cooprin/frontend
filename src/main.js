import { createApp } from 'vue';
import { Quasar } from 'quasar';
import App from './App.vue';
import router from './router';
import quasarLang from 'quasar/lang/en-US';

import 'quasar/dist/quasar.css';

const app = createApp(App);

app.use(Quasar, {
  lang: quasarLang,
});

app.use(router);

app.mount('#app');
