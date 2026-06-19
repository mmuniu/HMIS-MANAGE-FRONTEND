<template>
    <v-row >
        <v-col cols="12" md="4">
            <div class="mr-3">
                <h2 class="long-form-heading ml-1">Prescription charges</h2>
                <p class="ml-1">Payments to be made on prescription medicine</p>
            </div>
        </v-col>

        <v-col cols="12" md="8">
            <v-card flat>
                <v-data-table
                        :headers="content.headers" :items="prescriptions"
                        class="mb-3" flat hide-default-footer
                >
                    <template slot="items" slot-scope="props">
                        <td class="py-2">{{ props.item.drug_name }}</td>
                        <td>{{ props.item.pharmacy_quantity }}</td>
                        <td>{{ props.item.pharmacy_price }}</td>
                        <td>{{ props.item.pharmacy_total }}</td>
                    </template>

                    <template slot="footer">
                        <td colspan="100%">
                            <v-row  class="py-2 pb-2">
                                <v-col cols="8" class="ml-3 font-weight-bold grey--text">
                                    Total Service Charge
                                </v-col>

                                <v-col cols="3" class="text-right pr-4 red--text font-weight-bold">
                                    {{ total }}
                                </v-col>
                            </v-row>
                        </td>
                    </template>
                </v-data-table>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { _ } from "vue-underscore";

export default {
    props: [
        "content",
    ],

    computed: {
        prescriptions() {
            return this.content.prescription_charges.items.data;
        },

        total() {
            const totals = _.pluck(this.prescriptions, "pharmacy_total");
            return _.reduce(totals, (memo, num) => {
                return memo + num;
            }, 0);
        },
    },
};
</script>
