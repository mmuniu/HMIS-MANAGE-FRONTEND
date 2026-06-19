<template>
    <v-card v-if="initialised">
        <v-card-title>
            <h2 class="subheading my-0 py-0">Receive order made</h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <form @submit.prevent="submit()">
                <v-data-table
                        :headers="headers" :items="receive.details"
                        class="mb-3"
                        flat
                >
                    <template v-slot:item.reject="{ item }">
                        <input
                                type="number"
                                class="form-control"
                                style="width: 80px;"
                                :disabled="item.received > 0"
                                v-model="item.rejected"
                                :max="item.remaining"
                                :min="0"
                                @input="rejected(item)"
                        >
                    </template>
                    <template v-slot:item.reason="{ item }">
                        <input
                                type="text"
                                class="form-control"
                                v-model="item.reason"
                        >
                    </template>
                    <template slot="footer">
                        <v-btn
                                class="caption mx-0 mt-4"
                                @click.once = "submit()"
                                color="success"
                                :dark="!loading"
                                :disabled="loading"
                                :loading="loading"
                        >
                            Receive Items
                        </v-btn>
                    </template>
                </v-data-table>
            </form>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import _ from "lodash";
import Receive from "@inventory/libs/stores/receive/Receive";

export default {
    name: "Receiving",

    data() {
        return {
            receive: new Receive(),
            loading: false,
            headers: [
                { text: "Item", value: "product.name", sortable: false },
                { text: "Ordered", value: "ordered", sortable: false },
                { text: "Dispatched", value: "dispatched", sortable: false },
                { text: "Receive", value: "receiving", sortable: false },
                // { text: 'Receiving', value: 'receiving', sortable: false},
                { text: "Reject", value: "reject", sortable: false },
                { text: "Reason", value: "reason", sortable: false },
            ],
        };
    },

    watch: {
        getInternalOrders({ data }) {
            this.receive.details = data[0].details.data;
        },

        contaminated(value) {
            if (value) {
                this.loading = false;
                this.receive.form.errorDetected = false;
            }
        },

        submitted(value) {
            if (value) {
                this.loading = false;
                this.receive.form.submitted = false;
            }
        },
    },

    computed: {
        ...mapGetters([
            "getInternalOrders",
        ]),

        orderId() {
            return this.$route.params.orderId;
        },

        storeId() {
            return this.$route.params.storeId;
        },

        initialised() {
            return this.receive.details;
        },

        contaminated() {
            return this.receive.form.errorDetected;
        },

        submitted() {
            return this.receive.form.submitted;
        },
    },

    methods: {
        ...mapActions([
            "setInternalOrders",
        ]),

        initialise() {
            this.setInternalOrders({
                params: {
                    order_id: this.orderId,
                },
            });
        },

        rejected(item) {
            const index = _.indexOf(this.receive.details, item);

            const new_value = this.receive.details[index].dispatched - this.receive.details[index].rejected;

            if (new_value >= 0) {
                this.receive.details[index].receiving = new_value;
            } else {
                this.receive.details[index].rejected = null;
                flash({
                    message: "Cannot reject more than dispatched",
                    alert: "warning",
                });
            }
        },

        submit() {
            this.loading = true;

            this.receive.store(this.storeId, this.orderId);

            this.initialise();
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>
