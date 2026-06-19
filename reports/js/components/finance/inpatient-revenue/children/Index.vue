<template>
    <div>
        <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>
        <v-card>
            <v-card-text>
                <div>
                    <v-toolbar flat height="100" color="white">
                        <v-avatar size="60px">
                            <img  src="/img/placeholder.png" alt="Avatar">
                        </v-avatar>
                        <p class="ml-3">
                            <span class="font-weight-bold pl-2 subheading grey--text text--darken-1" v-for="(patient, index) in  list.data " :key="index">
                                Name: {{ patient.name }} |
                                Gender: {{ patient.gender }} |
                                Age: {{ patient.age }}
                                <br />
                                <span class="text-center">
                                    <v-btn round small outline color="error" dark> <strong>Admitted At: &nbsp;</strong>{{ patient.ward }}</v-btn>
                                </span>
                            </span>
                            <br />
                        </p>
                    </v-toolbar>
                </div>
            </v-card-text>
        </v-card>
        <br />
        <v-card>
            <v-card-text>
                <div class="row"  v-for="(patient, index) in  list.data " :key="index">
                    <div class="col-md-12">
                        <dl class="dl-horizontal">
                            <dt>Days Admitted:</dt>
                            <dd>{{ patient.days_admitted }}</dd>
                            <dt>Date Admitted:</dt>
                            <dd>{{ patient.date}}</dd>
                        </dl>
                    </div>
                    <div class="col-md-12">
                        <template>
                            <v-data-table
                                    hide-default-footer
                                    :headers="headers"
                                    :items="list.data"
                                    class="elevation-1"
                            >
                                <template v-slot:item.investigations="{ item }">
                                        <span v-for="(inv, index) in item.investigations" :key="index">
                                            {{ inv.procedure }}
                                            <strong>@ ksh</strong> {{ inv.amount }} <br />
                                        </span>
                                </template>
                                <template v-slot:item.prescriptions="{ item }">
                                        <span v-for="(pre, index) in item.prescriptions" :key="index">
                                            {{ pre.prescription }}
                                            <strong>@ ksh</strong> {{ pre.amount }} <br />
                                        </span>
                                </template>
                                <template v-slot:item.consumables="{ item }">
                                        <span v-for="(con, index) in item.consumables" :key="index">
                                            {{ con.consumable }}
                                            <strong>@ ksh</strong> {{ con.amount }} <br />
                                        </span>
                                </template>
                                <template v-slot:item.charges="{ item }">
                                        <span v-for="(chr, index) in item.charges"  :key="index">
                                            {{ chr.charges }}
                                            <strong>@ ksh</strong> {{ chr.amount }} <br />
                                        </span>
                                </template>
                            </v-data-table>
                        </template>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";

export default {

    mixins: [
        reportsMixin,
    ],

    data: () => ({
        module: "finance",
        decoratorKey: "inpatient-revenue",
        filename: "Inpatient Revenue",
        headers: [
            { text: "Investigations", value: "investigations", sortable: false },
            { text: "Prescription", value: "prescription", sortable: false },
            { text: "Consumable", value: "consumable", sortable: false },
            { text: "Charges", value: "charges", sortable: false },
        ],
    }),
    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },

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
