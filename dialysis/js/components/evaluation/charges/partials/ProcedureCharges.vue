<template>
    <v-row >
        <v-col cols="12" md="4">
            <div class="mr-3">
                <h2 class="long-form-heading ml-1">Procedure charges</h2>
                <p class="ml-1">Charges on procedures & treatment done</p>
            </div>
        </v-col>

        <v-col cols="12" md="8">
            <v-card flat>
                <!--<v-data-table-->
                        <!--:headers="content.headers" :items="charges.prescription_charges.items.data"-->
                        <!--class="mb-3" flat hide-default-footer-->
                <!--&gt;-->
                    <!--<template slot="items" slot-scope="props">-->
                        <!--<td class="py-2">-->
                            <!--{{ props.item.drug_name }}-->
                            <!--&lt;!&ndash;<p class="caption teal&#45;&#45;text">
                            {{ props.item.service_charge.service_code }}</p>&ndash;&gt;-->
                        <!--</td>-->
                        <!--&lt;!&ndash;<td>{{ props.item.quantity }}</td>&ndash;&gt;-->
                        <!--&lt;!&ndash;<td>{{ props.item.price }}</td>&ndash;&gt;-->
                        <!--&lt;!&ndash;<td>{{ props.item.total }}</td>&ndash;&gt;-->
                    <!--</template>-->

                    <!--<template slot="footer">-->
                        <!--<td colspan="100%">-->
                            <!--<v-layout wrap row class="py-2 pb-2">-->
                                <!--<v-flex xs8 class="ml-3 font-weight-bold grey&#45;&#45;text">-->
                                    <!--Total Service Charge-->
                                <!--</v-flex>-->

                                <!--&lt;!&ndash;<v-flex xs3 class="text-xs-right
                                pr-4 red&#45;&#45;text font-weight-bold">&ndash;&gt;-->
                                    <!--&lt;!&ndash;{{ total }}&ndash;&gt;-->
                                <!--&lt;!&ndash;</v-flex>&ndash;&gt;-->
                            <!--</v-layout>-->
                        <!--</td>-->
                    <!--</template>-->
                <!--</v-data-table>-->
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
export default {
    props: [
        "content",
    ],

    computed: {
        charges() {
            return this.content;
        },
    },
};
</script>
