<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey--text text--darken-3">
            List of all dialysis machines
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="machines.headers" :items="machines.data"
                    class="mb-3" flat hide-default-footer
            >
                <template slot="items" slot-scope="props">
                    <td>{{ props.item.number }}</td>
                    <td>{{ props.item.display_name }}</td>
                    <td>{{ props.item.make }}</td>
                    <td>{{ props.item.model }}</td>
                    <td>{{ props.item.plant.number }}</td>

                    
                    <td>
                        <v-btn  :href="`/dialysis/machines/${props.item.id}/edit`" class="blue lighten-1" color="blue" >
                     Edit
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
            machines: null,
        };
    },

    watch: {
        getDialysisMachines(machines) {
            this.machines = machines;
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisMachines",
        ]),

        initialised() {
            return this.machines;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisMachines",
        ]),
    },

    mounted() {
        this.setDialysisMachines();
    },
};
</script>

<style scoped>

</style>
