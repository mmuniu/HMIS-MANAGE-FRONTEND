<template>
    <v-row >
        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Unit name" v-model="unit.name" :error="errors.has('name')" outline required
                              :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')">
                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Description" v-model="unit.description" outline></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" class="text-right mx-2">
            <v-btn v-if="!isMeasurementUnit" type="submit" class="blue lighten-1" color="blue" large
                   :dark="!loading" :loading="loading" :disabled="loading"
                   @click="storeUnit()">
                Save unit details
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                   :dark="!loading" :loading="loading" :disabled="loading"
                   @click="updateUnit()">
                Update unit details
            </v-btn>
        </v-col>
    </v-row>
</template>

<script>
import { mapActions } from "vuex";
import MeasurementUnit from "@inventory/libs/measurement_units/MeasurementUnit";

export default {
    name: "measurement-unit-form",

    props: [
        "isMeasurementUnit",
    ],

    data() {
        return {
            unit: new MeasurementUnit(),
            loading: false,
        };
    },

    watch: {
        contaminated() {
            this.loading = false;
            this.unit.form.submitted = false;
            this.unit.form.errorDetected = false;
        },

        submitted() {
            this.loading = false;
            this.unit.form.submitted = false;
            this.setMeasurementUnits();
        },
    },

    computed: {
        errors() {
            return this.unit.form.errors;
        },

        submitted() {
            return this.unit.form.submitted;
        },

        contaminated() {
            return this.unit.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setMeasurementUnits",
        ]),

        storeUnit() {
            this.loading = true;

            this.unit.save();
        },

        updateUnit() {
            this.loading = true;

            this.unit.update();
        },

        initializePage() {
            const measurementUnit = this.isMeasurementUnit;

            if (measurementUnit) {
                this.unit.assemble(measurementUnit);
            }
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
