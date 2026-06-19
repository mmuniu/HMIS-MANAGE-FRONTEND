<template>
    <v-card>
        <v-card-title>
            <h4 class="px-4 pt-4">Lab Malaria Tests</h4>
        </v-card-title>

        <v-card-text class="pb-0">
            <procedures-search :obj="obj" @filter="performFilter" />
        </v-card-text>

        <collabmed-floating-loader v-if="saveLoader" />

        <v-card-text v-if="list.total_procedures" class="pb-0">
            <v-alert :value="true" color="success" outlined>
                <div>
                    <strong>Total Laboratory Procedures:</strong> {{ list.total_procedures }}
                </div>

                <div class="mt-2">
                    <strong>Yearly Totals:</strong>
                    <v-chip-group column class="mt-1">
                        <v-chip v-for="(value, key) in list.yearly_totals" :key="'year-' + key" class="ma-1" small
                            color="green lighten-4" text-color="green darken-4">
                            <span class="font-weight-bold">{{ key }}:</span>
                            <span class="ml-1 black--text">{{ value }}</span>
                        </v-chip>
                    </v-chip-group>

                </div>

                <div class="mt-2">
                    <strong>Monthly Visits:</strong>
                    <v-chip-group column class="mt-1">
                        <v-chip v-for="(value, key) in list.monthly_visits" :key="'month-' + key" class="ma-1" small
                            color="blue lighten-4" text-color="blue darken-4">
                            <span class="font-weight-bold">{{ key }}:</span>
                            <span class="ml-1 black--text">{{ value }}</span>
                        </v-chip>
                    </v-chip-group>
                </div>
            </v-alert>
        </v-card-text>

        <v-divider class="my-4"></v-divider>

        <v-data-table :headers="list.headers" :items="list.data" class="elevation-1" hide-default-footer>
            <template v-slot:item.label="{ item }">
                {{ item.label }}
            </template>
        </v-data-table>

        <v-card-actions class="justify-center" v-if="meta">
            <collabmed-paginator :meta="meta" @change="navigate" />
        </v-card-actions>
    </v-card>
</template>


<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {
    name: "Laboratory Malaria Test Report",

    mixins: [reportsMixin],

    data: () => ({
        module: "evaluation",
        decoratorKey: "lab-malaria-test"
    }),

    components: {
        "procedures-search": Filter,
    },

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        }
    }
};
</script>