<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Edit a machine's details
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <machine-form :isMachine="isMachine"></machine-form>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    props: [
        "isMachine",
    ],

    components: {
        "machine-form": require("./partials/MachineForm"),
    },
};
</script>

<style scoped>

</style>
