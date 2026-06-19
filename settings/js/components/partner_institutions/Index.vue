<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="text-bold grey--text text--darken-1">
            List of all partner institutions
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="headers" :items="partnerInstitutions.data"
                    class="mb-3" flat
            >
                <template v-slot:item.actions="{ item }">
                    <v-btn slot="activator" class="mx-0 cyan" :href="`/settings/partner-institutions/${item.id}/edit`" dark small>
                        edit
                    </v-btn>
                    <v-btn slot="activator" class="mx-0 primary" :href="`/settings/partner-institutions/${item.id}/staff`" dark small>
                        staff
                    </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
    data: () => ({
        headers: [
            { text: "Name", value: "name" },
            { text: "Address", value: "address" },
            { text: "Mobile", value: "mobile" },
            { text: "Town", value: "town" },
            { text: "Actions", value: "actions" },
        ],
    }),

    computed: {
        ...mapGetters({
            partnerInstitutions: "getPartnerInstitutions",
        }),

        initialised() {
            return !!this.partnerInstitutions;
        },
    },

    methods: {
        ...mapActions([
            "setPartnerInstitutions",
        ]),
    },

    mounted() {
        this.setPartnerInstitutions();
    },
};
</script>
