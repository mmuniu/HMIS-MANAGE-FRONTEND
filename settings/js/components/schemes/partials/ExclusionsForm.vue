/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-05-19
* Time: 14:42
*/

<template>
    <div>
        <v-row class="row-fluid" >
            <v-col cols="12" sm="5">
                <procedures-search @results="setProcedure"></procedures-search>
            </v-col>

            <v-col cols="12" sm="2">
                <h4 class="text-center">--OR--</h4>
            </v-col>

            <v-col cols="12" sm="5">
                <products-search @results="setProduct"></products-search>
            </v-col>
        </v-row>

        <div v-if="exclusions.length > 0">
            <v-row class="row-fluid"  v-for="(item, index) in exclusions" :key="index">
                <v-col sm="3">
                    {{ item.name }}
                    <br/>
                    <v-btn icon small color="red" dark @click="removeItem()">
                        <v-icon small>delete</v-icon>
                    </v-btn>
                </v-col>
                <v-col sm="4">
                    <v-autocomplete  outline
                                     label="Select a Facility"
                                     class="mb-4"
                                     :items="facilities"
                                     item-text="name" item-value="id"
                                     v-model="item.facility_id"
                                     hide-no-data
                                     autoselect-first
                    >
                    </v-autocomplete>
                </v-col>
                <v-col sm="4" offset-sm="1">
                    <v-text-field
                            outline
                            label="Price"
                            type="number"
                            step="0.01"
                            v-model="item.price">
                    </v-text-field>
                </v-col>
            </v-row>

            <v-btn class="primary" dark @click="save()" :loading="saveLoader">
                Save
            </v-btn>
        </div>


        <v-alert v-else :value="true" type="info" outline>
            No Procedure/Product selected
        </v-alert>

    </div>
</template>

<script>
import ProceduresSearch from "@evaluation/components/procedures/partials/ProceduresSearch";
import ProductsSearch from "@inventory/components/ProductsSearch";
import { mapActions, mapGetters } from "vuex";

export default {
    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    components: {
        ProductsSearch,
        ProceduresSearch,
    },

    data() {
        return {
            saveLoader: false,
            exclusions: [],
            facilities: [],
        };
    },

    computed: {
        ...mapGetters([
            "getFacilities",
        ]),

        errors() {
            return this.obj.form.errors;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },
    },

    watch: {
        getFacilities(val) {
            if (val) {
                this.facilities = val.facilities;
            }
        },

        submitted(val) {
            this.saveLoader = false;

            if (val) {
                this.obj.form.submitted = false;
            }
        },
    },

    methods: {
        ...mapActions([
            "setFacilities",
        ]),

        setProduct(item) {
            const data = {
                name: item.name,
                price: item.insurance_price,
                facility_id: null,
                product_id: item.id,
                procedure_id: null,
            };
            this.exclusions.push(data);
        },

        setProcedure(item) {
            const data = {
                name: item.name,
                price: item.insurance_price,
                facility_id: null,
                product_id: null,
                procedure_id: item.id,
            };
            this.exclusions.push(data);
        },

        save() {
            this.obj.exclusions = this.exclusions;
            let canSubmit = true;

            _.each(this.obj.exclusions, (item) => {
                if (! item.facility_id || ! item.price) {
                    canSubmit = false;
                }
            });

            if (! canSubmit) {
                flash({ alert: "error", message: "Please fill out all the fields for the exclusions" });
                return;
            }

            this.saveLoader = true;
            this.obj.saveExclusion();
        },

        removeItem(item) {
            this.exclusions.splice(item, 1);
        },
    },

    mounted() {
        this.setFacilities();
    },
};
</script>

<style scoped lang="scss">

</style>
