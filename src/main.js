import Vue from 'vue';
import app from './app.vue';
import router from './routes';

// Styles
import './styles/main.scss';

Vue.config.debug = process.env.NODE_ENV !== 'production';

const App = Vue.extend(app);

router.start(App, 'body');
