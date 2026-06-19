<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Add a new machine
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <machine-form :isMachine="null"></machine-form>
        </v-card-text>
    </v-card>
</template>

<script>

import MachineForm from "./partials/MachineForm.vue";
export default {
    components: {
        "machine-form": MachineForm,
    },
};


</script>

<style scoped>

</style>
