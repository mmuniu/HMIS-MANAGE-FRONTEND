<template>
    <v-card>
        <v-card-title>
            <h2 class="subheading my-0 py-0">Knock off items</h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-row  >
                <v-col cols="12" md="4">
                    <div class="mx-3">
                        <products-search @results="addItem"></products-search>
                    </div>
                </v-col>

                <v-col cols="12" class="table-form small">
                    <form @submit.prevent="save()">
                        <v-data-table
                                :headers="headers" :items="knockoff.items"
                                no-data-text="Search and select products to add" hide-default-footer
                        >
                            <template v-slot:item.quantity="{ item }">
                                <v-text-field
                                        v-model="item.quantity"
                                        solo flat
                                ></v-text-field>
                            </template>
                            <template v-slot:item.reason="{ item }">
                                <v-text-field
                                        v-model="item.reason"
                                        solo flat
                                ></v-text-field>
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn icon class="pink--text" flat>
                                    <v-icon class="pink--text" small
                                            @click="knockoff.removeItem(item)"
                                    >
                                        delete
                                    </v-icon>
                                </v-btn>
                            </template>

                            <template slot="footer">
                                <v-btn
                                        class="caption mx-0 mt-4"
                                        type="submit"
                                        color="success"
                                        :dark="!loading"
                                        :disabled="loading"
                                        :loading="loading"
                                >
                                    Knock off items
                                </v-btn>
                            </template>
                        </v-data-table>
                    </form>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import KnockOff from "@inventory/libs/stores/KnockOff";
import ProductSearch from "@inventory/components/ProductsSearch";

export default {
    name: "KnockOff",

    components: {
        "products-search": ProductSearch,
    },

    data() {
        return {
            knockoff: new KnockOff(),
            loading: false,
            headers: [
                { text: "Product name", value: "name", sortable: false },
                { text: "Quantity", value: "quantity", sortable: false },
                { text: "Reason", value: "reason", sortable: false },
                { text: "", value: "action", sortable: false },
            ],
        };
    },

    watch: {
        submitted(value) {
            if (value) {
                this.loading = false;
                this.knockoff.form.submitted = false;
            }
        },
    },

    computed: {
        storeId() {
            return this.$route.params.storeId;
        },

        submitted() {
            return this.knockoff.form.submitted;
        },
    },

    methods: {
        addItem( product ) {
            this.knockoff.addItem(product);
        },

        save() {
            if (this.knockoff.items.length === 0) {
                flash({
                    message: "Sorry! you didnt select any items",
                    alert: "error",
                });
                return;
            }

            if (!this.loading) {
                this.loading = true;

                this.knockoff.execute(this.storeId);
            }
        },
    },
};
</script>
