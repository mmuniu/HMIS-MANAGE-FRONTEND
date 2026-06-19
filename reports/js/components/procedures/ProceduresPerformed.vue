<template>
    <collabmed-loading v-if="loading === false"></collabmed-loading>
    <v-card v-else>
        <v-card-text>
            <div v-if="procedures && procedures.data">
                <procedure-filters/>
                <v-data-table
                        :headers="headers"
                        :items="procedures.data"
                        class="elevation-1"
                        hide-default-footer
                >
                </v-data-table>
                <div v-if="procedures.links" class="text-center">
                    <v-btn icon @click="navigate(procedures.links.prev)" color="success">
                        <v-icon>chevron_left</v-icon>
                    </v-btn>
                    <strong>
                        {{ procedures.meta.current_page }}
                    </strong>
                    <v-btn icon @click="navigate(procedures.links.next)" color="success">
                        <v-icon>chevron_right</v-icon>
                    </v-btn>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import ProcedureFilter from "@reports/components/procedures/filters/ProcedureFilter";

export default {
    name: "reports-procedures-performed",
    data() {
        return {
            loading: false,
            headers: [
                { text: "Procedure", align: "left", sortable: false, value: "procedure" },
                { text: "Number", align: "right", sortable: false, value: "number_of_times_done", align: "right" },
            ],
            procedures: null,
        };
    },
    components: {
        "procedure-filters": ProcedureFilter,
    },
    computed: {
        ...mapGetters([
            "getProceduresPerformed",
        ]),
    },
    watch: {
        getProceduresPerformed(procedures) {
            this.procedures = procedures;
            this.loading = true;
        },
    },
    methods: {
        ...mapActions([
            "setProceduresPerformed",
        ]),
        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];
                this.setProceduresPerformed({ page });
            }
        },
    },
    mounted() {
        this.setProceduresPerformed({
            page: 1,
        });
    },
};
</script>
