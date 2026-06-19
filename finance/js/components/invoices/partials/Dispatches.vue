<template>
    <div>
        <v-data-table
                :headers="headers"
                :items="invoices.data"
                v-model="selectedDispatches"
                flat
                show-select
                @item-selected="updateTotal()"
        >
            <template v-slot:item.emailed="{ item }">
                <v-icon color="success" v-if="item.emailed">check</v-icon>
                <v-icon color="error" v-else>close</v-icon>
            </template>


            <template v-slot:item.actions="{ item }">

                <v-menu transition="slide-y-transition" bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn small  color="primary" dark v-on="on">
                            print outs
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-if="item.is_nhif">
                            <v-btn small color="primary"
                                   class="white--text"
                                   @click="print(item, 'a4', true)"
                            >
                                Print A4(NHIF)
                            </v-btn>
                        </v-list-item>
                       
                        <v-list-item v-else>
                            <v-btn small color="primary"
                                   class="white--text"
                                   @click="print(item, 'a4')"
                            >
                                print A4
                            </v-btn>
                        </v-list-item>
                        <v-list-item v-else>
                            <v-btn small color="primary"
                                   class="white--text"
                                   @click="print(item, 'a45')"
                            >
                                print A5
                            </v-btn>
                        </v-list-item>

                        <v-list-item>
                            <download-to-excel :filters="filters" :url="getUrl(item.batch)" :filename="item.company + ' dispatches for ' + item.dispatch_date"></download-to-excel>
                        </v-list-item>
                        <v-list-item>
                            <v-btn small color="primary"
                                   class="white--text"
                                   @click="print(item, 'detailed')"
                            >
                                Detailed printout
                            </v-btn>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-btn small color="success"
                       class="white--text"
                       @click="undoCancellation(item.id)"
                >
                    Email
                </v-btn>
            </template>
        </v-data-table>

        <v-row v-if="selectedDispatches.length > 0">
            <v-col cols="12">
                    <span>
                        Total selections:
                        <span class="font-weight-bold">
                            {{ selectedDispatches.length }}
                        </span>
                    </span> <br/>
            </v-col>
            <v-col cols="12">
                    <span>
                        Selected total amount:
                        <span class="font-weight-bold">
                            {{ selected_total | numberFormat }}
                        </span>
                    </span> <br/>
            </v-col>
            <v-col cols="12">
                <v-btn small color="primary"
                       class="white--text"
                       @click="printAll('a4')"
                >
                    print A4 - selected
                </v-btn>
                <v-btn small color="primary"
                       class="white--text"
                       @click="printAll('detailed')"
                >
                    Detailed printout - selected
                </v-btn>
            </v-col>
        </v-row>
    </div>
</template>
<script>
export default {
    props: [
        'invoices',
    ],

    data: () => ({
        filename: "Dispatches",
        headers: [
            { text: 'Dispatch date', value: 'dispatch_date' },
            { text: 'Batch Number', value: 'batch' },
            { text: 'Company', value: 'company' },
            { text: 'Amount', value: 'amount' },
            { text: 'Emailed', value: 'emailed' },
            { text: 'Actions', value: 'actions' },
        ],
        selectedDispatches: [],
        selected_total: 0.0,
    }),

    computed: {

    },
    methods: {
        getUrl(batch) {
        return `/api/finance/insuranceInvoices?type=dispatched&batch=${batch}`;
        },
        print(dispatch, type, is_nhif) {
            if (is_nhif) {
                window.open(`/finance/invoices/dispatched/action/print-dispatch-details/no-callback?batch=${dispatch.batch}&paper_size=${type}&is_nhif=true`);
            } else {
                window.open(`/finance/invoices/dispatched/action/print-dispatch-details/no-callback?batch=${dispatch.batch}&paper_size=${type}`);
            }
        },

        printAll(type) {

            let batches = '';

            this.selectedDispatches.forEach((val) => {
                batches = batches + '_' + val.batch;
            })

            const en_batches = window.btoa(batches);

            let url =`/finance/invoices/dispatched/action/print-dispatch-details/no-callback?print_all=true&batches=${en_batches}&paper_size=${type}`;

            window.open(url)
        },

        updateTotal() {
            setTimeout(() => {
                this.selected_total = 0.0;

                this.selectedDispatches.forEach((val) => {
                    this.selected_total += Number(val.amount.replaceAll(/[,]/g, ''));
                });
            }, 1000)
        },
    },
};
</script>
