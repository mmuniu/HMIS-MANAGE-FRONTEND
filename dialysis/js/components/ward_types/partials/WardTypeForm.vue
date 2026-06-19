<template>
    <v-row >
        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Ward type name" v-model="wardType.name"
                              :error="errors.has('name')" outline required
                              :hint="errors.get('name')"
                              persistent-hint @keyup="errors.clear('name')">
                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
                <div class="mx-3">
                            <v-text-field label="Ward type description"
                              v-model="wardType.description"
                              :error="errors.has('description')" outline required
                              :hint="errors.get('description')"
                              persistent-hint @keyup="errors.clear('description')"></v-text-field>
                </div>
        </v-col>

        <v-col cols="12" class="text-right mx-2">
            <v-btn v-if="!isWardType" type="submit" class="blue lighten-1" color="blue" large
                   :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                   @click="saveWardType()">
                Save ward type
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                   :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                   @click="updateWardType()">
                Update ward type
            </v-btn>
        </v-col>

    </v-row>
</template>

<script>
import { mapActions } from "vuex";
import WardType from "@dialysis/libs/wards/WardType";

export default {
    props: [
        "isWardType",
    ],

    data() {
        return {
            formLoader: false,
            wardType: new WardType,
        };
    },

    watch: {
        contaminated() {
            this.formLoader = false;
            this.wardType.form.submitted = false;
            this.wardType.form.errorDetected = false;
        },

        submitted() {
            this.formLoader = false;
            this.wardType.form.submitted = false;
            this.setDialysisWardTypes();
        },
    },

    computed: {
        errors() {
            return this.wardType.form.errors;
        },

        submitted() {
            return this.wardType.form.submitted;
        },

        contaminated() {
            return this.wardType.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisWardTypes",
        ]),

        saveWardType() {
            this.formLoader = true;
            this.wardType.save();
        },

        updateWardType() {
            this.formLoader = true;
            this.wardType.update();
        },

        initializePage() {
            const wardType = this.isWardType;

            if (wardType) {
                this.wardType.assemble(wardType);
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
