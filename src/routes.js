import Vue from 'vue';
import VueRouter from 'vue-router';

// Components
import queue from './components/queue.vue';
import search from './components/search.vue';

Vue.use(VueRouter);

const router = new VueRouter();

// Redirects
router.redirect({
  '/': '/queue'
});


// Map routes
router.map({
  '*': {
    component: {
      template: '<h1>Route not found</h1>'
    }
  },
  '/queue': {name: 'queue', component: queue},
  '/search': {name: 'search', component: search},
});

export default router;
