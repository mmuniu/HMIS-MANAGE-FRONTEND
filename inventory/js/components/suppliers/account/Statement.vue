<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>
    <v-card v-else  flat>

    </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

export default {
    computed: {
        initialised() {
            return true;
        },
    },
};
</script>
