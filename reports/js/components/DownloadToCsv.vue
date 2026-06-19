<template>
        <v-btn class="v-btn v-btn--small theme--light primary" @click="exportCsv" target="_blank"><i class="fa fa-empire"></i>&nbsp;csv</v-btn>
</template>
<script>

export default {

    props: {
        headers: {
            type: Array,
        },
        data: {
            type: Array,
        },
        filename: {
            type: String,
        },
    },

    methods: {
        exportCsv() {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += [
                ...this.data.map((item) => Object.values(item).join(";")),
            ];
            //
            const data = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", data);
            link.setAttribute("download", this.filename+".csv");
            link.click();
        },
    },
};
</script>
