<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row >
                <v-col>
                    <download-to-csv :headers="obj.reportData.headers" :data="obj.reportData.data" :filename="filename"></download-to-csv>
                    <download-to-pdf :headers="obj.reportData.headers" :data="obj.reportData.data" :filename="filename"></download-to-pdf>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script>

export default {
    name: "suppliers-list",

    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data: () => ({
        loading: false,
        search: "",
        filename: "Suppliers List",
    }),

    methods: {
        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);

            this.$emit("filter");
        },
    },

    mounted() {
        window.events.$on("STORE_SET_ACTION_LOADING", (val) => {
            this.loading = val;
        });
    },
};
</script>
