<template>
    <v-row  v-if="initialised">

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Chair number" v-model="chair.number"
                              :error="errors.has('number')" outline required
                              :hint="errors.get('number')"
                              persistent-hint @keyup="errors.clear('number')">
                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Chair description" v-model="chair.description" outline></v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-select label="Select a ward" :items="wards" item-text="name" item-value="id"
                          v-model="chair.dialysis_ward_id" :error="errors.has('dialysis_ward_id')" outline
                          :hint="errors.get('dialysis_ward_id')"
                          persistent-hint @change="errors.clear('dialysis_ward_id')">
                </v-select>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-select label="Select a machine" :items="machines" item-text="display_name" item-value="id"
                          v-model="chair.dialysis_machine_id" :error="errors.has('dialysis_machine_id')" outline
                          :hint="errors.get('dialysis_machine_id')"
                          persistent-hint @change="errors.clear('dialysis_machine_id')">
                </v-select>
            </div>
        </v-col>

        <v-col cols="12" class="text-right mx-2">
            <v-btn v-if="!isChair" type="submit" class="blue lighten-1" color="blue" large
                   :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                   @click="saveChair()">
                Save chair
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                   :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                   @click="updateChair()">
                Update chair
            </v-btn>
        </v-col>

    </v-row>
</template>

<script>
import Chair from "@dialysis/libs/chairs/Chair";
import { mapActions, mapGetters } from "vuex";

export default {
    props: [
        "isChair",
    ],

    data() {
        return {
            wards: [],
            machines: [],
            formLoader: false,
            chair: new Chair,
        };
    },

    watch: {
        getDialysisWards(wards) {
            this.wards = wards.data;
        },

        getDialysisMachines(machines) {
            this.machines = machines.data;
        },

        contaminated() {
            this.formLoader = false;
            this.chair.form.submitted = false;
            this.chair.form.errorDetected = false;
        },

        submitted() {
            this.formLoader = false;
            this.chair.form.submitted = false;
            this.setDialysisChairs();
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisWards", "getDialysisMachines",
        ]),

        errors() {
            return this.chair.form.errors;
        },

        submitted() {
            return this.chair.form.submitted;
        },

        contaminated() {
            return this.chair.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisChairs", "setDialysisWards", "setDialysisMachines",
        ]),

        initialised() {
            return this.wards.length > 0 && this.machines.length > 0;
        },

        saveChair() {
            this.formLoader = true;
            this.chair.save();
        },

        updateChair() {
            this.formLoader = true;
            this.chair.update();
        },

        initializePage() {
            const chair = this.isChair;

            this.setDialysisWards();

            this.setDialysisMachines();

            if (chair) {
                this.chair.assemble(chair);
            }
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
