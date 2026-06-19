<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey--text text--darken-3">
            List of all dialysis chairs
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="chairs.headers" :items="chairs.data"
                    class="mb-3" flat hide-default-footer
            >
                <template v-slot:item.number="{ item }">Chair No. {{ props.item.number }}</template>
                <template v-slot:item.ward="{ item }">{{ props.item.ward.name }}</template>
                <template v-slot:item.machine="{ item }">{{ props.item.machine.display_name }}</template>
                <template v-slot:item.actions="{ item }">
                            <v-btn v-on="on" class="mx-0 blue"
                                   :href="`/dialysis/chairs/${props.item.id}/edit`" dark small>
                                edit
                            </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
    data() {
        return {
            chairs: null,
        };
    },

    watch: {
        getDialysisChairs(chairs) {
            this.chairs = chairs;
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisChairs",
        ]),

        initialised() {
            return this.chairs;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisChairs",
        ]),
    },

    mounted() {
        this.setDialysisChairs();
    },
};
</script>

<style scoped>

</style>
