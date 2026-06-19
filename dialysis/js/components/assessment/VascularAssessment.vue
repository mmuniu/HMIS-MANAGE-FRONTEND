<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div v-else>
        <v-row >
            <v-col cols="12">
                <v-card>
                    <v-container fluid>
                        <v-row >
                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Membrane type</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Membrane type"
                                              outline
                                              v-model="assess.vascular.membrane_type"
                                              :error="errors.has('vascular.membrane_type')"
                                              :hint="errors.get('vascular.membrane_type')"
                                              persistent-hint @keyup="errors.clear('vascular.membrane_type')">

                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-3">Vascular access</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-autocomplete label="Select vascular access" :items="accesses"
                                                item-text="display_name"
                                                item-value="id" outline
                                                v-model="access"
                                                :error="errors.has('vascular.access_id')"
                                                return-object
                                                :hint="errors.get('vascular.access_id')"
                                                persistent-hint @input="errors.clear('vascular.access_id')"
                                >
                                </v-autocomplete>
                            </v-col>
                        </v-row>

                        <v-divider class="mt-0"></v-divider>

                        <v-row >
                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Position</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Position"
                                              outline v-model="assess.vascular.position"
                                              :error="errors.has('vascular.position')"
                                              :hint="errors.get('vascular.position')"
                                              persistent-hint @keyup="errors.clear('vascular.position')">
                                </v-text-field>
                            </v-col>

                            <!-- If AVF -->
                            <v-col cols="12" v-if="avf">
                                <v-row  >
                                    <v-col class="hidden-sm-and-down" md="2">
                                        <label class="mid-center font-weight-regular subheading mt-2">
                                            Bruit / Thrill
                                        </label>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field label="Bruit" outline
                                                      v-model="assess.vascular.bruit"
                                                      :error="errors.has('vascular.bruit')"
                                                      :hint="errors.get('vascular.bruit')"
                                                      persistent-hint @keyup="errors.clear('vascular.bruit')">
                                        </v-text-field>
                                    </v-col>

                                    <v-col class="hidden-sm-and-down" md="2">
                                        <label class="mid-center font-weight-regular subheading mt-2">Bruising</label>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field label="Bruising" outline
                                                      v-model="assess.vascular.bruising"
                                                      :error="errors.has('vascular.bruising')"
                                                      :hint="errors.get('vascular.bruising')"
                                                      persistent-hint @keyup="errors.clear('vascular.bruising')">
                                        </v-text-field>
                                    </v-col>

                                    <v-col class="hidden-sm-and-down" md="2">
                                        <label class="mid-center font-weight-regular subheading mt-2">Aneurysm</label>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field label="Aneurysm" outline
                                                      v-model="assess.vascular.aneurysm"
                                                      :error="errors.has('vascular.aneurysm')"
                                                      :hint="errors.get('vascular.aneurysm')"
                                                      persistent-hint @keyup="errors.clear('vascular.aneurysm')">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>

                            <!-- If AVF -->
                            <v-col cols="12" v-if="avg">
                                <v-row  >
                                    <v-col class="hidden-sm-and-down" md="2">
                                        <label class="mid-center font-weight-regular subheading mt-2">Swelling</label>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field label="Swelling" outline
                                                      v-model="assess.vascular.swelling"
                                                      :error="errors.has('vascular.swelling')"
                                                      :hint="errors.get('vascular.swelling')"
                                                      persistent-hint @keyup="errors.clear('vascular.swelling')">
                                        </v-text-field>
                                    </v-col>

                                    <v-col class="hidden-sm-and-down" md="2">
                                        <label class="mid-center font-weight-regular subheading mt-2">Redness</label>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field label="Redness" outline v-model="assess.vascular.redness"
                                                      :error="errors.has('vascular.redness')"
                                                      :hint="errors.get('vascular.redness')"
                                                      persistent-hint @keyup="errors.clear('vascular.redness')">
                                        </v-text-field>
                                    </v-col>

                                    <v-col class="hidden-sm-and-down" md="2">
                                        <label class="mid-center font-weight-regular subheading mt-2">Clotted</label>
                                    </v-col>
                                    <v-col class="md4@" cols="12" >
                                        <v-text-field label="Clotted" outline v-model="assess.vascular.clotted"
                                                      :error="errors.has('vascular.clotted')"
                                                      :hint="errors.get('vascular.clotted')"
                                                      persistent-hint @keyup="errors.clear('vascular.clotted')">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>

                            <!-- If Catheter -->
                            <v-col cols="12" v-if="cath">
                                <v-row  >
                                    <v-col class="hidden-sm-and-down" md="2">
                                        <label class="mid-center font-weight-regular subheading mt-2">
                                            Heparin / Na+ Citrate
                                        </label>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field label="locks mls" outline v-model="assess.vascular.heparin"
                                                      :error="errors.has('vascular.heparin')"
                                                      :hint="errors.get('vascular.heparin')"
                                                      persistent-hint @keyup="errors.clear('vascular.heparin')">
                                        </v-text-field>
                                    </v-col>

                                    <v-col class="hidden-sm-and-down" md="2">
                                        <label class="mid-center font-weight-regular subheading mt-2">
                                            Catheter type
                                        </label>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-radio-group v-model="assess.vascular.is_temporary" row>
                                            <v-radio label="Temporary" :value="true"></v-radio>
                                            <v-radio label="Permanent" :value="false"></v-radio>
                                        </v-radio-group>
                                    </v-col>

                                    <v-col class="hidden-sm-and-down" md="2">
                                        <label class="mid-center font-weight-regular subheading mt-2">
                                            Dressing done
                                        </label>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field label="Dressing done" outline
                                                      v-model="assess.vascular.dressing_done"
                                                      :error="errors.has('vascular.dressing_done')"
                                                      :hint="errors.get('vascular.dressing_done')"
                                                      persistent-hint @keyup="errors.clear('vascular.dressing_done')">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                        <v-divider class="mt-0"></v-divider>

                        <v-row >
                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Primer used</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Prime" outline
                                              v-model="assess.vascular.prime"
                                              :error="errors.has('vascular.prime')"
                                              :hint="errors.get('vascular.prime')"
                                              persistent-hint @keyup="errors.clear('vascular.prime')">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">
                                    Dialysis solution used
                                </label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Solution" outline v-model="assess.vascular.solution"
                                              :error="errors.has('patient.solution')"
                                              :hint="errors.get('vascular.solution')"
                                              persistent-hint @keyup="errors.clear('patient.solution')">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Dialyzer used</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Dialyzer" outline
                                              v-model="assess.vascular.dialyzer"
                                              :error="errors.has('vascular.dialyzer')"
                                              :hint="errors.get('vascular.dialyzer')"
                                              persistent-hint @keyup="errors.clear('vascular.dialyzer')">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Bath K+</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Bath salts" outline suffix="mmol/l"
                                              v-model="assess.vascular.bath_salts"
                                              :error="errors.has('vascular.bath_salts')"
                                              :hint="errors.get('vascular.bath_salts')"
                                              persistent-hint @keyup="errors.clear('vascular.bath_salts')">
                                </v-text-field>
                            </v-col>
                        </v-row>

                        <v-divider class="mt-0"></v-divider>

                        <v-col cols="12" class="text-right">
                            <v-btn class="blue" :disabled="loading" :dark="!loading"
                                   :loading="loading" @click.prevent="save()"
                                 >
                                Record and Proceed
                            </v-btn>
                        </v-col>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { assessment_mixin } from "@dialysis/components/assessment/mixins/assessment_mixin";

export default {
    mixins: [
        assessment_mixin,
    ],

    data() {
        return {
            access: null,
            accesses: null,
        };
    },

    watch: {
        getDialysisVascularAccesses(accesses) {
            this.access = accesses[0];
            this.accesses = accesses;
        },

        access(value) {
            if (value) {
                this.assess.vascular.access_id = value.id;
            }
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisVascularAccesses",
        ]),

        avf() {
            return this.access.name === "arteriovenous fistula";
        },

        avg() {
            return this.access.name === "arteriovenous graft";
        },

        cath() {
            return this.access.name === "catheter";
        },

        initialised() {
            return this.accesses;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisVascularAccesses",
        ]),
    },

    mounted() {
        this.setDialysisVascularAccesses();
        this.initialisePage("vascular", "patient");
    },
};
</script>
