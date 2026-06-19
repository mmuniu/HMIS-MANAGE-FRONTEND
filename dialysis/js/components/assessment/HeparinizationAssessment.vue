<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div v-else>
        <v-row >
            <v-col cols="12">
                <v-card>
                    <v-container fluid>
                        <h2 class="subheading mt-1">Anti-coagulation options</h2>

                        <v-row >
                            <v-col cols="4" md="2" v-for="option in options" :key="option.id">
                                <v-checkbox :label="option.name" class="mid-center"
                                            v-model="assess.heparinization.coagulation_options"
                                            :value="option.id"></v-checkbox>
                            </v-col>
                        </v-row>

                        <v-divider class="mt-0"></v-divider>

                        <h2 class="subheading ">Heparinization treatment</h2>

                        <transition-group name="slide-fade">

                            <v-row  v-for="(heparin, index) in assess.heparinization.doses.length"
                                      :key="assess.heparinization.doses[index].identifier">
                                <v-col cols="12">
                                    <div class="mx-1">
                                        <p @click.prevent="removeHeparinization(index)"
                                           v-if="index > 0"
                                           class="go-away pink--text my-0 font-weight-bold">
                                            Remove dosage {{ index }}
                                        </p>
                                    </div>
                                </v-col>

                                <v-col cols="8" md="4">
                                    <v-text-field label="Heparin used"
                                                  outline
                                                  v-model="assess.heparinization.doses[index].heparin">
                                    </v-text-field>
                                </v-col>

                                <v-col cols="8" md="4">
                                    <v-text-field label="Laoding dose"
                                                  suffix="units/mL"
                                                  outline
                                                  v-model="assess.heparinization.doses[index].loading_dose">

                                    </v-text-field>
                                </v-col>

                                <v-col cols="8" md="4">
                                    <v-text-field label="Units/hrs"
                                                  outline
                                                  v-model="assess.heparinization.doses[index].units">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                        </transition-group>

                        <!-- Button to add schemes -->
                        <v-col cols="12">
                            <v-btn @click.prevent="addHeparinization()" color="blue" icon dark class="mb-4">
                                <v-icon>add_circle</v-icon>
                            </v-btn>
                        </v-col>
                        <!-- End of Button -->

                        <v-divider class="mt-0"></v-divider>

                        <v-col class="text-right" cols="12" >
                            <v-btn class="blue" :disabled="loading" :dark="!loading"
                                   :loading="loading"
                                   @click.prevent="save()"
                            >
                                Finalise Assessments
                            </v-btn>
                        </v-col>

                    </v-container>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { assessment_mixin } from "@dialysis/components/assessment/mixins/assessment_mixin";
import { mapActions, mapGetters } from "vuex";

export default {
    mixins: [
        assessment_mixin,
    ],

    computed: {
        ...mapGetters([
            "getDialysisAntiCoagulationOptions",
        ]),

        options() {
            return this.getDialysisAntiCoagulationOptions;
        },

        initialised() {
            return this.options && this.options.length > 0;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisAntiCoagulationOptions",
        ]),

        addHeparinization() {
            this.assess.heparinization.doses.push(
                this.assess.heparinizationTemplate(),
            );
        },

        removeHeparinization(index) {
            this.assess.heparinization.doses.splice(index, 1);
        },
    },

    mounted() {
        this.setDialysisAntiCoagulationOptions();

        this.addHeparinization();

        this.initialisePage("heparinization", null);
    },
};
</script>

<style lang="scss">
    .mid-center{
        .v-label{
            top: 3px !important;
        }
    }

    .go-away{
        cursor: pointer;

        &:hover{
            text-decoration: underline
        }
    }
</style>
