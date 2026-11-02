import { createRouter, createWebHistory } from "vue-router";
import Article from "../views/Home.vue";
import Show from "../views/Show.vue"; // adapte selon ton arborescence
import CreateArticle from "../views/CreateArticle.vue";
import EditArticle from "../views/EditArticle.vue"; // adapte selon ton arborescence
import Register from "../views/Register.vue"
import Login from "../views/Login.vue"
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
      path: "/articles/:slug",
      name: "articles.show",
      component: Show, // adapte selon ton arborescence
    },
    {
      path: "/articles/create",
      name: "CreateArticle",
      component: CreateArticle,
    },
    {
    path: '/articles/:slug/edit',
    name: 'EditArticle',
    component: () => import('../views/EditArticle.vue'),
}
,
{
  path:'/register',
  name:'Register',
  component:Register
},
{
  path:'/login',
  name:'Login',
  component:Login
}
  ],
});

export default router;
