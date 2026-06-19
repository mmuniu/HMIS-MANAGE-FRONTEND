<template>
    <span></span>
</template>

<script>

import { customs_mixin } from "@users/components/customs_mixin";
import { immigrantKey, permissionsKey, clinicIdKey, settingsKey } from "@app/libs/Util";

export default {
    mixins: [
        customs_mixin,
    ],

    props: {
        passport: {
            required: true,
        },

        clinicId: {
            required: true,
        },

        permissions: {

        },
    },

    watch: {
        getSettings(val) {
            if (val) {
                this.setSettingsToLocalStorage(val.settings);
            }
        },
    },

    methods: {
        setUser() {
            window.localStorage.setItem(immigrantKey, this.passport);
        },

        setUserPermissionsToLocalStorage() {
            window.localStorage.setItem(permissionsKey, JSON.stringify(this.permissions));
            window.events.$emit("UPDATE_USER_PERMISSIONS");
        },

        setSettingsToLocalStorage(settings) {
            window.localStorage.setItem(settingsKey, JSON.stringify(settings));
            window.events.$emit("UPDATE_SYSTEM_SETTINGS");
        },

        setClinic() {
            const clinicId = parseInt(this.clinicId);
            window.localStorage.setItem(clinicIdKey, clinicId);
        },
    },

    mounted() {
        if (!window.localStorage.hasOwnProperty(immigrantKey)) {
            this.setUser();
        }

        if (!window.localStorage.hasOwnProperty(permissionsKey)) {
            // this.setUserPermissions();
            this.setUserPermissionsToLocalStorage();
        }

        if (!window.localStorage.hasOwnProperty(settingsKey)) {
            this.setSettings();
        }

        this.setClinic();
    },
};
</script>
