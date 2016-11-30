import Vue from 'vue';
import app from './app.vue';
import offlinePlugin from 'offline-plugin/runtime';

// Styles
import './styles/main.scss';

// Service worker
offlinePlugin.install();

Vue.config.debug = process.env.NODE_ENV !== 'production';

const App = new Vue(app).$mount('app');
