import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import StoreGenerator from "./StoreGenerator";

const generator = new StoreGenerator();

export const store = new Vuex.Store({

    state: generator.getState(),

    getters: generator.getGetters(),

    mutations: generator.getMutations(),

    actions: generator.getActions(),
});
