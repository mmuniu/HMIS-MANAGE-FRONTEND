<template>
    <v-row >
        <v-col cols="12" md="3">
            <div class="mx-3">
                <v-text-field label="Plant number" v-model="plant.number"
                              :error="errors.has('number')" outline required
                              :hint="errors.get('number')" persistent-hint
                              @keyup="errors.clear('number')"></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="3">
            <div class="mx-3">
                <v-text-field label="Plant make" v-model="plant.make"
                              :error="errors.has('make')" outline required
                              :hint="errors.get('make')" persistent-hint
                              @keyup="errors.clear('make')"></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="3">
            <div class="mx-3">
                <v-text-field label="Plant model" v-model="plant.model"
                              :error="errors.has('model')"
                              outline required
                              :hint="errors.get('model')" persistent-hint
                              @keyup="errors.clear('model')"></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="3">
            <div class="mx-3">
                <v-text-field label="Plant capacity" type="number" v-model="plant.capacity"
                              :error="errors.has('capacity')" outline required
                              :hint="errors.get('capacity')" persistent-hint
                              @keyup="errors.clear('capacity')"></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" class="text-right mx-2">
            <v-btn v-if="!isPlant" type="submit" class="blue lighten-1" color="blue" large
                   :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                   @click="savePlant()">
                Save plant
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                   :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                   @click="updatePlant()">
                Update plant
            </v-btn>
        </v-col>

    </v-row>
</template>

<script>
import Plant from "@dialysis/libs/plants/Plant";
import { mapActions } from "vuex";

export default {
    props: [
        "isPlant",
    ],

    data() {
        return {
            plant: new Plant,
            formLoader: false,
        };
    },

    watch: {
        contaminated() {
            this.formLoader = false;
            this.plant.form.submitted = false;
            this.plant.form.errorDetected = false;
        },

        submitted() {
            this.formLoader = false;
            this.plant.form.submitted = false;
            this.setDialysisPlants();
        },
    },

    computed: {
        errors() {
            return this.plant.form.errors;
        },

        submitted() {
            return this.plant.form.submitted;
        },

        contaminated() {
            return this.plant.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisPlants",
        ]),

        savePlant() {
            this.formLoader = true;
            this.plant.save();
        },

        updatePlant() {
            this.formLoader = true;
            this.plant.update();
        },

        initializePage() {
            const plant = this.isPlant;

            if (plant) {
                this.plant.assemble(plant);
            }
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
