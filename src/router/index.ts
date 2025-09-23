import { createMemoryHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/fast",
    children: [
      {
        path: "fast",
        name: "fast",
        component: () => import("@/pages/fast.vue"),
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
