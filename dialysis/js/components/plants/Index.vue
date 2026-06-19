<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey--text text--darken-3">
            List of all dialysis plants
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="plants.headers" :items="plants.data"
                    class="mb-3" flat hide-default-footer
            >
                <template slot="items" slot-scope="props">
                    <td>{{ props.item.number }}</td>
                    <td>{{ props.item.make }}</td>
                    <td>{{ props.item.model }}</td>
                    <td>{{ props.item.capacity }}</td>
                    <td>
                            <v-btn icon slot="activator" class="mx-0" :href="`/dialysis/plants/${props.item.id}/edit`">
                                <v-icon color="blue">edit</v-icon>
                            </v-btn>
                         
                    </td>
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
            plants: null,
        };
    },

    watch: {
        getDialysisPlants(plants) {
            this.plants = plants;
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisPlants",
        ]),

        initialised() {
            return this.plants;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisPlants",
        ]),
    },

    mounted() {
        this.setDialysisPlants();
    },
};
</script>

<style scoped>

</style>
