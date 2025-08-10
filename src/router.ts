import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "./pages/home/index.vue";
import Recruit from "./pages/recruit/index.vue";
import User from "./pages/user/index.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", component: Home },
  { path: "/recruit/", component: Recruit },
  { path: "/user/", component: User },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
