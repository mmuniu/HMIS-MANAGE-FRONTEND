<template>
    <v-card class="mx-3 tallish">
        <!--<v-card-title class="text-bold
        grey&#45;&#45;text text&#45;&#45;darken-1">List of prescribed drugs</v-card-title>-->
        <!--<v-divider class="pa-0 ma-0"></v-divider>-->
        <!--<v-data-table-->
                <!--:headers="prescriptions.headers" :items="prescriptions.data"-->
                <!--class="mb-3" flat hide-default-footer-->
        <!--&gt;-->
            <!--<template slot="items" slot-scope="props">-->
                <!--<td>{{ props.item.drug_name }}</td>-->
                <!--<td>{{ props.item.dosage }}</td>-->
                <!--<td>{{ props.item.duration }}</td>-->
                <!--<td>{{ props.item.stop_reason }}</td>-->
                <!--<td>-->
                    <!--<v-btn fab dark small color="pink"
                    @click="updateDialog(props.item.id)" :disabled="props.item.stopped" v-if="!props.item.stopped">-->
                        <!--<v-icon dark>delete</v-icon>-->
                    <!--</v-btn>-->

                    <!--<v-chip v-else color="red" text-color="white">Drug stopped</v-chip>-->
                <!--</td>-->
            <!--</template>-->
        <!--</v-data-table>-->
    </v-card>
</template>

<script>
export default {
    props: [
        "content",
    ],

    computed: {
        prescriptions() {
            return this.content.consumables;
        },
    },
};
</script>

<style scoped>

</style>
