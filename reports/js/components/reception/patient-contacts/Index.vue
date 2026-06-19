<template>
    <div>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

        <v-card>
            <v-card-title height="23">
                <h4>Patient Contacts</h4>
                <v-spacer></v-spacer>
            </v-card-title>
            <patients-contacts-filter :obj="obj" @filter="performFilter"></patients-contacts-filter>
                <div>
                    <v-data-table
                            :headers="list.headers" :items="list.data"
                            flat hide-default-footer
                    >
                    </v-data-table>
                </div>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
    </div>
</template>

<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {
    mixins: [
        reportsMixin,
    ],

    data() {
        return {
            module: "reception",
            decoratorKey: "patient-contacts",
        };
    },

    components: {
        "patients-contacts-filter": Filter,
    },

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
