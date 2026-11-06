import { createRouter, createWebHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

import Article from "../views/Home.vue";
import Show from "../views/Show.vue";
import CreateArticle from "../views/CreateArticle.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: "/",
      redirect: "/articles",
    },
    {
      path: "/articles",
      name: "articles",
      component: Article,
    },
    {
      path: "/articles/create",
      name: "CreateArticle",
      component: CreateArticle,
    },
    {
      path: "/articles/:slug/edit",
      name: "EditArticle",
      component: () => import("../views/EditArticle.vue"),
    },
    {
      path: "/articles/:slug",
      name: "articles.show",
      component: Show,
    },
    {
      path: "/register",
      name: "Register",
      component: Register,
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
  ],
});

// Configuration NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
});

// Début de navigation
router.beforeEach(() => {
  NProgress.start();
});

// Fin de navigation
router.afterEach(() => {
  NProgress.done();
});

// Erreur de navigation
router.onError(() => {
  NProgress.done();
});

export default router;
