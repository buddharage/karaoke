import Vue from 'vue';
import VueRouter from 'vue-router'

Vue.use(VueRouter);

const router = new VueRouter()

// Redirects
router.redirect({});


// Map routes
router.map({
  '*': {
    component: {
      template: '<h1>Route not found</h1>'
    }
  },
  '/thai': {
    component: {
      template: '<h1>Thai</h1>'
    }
  }
});

export default router;
