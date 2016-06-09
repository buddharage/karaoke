import Vue from 'vue';
import app from './app.vue';

import router from './routes';

// Styles
import './styles/main.scss';

import offlinePlugin from 'offline-plugin/runtime';

console.log(offlinePlugin);

// Service worker
offlinePlugin.install();

Vue.config.debug = process.env.NODE_ENV !== 'production';

const App = Vue.extend(app);

router.start(App, 'body');
