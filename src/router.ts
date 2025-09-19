import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "./pages/home/index.vue";
import Recruit from "./pages/recruit/index.vue";
import Overview from "./pages/recruit/overview.vue";
import FirstReview from "./pages/recruit/firstReview.vue";
import FormalSubmit from "./pages/recruit/formalSubmit.vue";
import User from "./pages/user/index.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/home" },
  { name: "home", path: "/home", component: Home },
  { name: "recruit", path: "/recruit/", component: Recruit },
  {
    name: "project-overview",
    path: "/recruit/:id/overview",
    component: Overview,
    alias: "/recruit/:id",
  },
  {
    name: "first-review",
    path: "/recruit/:id/first-review",
    component: FirstReview,
  },
  {
    name: "formal-submit",
    path: "/recruit/:id/formal-submit",
    component: FormalSubmit,
  },
  { name: "user", path: "/user/", component: User },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
