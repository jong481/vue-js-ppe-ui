import Vue from "vue";
import VueRouter from "vue-router";
import Auth from "../views/Auth.vue";
import AuthSSO from "../views/AuthSSO.vue";
import Detections from "../views/Detections.vue";
import About from "../views/About.vue"
import Public from "../Public.vue"
import { Hub  } from "aws-amplify";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "AuthSSO",
    component: AuthSSO,
    props: true,
    meta: { 
      plainLayout: true
    }
  },
  {
    path: "/detections",
    name: "Detections",
    component: Detections,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/about",
    name: "About",
    component: About,
    meta: {
      requiresAuth: true
    }
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    try {
      Hub.listen("auth", ({ payload: { event, data } }) => {
        switch (event) {
          case "signIn":
            this.setState({ authState: 'signedIn'});
            this.getuserinfo();
            break;
          case "signOut":
            this.setState({ authState: 'signIn'});
            this.setState({ user: null });
            break;
        }
      });
      await Vue.prototype.$Amplify.Auth.currentAuthenticatedUser();
      next();
    } catch (e) {
      next({
        path: "/",
        query: {
          redirect: to.fullPath
        }
      });
    }
  }
  next();
});

export default router;