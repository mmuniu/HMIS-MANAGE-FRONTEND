<template>
    <v-card>
        <v-card-title height="23">
            <h4>Ward Revenue </h4>
        </v-card-title>
        <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>
        <div>
            <v-alert
                    :value="true"
                    color="success"
                    outline
            >
                Total Revenue : {{ list.total_revenue }}
            </v-alert>
        </div>
        <template>
            <v-data-table
                    hide-default-footer
                    :headers="info_headers"
                    :items="list.data"
                    class="elevation-1"
            >
                <template v-slot:item.investigations="{ item }">
                        <span v-for="(inv, index) in item.investigations" :key="index">
                            {{ inv.procedure }}
                            <strong>@ ksh</strong> {{ inv.amount }} <strong>,</strong>&nbsp;&nbsp;
                        </span>
                </template>
                <template v-slot:item.consumables="{ item }">
                        <span v-for="(con, index) in item.consumables" :key="index">
                            {{ con.consumable }} <strong>@ ksh</strong> {{ con.amount }} <strong>,</strong>&nbsp;&nbsp;</span>
                </template>
                <template v-slot:item.prescriptions="{ item }">
                        <span v-for="(pre, index) in item.prescriptions" :key="index">
                            {{ pre.prescription }}
                            <strong>@ ksh</strong> {{ pre.amount }} <strong>,</strong>&nbsp;&nbsp;
                        </span>
                </template>
                <template v-slot:item.charges="{ item }">
                        <span v-for="(chr, index) in item.charges" :key="index">
                            {{ chr.charges }}
                            <strong>@ ksh</strong> {{ chr.amount }} <strong>,</strong>&nbsp;&nbsp;
                        </span>
                </template>
            </v-data-table>
        </template>
    </v-card>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";

export default {

    mixins: [
        reportsMixin,
    ],

    data: () => ({
        module: "finance",
        decoratorKey: "ward-revenue",
        info_headers: [
            { text: "Name", value: "name", sortable: false },
            { text: "Ward", value: "ward", sortable: false },
            { text: "Investigations", value: "investigations", sortable: false },
            { text: "Consumables", value: "consumables", sortable: false },
            { text: "Prescriptions", value: "prescriptions", sortable: false },
            { text: "Charges", value: "charges", sortable: false },
        ],
    }),

    watch: {
        page(val) {
            this.obj.filters = _.omitBy(this.$route.query, _.isNil);

            this.obj.performFilter(this.module, this.decoratorKey, val);
        },
    },

    created() {
        this.processing_child = true;

        this.obj.filters = _.omitBy(this.$route.query, _.isNil);

        this.obj.performFilter(this.module, this.decoratorKey);
    },
};
</script>
