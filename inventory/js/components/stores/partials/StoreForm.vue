<template>
    <v-row  v-if="initialised">
        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Store name" v-model="store.name" :error="errors.has('name')" outline required
                              :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')"></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-autocomplete label="Select a parent store" :items="getStores.data" item-text="name" item-value="id"
                                v-model="store.parent_store_id" :error="errors.has('parent_store_id')" outline
                                :hint="errors.get('parent_store_id')" persistent-hint @change="errors.clear('parent_store_id')"></v-autocomplete>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-autocomplete label="Select a department" :items="getStoreDepartments.data" item-text="name" item-value="id"
                                v-model="store.department_id" :error="errors.has('department_id')" outline
                                :hint="errors.get('department_id')" persistent-hint @change="errors.clear('department_id')"></v-autocomplete>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-autocomplete label="Select a facility" :items="getFacilities.facilities" item-text="name" item-value="id"
                                v-model="store.facility_id" :error="errors.has('facility_id')" outline
                                :hint="errors.get('facility_id')" persistent-hint @change="errors.clear('facility_id')"></v-autocomplete>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-textarea label="Description" v-model="store.description" :error="errors.has('description')" outline required
                              :hint="errors.get('description')" persistent-hint @keyup="errors.clear('description')"></v-textarea>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-switch @change="store.checkOnOpenHours()" label="Open only between certain hours" v-model="store.open_only_between"></v-switch>
            </div>
        </v-col>

        <v-col cols="12" md="3" v-if="store.open_only_between">
            <div class="mx-3">
                <collabmed-date-time-picker timeOnly outline v-model="store.open_time" :datetime="store.open_time" label="Open time"></collabmed-date-time-picker>
            </div>
        </v-col>

        <v-col cols="12" md="3" v-if="store.open_only_between">
            <div class="mx-3">
                <collabmed-date-time-picker timeOnly outline v-model="store.close_time" :datetime="store.close_time" label="Close time"></collabmed-date-time-picker>
            </div>
        </v-col>

        <v-col cols="12">
            <div class="mx-3">
                <v-divider></v-divider>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-checkbox label="Store can order from suppliers" class="mid-center" v-model="store.can_order_from_suppliers"></v-checkbox>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-checkbox label="Store can update product prices" class="mid-center" v-model="store.can_update_product_prices"></v-checkbox>
            </div>
        </v-col>

        <v-col cols="12" class="text-right mx-2">
            <v-btn v-if="!storeId" type="submit" class="blue lighten-1" color="blue" large
                   :dark="!loader" :loading="loader" :disabled="loader"
                   @click="saveStore()">
                Save store details
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                   :dark="!loader" :loading="loader" :disabled="loader"
                   @click="updateStore()">
                Update details
            </v-btn>
        </v-col>

    </v-row>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Store from "@inventory/libs/stores/Store";

export default {
    name: "store-form",

    props: [
        "storeId",
    ],

    data() {
        return {
            store: new Store(),
            loader: false,
        };
    },

    watch: {
        contaminated() {
            this.loader = false;
            this.store.form.submitted = false;
            this.store.form.errorDetected = false;
        },

        submitted() {
            this.loader = false;
            this.store.form.submitted = false;
        },
    },

    computed: {
        ...mapGetters([
            "getStores", "getFacilities", "getStoreDepartments",
        ]),

        initialised() {
            return this.getStores && this.getFacilities && this.getStoreDepartments;
        },

        errors() {
            return this.store.form.errors;
        },

        submitted() {
            return this.store.form.submitted;
        },

        contaminated() {
            return this.store.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setStores", "setFacilities", "setStoreDepartments",
        ]),

        getStore() {
            if (this.storeId) {
                this.store.find(this.storeId );
            }
        },

        async saveStore() {
            this.loader = true;
            await this.store.save();
            await this.setStores({
                page: 1,
            });
        },

        updateStore() {
            this.loader = true;
            this.store.update();
        },
    },

    mounted() {
        this.setStores();
        this.setFacilities();
        this.setStoreDepartments();
        this.getStore();
    },
};
</script>

<style lang="scss">
    .mid-center{
        color: blue;

        .v-label{
            top: 3px !important;
        }
    }
</style>
