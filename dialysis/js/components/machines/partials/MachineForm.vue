<template>
    <v-row  v-if="initialised">
        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Machine number"
                              v-model="machine.number"
                              :error="errors.has('number')" outline required
                              :hint="errors.get('number')"
                              persistent-hint @keyup="errors.clear('number')">

                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Machine display name"
                              v-model="machine.display_name"
                              outline></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Machine make" v-model="machine.make"
                              :error="errors.has('make')" outline required
                              :hint="errors.get('make')" persistent-hint
                              @keyup="errors.clear('make')"></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Machine model" v-model="machine.model"
                              :error="errors.has('model')" outline required
                              :hint="errors.get('model')" persistent-hint
                              @keyup="errors.clear('model')">
                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-select label="Select a plant" :items="plants"
                          item-text="number" item-value="id"
                          v-model="machine.dialysis_plant_id"
                          :error="errors.has('dialysis_plant_id')" outline
                          :hint="errors.get('dialysis_plant_id')"
                          persistent-hint @change="errors.clear('dialysis_plant_id')">

                </v-select>
            </div>
        </v-col>


        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Extra details"
                              v-model="machine.details"
                              outline></v-text-field>
            </div>
        </v-col>


        <v-col cols="12" class="text-right mx-2">
            <v-btn v-if="!isMachine" type="submit" class="blue lighten-1" color="blue" large
                   :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                   @click="saveMachine()">
                Save machine
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                   :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                   @click="updateMachine()">
                Update machine
            </v-btn>
        </v-col>

    </v-row>
</template>

<script>
import Machine from "@dialysis/libs/machines/Machine";
import { mapActions, mapGetters } from "vuex";

export default {
    props: [
        "isMachine",
    ],

    data() {
        return {
            plants: [],
            formLoader: false,
            machine: new Machine,
        };
    },

    watch: {
        getDialysisPlants(plants) {
            this.plants = plants.data;
        },

        contaminated() {
            this.formLoader = false;
            this.machine.form.submitted = false;
            this.machine.form.errorDetected = false;
        },

        submitted() {
            this.formLoader = false;
            this.machine.form.submitted = false;
            this.setDialysisMachines();
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisPlants",
        ]),

        errors() {
            return this.machine.form.errors;
        },

        submitted() {
            return this.machine.form.submitted;
        },

        contaminated() {
            return this.machine.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisMachines", "setDialysisPlants",
        ]),

        initialised() {
            return this.plants.length > 0;
        },

        saveMachine() {
            this.formLoader = true;
            this.machine.save();
        },

        updateMachine() {
            this.formLoader = true;
            this.machine.update();
        },

        initializePage() {
            const machine = this.isMachine;

            this.setDialysisPlants();

            if (machine) {
                this.machine.assemble(machine);
            }
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
