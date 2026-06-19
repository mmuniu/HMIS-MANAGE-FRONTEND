<template>
    <v-card>
        <v-card-title class="text-bold grey--text text--darken-1">
            Create a new partner institutions
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <partner-institutions-form :partner="partnerData"></partner-institutions-form>
        </v-card-text>
    </v-card>
</template>

<script>
import PartnerInstitutionsForm from "./partials/PartnerInstitutionsCreateForm";

export default {
    props: [
        "partner",
    ],

    components: {
        "partner-institutions-form": PartnerInstitutionsForm,
    },

    computed: {
        partnerData() {
            return this.partner ? this.partner : null;
        },
    },

    data() {
        return {

        };
    },
};
</script>
