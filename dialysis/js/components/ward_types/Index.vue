<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey--text text--darken-3">
            List of all dialysis ward types
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="types.headers"
                    :items="types.data"
                    class="mb-3"
                    flat
                    hide-default-footer
            >
                <template slot="items" slot-scope="props">
                    <td>{{ props.item.name }}</td>
                    <td>{{ props.item.description }}</td>
                    <td>
                            <v-btn icon slot="activator" class="mx-0"
                                   :href="`/dialysis/ward-types/${props.item.id}/edit`">
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
            types: null,
        };
    },

    watch: {
        getDialysisWardTypes(types) {
            this.types = types;
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisWardTypes",
        ]),

        initialised() {
            return this.types;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisWardTypes",
        ]),
    },

    mounted() {
        this.setDialysisWardTypes();
    },
};
</script>
