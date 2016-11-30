import Vue from 'vue';
import VueRouter from 'vue-router';

// Components
import queue from './components/queue.vue';
import search from './components/search.vue';
import player from './components/player.vue';

Vue.use(VueRouter);

// Map routes
const routes = [
  {
    path: '/',
    redirect: {
      name: 'queue'
    }
  },
  {
    path: '/queue',
    name: 'queue',
    component: queue
  },
  {
    path: '/search',
    name: 'search',
    component: search
  },
  {
    path: '/player',
    name: 'player',
    component: player
  },
];

const router = new VueRouter({
  routes,
  history: Vue.config.debug,
  saveScrollPosition: true
});

export default router;
