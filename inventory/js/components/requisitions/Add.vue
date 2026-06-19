<template>
    <v-dialog v-model="dialog" persistent max-width="40%">
        <template v-slot:activator="{ on }">
            <v-btn color="primary" v-on="on" style="float: right">Add</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary">Approve Requisition</v-card-title>

            <create-requisition></create-requisition>
        </v-card>
    </v-dialog>
</template>
<script>
import CreateRequisition from "@inventory/components/requisitions/Create.vue";

export default {
    props: [
        "requisition_id",
    ],

    components: {
        CreateRequisition,
    },

    data: () => ({
        dialog: false,
    }),
};
</script>
