<template>
    <span style="cursor: pointer">
        <collabmed-floating-loader v-if="loading"></collabmed-floating-loader>
        <download-excel
                class="v-btn v-btn--small theme--light primary v-btn v-btn--contained theme--light v-size--default primary"
                :fetch="fetchData"
                :before-generate = "startDownload"
                :before-finish = "finishDownload"
                :name="filename + '.xls'"
        >
            Excel
        </download-excel>
    </span>
</template>
<script>
import Form from "@app/libs/Form";

export default {
    props: {
        filters: {
            type: Object,
        },

        url: {
            type: String,
        },

        filename: {
            type: String,
        },

        requestType: {
            type: String,
            default: "post",
        },
    },

    data: () => ({
        loading: false,
        form: new Form(),
    }),

    methods: {
        // tested this and actually both the vue-excel and laravel excel take same amount of time to export
        // exportData()
        // {
        //     return window.location = `/reports/diagnosis/export?start_date=${this.filters.start_date}&end_date=${this.filters.end_date}&doctor=${this.filters.doctor}&ou=${this.filters.ou}`;
        // },

        async fetchData() {
            const params = _.omitBy(this.filters, _.isNil);

            params.export = true;

            try {
                const response = await this.form.submit(this.requestType, this.url, params);

                console.log(this.url)


                if (response.data.length < 1) {
                    this.loading = false;
                    flash({
                        message: "Please adjust your filters accordingly",
                        alert: "info",
                    });
                }

                return response.data;
            } catch (error) {
                console.log(error)
                // alert(error)
                // alert("Your search has crashed due to the large number of records fetched. Reload and try to chunk the results");

                location.reload();
                this.loading = false;
            }
        },

        startDownload() {
            this.loading = true;
        },
        finishDownload() {
            this.loading = false;
        },
    },

};
</script>
