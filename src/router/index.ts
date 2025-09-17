import { createMemoryHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "home",
        component: () => import("@/pages/home.vue"),
      },
      { path: "fun", name: "fun", component: () => import("@/pages/fun.vue") },
      {
        path: "settings",
        name: "settings",
        component: () => import("@/pages/settings.vue"),
      },
      {
        path: "about",
        name: "about",
        component: () => import("@/pages/about.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
