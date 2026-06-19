<template>
    <span></span>
    <!--<v-card class="mx-3 px-0" v-if="prescriptions && prescriptions.headers">-->
        <!--<v-card-text class="pa-0">-->
            <!--<v-data-table-->
                    <!--:headers="prescriptions.headers" :items="prescriptions.data"-->
                    <!--class="mb-3" flat hide-default-footer-->
            <!--&gt;-->
                <!--<template slot="items" slot-scope="props">-->
                    <!--<td>{{ props.item.drug_name }}</td>-->
                    <!--<td>{{ props.item.dosage }}</td>-->
                    <!--<td>{{ props.item.duration }}</td>-->
                    <!--<td>{{ props.item.meta }}</td>-->
                    <!--<td>{{ props.item.stop_reason }}</td>-->
                    <!--<td>-->
                        <!--<v-btn fab dark small color="pink"
                         @click="updateDialog(props.item.id)"
                         :disabled="props.item.stopped" v-if="!props.item.stopped">-->
                            <!--<v-icon dark>delete</v-icon>-->
                        <!--</v-btn>-->

                        <!--<v-chip v-else color="red" text-color="white">Drug stopped</v-chip>-->
                    <!--</td>-->
                <!--</template>-->
            <!--</v-data-table>-->
        <!--</v-card-text>-->
    <!--</v-card>-->
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {

    computed: {
        ...mapGetters([
            "getPrescriptions",
        ]),

        prescriptions() {
            return this.getPrescriptions;
        },
    },

    methods: {
        ...mapActions([
            "setPrescriptions",
        ]),
    },

    mounted() {
        this.setPrescriptions({
            params: {
                visit_id: this.$route.params.visitId,
            },
        });
    },
};
</script>
