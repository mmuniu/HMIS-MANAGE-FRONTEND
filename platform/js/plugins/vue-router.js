import Vue from "vue";
import VueRouter from "vue-router";
import { routes } from "@app/routes";

Vue.use(VueRouter);

const router = new VueRouter({
    routes,
    mode: "history",
    scrollBehavior: () => ({ y: 0 }),
});

/**
 * update title if meta exists
 */
router.beforeEach((to, from, next) => {
    if (to.hasOwnProperty("meta") && to.meta.hasOwnProperty("title")) {
        document.title = to.meta.title;
    }
    next();
});

export default router;

