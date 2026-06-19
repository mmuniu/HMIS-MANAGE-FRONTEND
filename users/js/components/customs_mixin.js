/**
 * Created by PhpStorm.
 * User: Lexx YungCarter
 * Date: 01/11/2018
 * Time: 14:17
 * Project: platform
 */
import { mapActions, mapGetters } from "vuex";

export const customs_mixin = {
    computed: {
        ...mapGetters([
            "getUserPermissions", "getSettings",
        ]),
    },

    methods: {
        ...mapActions([
            "setUserPermissions", "setSettings",
        ]),

        setUser(passport) {
            window.localStorage.setItem("immigrant", JSON.stringify(passport));
        },

        setClinic(clinicId) {
            window.localStorage.setItem("clinic_id", JSON.stringify(clinicId));
        },

        clearUser() {
            window.localStorage.removeItem("immigrant");
        },
    },
};
