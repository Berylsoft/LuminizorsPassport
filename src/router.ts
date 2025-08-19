import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "./pages/home/index.vue";
import Overview from "./pages/recruit/overview.vue";
import Recruit from "./pages/recruit/index.vue";
import User from "./pages/user/index.vue";

const routes: RouteRecordRaw[] = [
  { name: "home", path: "/", component: Home },
  { name: "recruit", path: "/recruit/", component: Recruit },
  {
    name: "project-overview",
    path: "/recruit/:id/overview",
    component: Overview,
    alias: "/recruit/:id",
  },
  { name: "user", path: "/user/", component: User },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
