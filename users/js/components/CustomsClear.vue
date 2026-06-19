/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-08
* Time: 13:28
* Project: platform
*/

<template>
    <div>

    </div>
</template>

<script>
import { immigrantKey, permissionsKey, clinicIdKey, settingsKey } from "@app/libs/Util";

export default {
    methods: {
        clearUser() {
            if (window.localStorage.getItem(immigrantKey) !== null) {
                window.localStorage.removeItem(immigrantKey);
            }
        },

        clearPermissions() {
            if (window.localStorage.getItem(permissionsKey) !== null) {
                window.localStorage.removeItem(permissionsKey);
                window.events.$emit("UPDATE_USER_PERMISSIONS");
            }
        },

        clearClinic() {
            if (window.localStorage.getItem(clinicIdKey) !== null) {
                window.localStorage.removeItem(clinicIdKey);
            }
        },

        clearSettings() {
            if (window.localStorage.getItem(settingsKey) !== null) {
                window.localStorage.removeItem(settingsKey);
            }
        },
    },

    mounted() {
        this.clearUser();
        this.clearPermissions();
        this.clearClinic();
        this.clearSettings();
    },
};
</script>

<style scoped lang="scss">

</style>
