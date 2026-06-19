<template>
    <v-row  v-if="initialised">

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Ward name" v-model="ward.name"
                              :error="errors.has('name')" outline required
                              :hint="errors.get('name')" persistent-hint
                              @keyup="errors.clear('name')"></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Ward number" v-model="ward.number"
                              :error="errors.has('number')" outline required
                              :hint="errors.get('number')" persistent-hint
                              @keyup="errors.clear('number')"></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-select label="Choose ward type" :items="types"
                          item-text="name" item-value="id"
                          v-model="ward.dialysis_ward_type_id"
                          :error="errors.has('dialysis_ward_type_id')" outline required
                          :hint="errors.get('dialysis_ward_type_id')"
                          persistent-hint @change="errors.clear('dialysis_ward_type_id')">
                </v-select>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-select label="Choose a facility" :items="facilities"
                          item-text="name" item-value="id"
                          v-model="ward.facility_id"
                          :error="errors.has('facility_id')" outline required
                          :hint="errors.get('facility_id')" persistent-hint
                          @change="errors.clear('facility_id')">
                </v-select>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-autocomplete label="Choose service code" :items="charges"
                                item-text="service_code" item-value="id" outline
                                v-model="ward.service_charge_id" :error="errors.has('service_charge_id')"
                                :hint="errors.get('service_charge_id')" persistent-hint
                                @change="errors.clear('service_charge_id')"
                >
                </v-autocomplete>
            </div>
        </v-col>

        <v-col cols="12" class="text-right mx-2">
            <v-btn v-if="!isWard" type="submit" class="blue lighten-1" color="blue" large
                   :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                   @click="saveWard()">
                Save ward
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                   :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                   @click="updateWard()">
                Update ward
            </v-btn>
        </v-col>

    </v-row>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import Ward from "@dialysis/libs/wards/Ward";

export default {
    props: [
        "isWard",
    ],

    data() {
        return {
            types: [],
            facilities: [],
            formLoader: false,
            ward: new Ward,
            oneOff: true,
            charges: [],
        };
    },

    watch: {
        getDialysisWardTypes(types) {
            this.types = types.data;
        },

        getFacilities({ facilities }) {
            this.facilities = facilities;
        },

        getServiceCharges({ data }) {
            this.charges = data;
        },

        contaminated() {
            this.formLoader = false;
            this.ward.form.submitted = false;
            this.ward.form.errorDetected = false;
        },

        submitted() {
            this.formLoader = false;
            this.ward.form.submitted = false;
            this.setDialysisWards();
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisWardTypes", "getFacilities", "getServiceCharges",
        ]),

        initialised() {
            return this.types.length > 0 && this.facilities.length > 0;
        },

        errors() {
            return this.ward.form.errors;
        },

        submitted() {
            return this.ward.form.submitted;
        },

        contaminated() {
            return this.ward.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisWardTypes", "setFacilities", "setDialysisWards", "setServiceCharges",
        ]),

        saveWard() {
            this.formLoader = true;
            this.ward.save();
        },

        updateWard() {
            this.formLoader = true;
            this.ward.update();
        },

        initializePage() {
            const ward = this.isWard;

            this.setDialysisWardTypes();

            this.setFacilities();

            this.setServiceCharges();

            if (ward) {
                this.ward.assemble(ward);
            }
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>

<style scoped>

</style>
