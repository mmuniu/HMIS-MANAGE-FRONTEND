<template>
    <v-card flat>
        <v-card-title class="subheading grey-text text-darken-2">
            <h2 class="body-2 ma-0 pa-0">List of all regions</h2>

            <v-spacer/>

            <region-create-from @regionCreated="regionCreated"></region-create-from>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <collabmed-loading v-if="!regions.data"></collabmed-loading>

        <v-data-table :headers="headers"
                      :items="regions.data"
                      hide-default-footer
                      >
            <template v-slot:footer>
                <collabmed-paginator v-if="regions.meta" :meta="regions.meta" @change="updateData()"></collabmed-paginator>
            </template>
        </v-data-table>

    </v-card>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import RegionCreateFrom from "./RegionCreateForm";

export default {
    components: {
        RegionCreateFrom,
    },

    data: () => ({
        page: 1,
        headers: [
            { text: "Name", value: "name" },
            { text: "Address", value: "address" },
            { text: "Email", value: "email" },
            { text: "Mobile", value: "mobile" },
        ],
    }),

    computed: {
        ...mapGetters({
            regions: "getRegions",
        }),
    },

    methods: {
        ...mapActions([
            "setRegions",
        ]),

        updateData(page) {
            this.page = page;
        },

        initialize() {
            this.setRegions({
                page: this.page,
            });
        },

        regionCreated() {
            this.initialize();
        },
    },

    mounted() {
        this.initialize();
    },

};
</script>
