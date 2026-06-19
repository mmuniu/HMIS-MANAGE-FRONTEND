<template>
    <v-row >
        <v-col cols="12" md="4">
            <div class="mr-3">
                <h2 class="long-form-heading ml-1">Service & ward charges</h2>
                <p class="ml-1">Payments to be made on service attached to ward</p>
            </div>
        </v-col>

        <v-col cols="12" md="8">
            <v-card flat>
                <v-data-table
                        :headers="content.headers" :items="charges.items"
                        class="mb-3" flat hide-default-footer
                >
                    <template slot="items" slot-scope="props">
                        <td>{{ props.item.description }}</td>
                        <td>{{ props.item.quantity }}</td>
                        <td>{{ props.item.price }}</td>
                        <td>{{ props.item.total }}</td>
                    </template>

                    <template slot="footer">
                        <td colspan="100%">
                            <v-row  class="py-2 pb-2">
                                <v-col cols="8" class="ml-3 font-weight-bold grey--text">
                                    Total Service Charge
                                </v-col>

                                <v-col cols="3" class="text-right pr-2 red--text font-weight-bold">
                                    {{ charges.total }}
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
export default {
    props: [
        "content",
    ],

    computed: {
        charges() {
            return this.content.ward_charges;
        },
    },
};
</script>
