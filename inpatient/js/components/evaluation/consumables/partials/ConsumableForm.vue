<template>
    <v-card flat>
        <v-card-text>
            <v-row  v-if="!consumableData">
                <v-col cols="12">
                    <h3 class="text-center pt-2" style="text-decoration: underline">Consumable</h3>
                    <span class="px-3 grey--text"
                          v-if="consumable.store_id">
                        To change the currently selected store: reload page or
                        <v-btn small color="primary" outline @click="reloadPage()">click here</v-btn>
                    </span>
                </v-col>
            </v-row>

            <v-row  >
                <v-col class="mx4" md="3">
                    <v-autocomplete
                            v-model="consumable.store_id"
                            label="Choose store"
                            class="px-3"
                            :disabled="checkStoreSelection()"
                            outline
                            :items="filteredList"
                            item-value="id" item-text="name"
                    ></v-autocomplete>
                </v-col>
                <v-col class="mx4" md="6">
                    <div v-if="!consumable.store_id">
                        <h4 class="px-3">Select the store first</h4>
                    </div>
                    <inventory-store-product-search @results="productSelected"
                                                    class="px-3"
                                                    v-else
                                                    :disabled="!consumable.store_id"
                                                    :storeId="consumable.store_id"
                                                    :isConsumable="isConsumable"
                                                    :keepSelected="keepSelected"></inventory-store-product-search>
                </v-col>
            </v-row>
            <v-row  >
                <v-col class="mx4" md="3">
                    <v-text-field
                            class="px-3"
                            outline flat
                            v-model="consumable.quantity"
                            @change="updateAmount()"
                            label="Quantity"
                            persistent-hint>
                    </v-text-field>
                </v-col>
                <v-col class="mx4" md="3">
                    <v-text-field
                            class="px-3"
                            outline flat
                            label="Price"
                            v-model="consumable.price"
                            disabled
                            persistent-hint>
                    </v-text-field>
                </v-col>
                <v-col class="mx4" md="3">
                    <v-text-field
                            class="px-3"
                            outline flat
                            label="Amount"
                            v-model="consumable.amount"
                            disabled
                            persistent-hint>
                    </v-text-field>
                </v-col>
            </v-row>

            <v-row >
                <v-col md="9">
                    <v-textarea
                            class="px-3"
                            outline flat
                            label="Notes"
                            v-model="consumable.notes"
                            persistent-hint>
                    </v-textarea>
                </v-col>
            </v-row>

            <v-row >
                <v-col md="9">
                    <v-switch class="px-3" label="Include this as part of the patient bill" v-model="consumable.bill"></v-switch>
                </v-col>
            </v-row>

            <v-row >
                <v-col class="px-3" cols="12" >
                    <v-btn v-if="!consumableData" color="primary" @click="save()">Save</v-btn>
                    <v-btn v-else color="primary" @click="update()">update</v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Consumable from "@inpatient/libs/consumables/Consumables";

export default {
    props: {
        paymentMode: {
            default: null,
        },
        visitId: {
            default: null,
        },
        consumableData: {
            default: false,
        },
    },

    data: () => ({
        isConsumable: 1,
        keepSelected: 1,
        consumable: new Consumable(),
    }),

    computed: {
        ...mapGetters({
            stores: "getStores",
        }),

        filteredList() {
            return _.filter(this.stores.data, (item) => {
                const perm = `inventory.${item.name}-Store`;
                if (this.$options.methods.can(perm) || this.storesSettings) {
                    return item;
                }
            });
        },
    },

    methods: {
        ...mapActions([
            "setStores", "setConsumables",
        ]),

        updateAmount() {
            this.consumable.amount = this.consumable.price * this.consumable.quantity;
        },

        checkStoreSelection() {
            return !!this.consumable.store_id;
        },

        productSelected(product) {
            const price = this.paymentMode === "insurance" ? product.insurance_price : product.selling_price;

            this.consumable.product_id = product.product_id;
            this.consumable.store_product_id = product.id;
            this.consumable.price = price;
            this.consumable.amount = price;
        },

        save() {
            this.consumable.save()
                .then((response) => {
                    this.consumable.visit_id = this.visitId;
                    this.setConsumables({
                        params: {
                            visit_id: this.visitId,
                        },
                    });
                });
        },

        assembleBack() {
            this.consumable.visit_id = this.visitId;
            this.consumable.product_id = this.consumableData.product_id;
            this.consumable.quantity = this.consumableData.quantity;
            this.consumable.price = this.consumableData.price;
            this.consumable.amount = this.consumableData.amount;
            this.consumable.notes = this.consumableData.notes;
            this.consumable.consumable_type_id = 2;
        },

        reloadPage() {
            window.location.reload();
        },

        update() {
            this.consumable.update(this.consumableData.id).then((response) => {
                this.setConsumables({
                    params: {
                        visit_id: this.visitId,
                    },
                });
            });
        },
    },

    mounted() {
        this.setStores();
        this.consumable.visit_id = this.visitId;

        if (this.consumableData) {
            this.assembleBack();
        }
    },
};
</script>
