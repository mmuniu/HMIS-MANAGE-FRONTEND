<template>
    <div>
        <v-card color="basil">
            <v-card-title class="text-center justify-center py-6">
                <h1 class="font-weight-bold text-h4 basil--text">
                    MY WELLBEING DIAGNOSTIC TOOL
                </h1>
            </v-card-title>

            <v-tabs
                v-model="tab"
                color="black"
                background-color="transparent"
                grow
            >

                <v-tab style="background-color: #b93d52;"><span style="color: white; font-size: 15px; font-weight: bold">Physical</span></v-tab>
                <v-tab style="background-color: #f1cf1b;"><span style="color: white; font-size: 15px; font-weight: bold">Mental</span></v-tab>
                <v-tab style="background-color: #4a88bf;"><span style="color: white; font-size: 15px; font-weight: bold">Social</span></v-tab>
                <v-tab style="background-color: #5f8d5d;"><span style="color: white; font-size: 15px; font-weight: bold">Financial</span></v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
                <v-tab-item
                    v-for="item in items"
                    :key="item"
                >
                    <v-card
                        color="basil"
                        flat
                    >
                        <v-card-text>
                            <div v-if="tab === 0">
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Is your diet healthy and balanced?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.physical.is_diet_balanced">
                                        </v-select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Are you getting enough exercise?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.physical.enough_exercise">
                                        </v-select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Do you take regular breaks from sitting at your desk?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.physical.regular_breaks">
                                        </v-select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            How is the quality of your sleep?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.physical.quality_sleep">
                                        </v-select>
                                    </div>
                                </div>

                                <v-btn small color="primary" @click="tab = 1">Next</v-btn>
                            </div>
                            <div v-if="tab === 1">
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Can you utilise strategies to recognise and manage
                                            your mental and emotional state?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.mental.mental_emotion">
                                        </v-select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Do you take time to notice the here and now?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.mental.takes_notices">
                                        </v-select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Do you practice self-compassion and gratitude?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.mental.practices_gratitude">
                                        </v-select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Are you mindful of time spent utilising technology?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.mental.time_utilising_tech">
                                        </v-select>
                                    </div>
                                </div>

                                <v-btn small color="primary" class="mx-2" @click="tab = 0">Prev</v-btn>
                                <v-btn small color="primary" @click="tab = 2">Next</v-btn>
                            </div>
                            <div v-if="tab === 2">
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Do you regularly connect with your support network
                                            at home and at work?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.social.regularly_connect_support_network">
                                        </v-select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Are you able to enjoy hobbies/interests outside of
                                            work?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.social.enjoys_hobbies">
                                        </v-select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Do you feel a strong connection to a community of
                                            people with a common interest?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.social.strong_conn_to_community">
                                        </v-select>
                                    </div>
                                </div>

                                <v-btn small color="primary" class="mx-2" @click="tab = 1">Prev</v-btn>
                               <v-btn small color="primary" @click="tab = 3">Next</v-btn>
                            </div>
                            <div v-if="tab === 3">
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Do you plan your monthly budget?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.financial.monthly_budget_planner">
                                        </v-select>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Do you feel confident about your financial situation
                                            over the next 12 months?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.financial.confident_finance_situation_in_year">
                                        </v-select>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="label-text-item">
                                            Do you plan for unexpected circumstances?
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <v-select
                                            :items="selectOptions"
                                            placeholder="On a scale of  1 - 5 with five being the highest"
                                            v-model="assessment.financial.plans_for_unexpected">
                                        </v-select>
                                    </div>
                                </div>

                                <v-btn small color="primary" class="mx-2" @click="tab = 2">Prev</v-btn>
                                <v-btn small color="success" @click="submit()">Submit</v-btn>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </v-card>
    </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Eabl from "@evaluation/libs/Eabl/Eabl";

export default {
    data () {
        return {
            eablObj: new Eabl(),
            tab: 'Physical',
            items: [
                'Physical', 'Mental', 'Social', 'Financial',
            ],
            selectOptions: ["1", "2", "3", "4", "5"],
            assessment: {
                patient_identity: null,
                visit_id: null,
                physical: {
                    is_diet_balanced: null,
                    enough_exercise: null,
                    regular_breaks: null,
                    quality_sleep: null,
                },
                mental: {
                    mental_emotion: null,
                    takes_notices: null,
                    practices_gratitude: null,
                    time_utilising_tech: null,
                },
                social: {
                    regularly_connect_support_network: null,
                    enjoys_hobbies: null,
                    strong_conn_to_community: null,
                },
                financial: {
                    monthly_budget_planner: null,
                    confident_finance_situation_in_year: null,
                    plans_for_unexpected: null,
                }
            }
        }
    },

    computed: {
        ...mapGetters({
            assessmentData: 'getAssessments'
        })
    },

    watch: {
        assessmentData (val) {
            if(val) {
                this.assessment = val;
            } else {
                //
            }
        }
    },

    methods: {
        ...mapActions([
            'setAssessments'
        ]),

        async submit() {
            const response = await this.eablObj.save(this.assessment);

            window.open(`/assessment-wheel/${response.system_id}`, '_blank');
        }
    },

    mounted () {
        this.assessment.visit_id = this.$route.params.visitId;
        this.setAssessments({
            params: {
                visit_id:  this.$route.params.visitId
            }
        })
    }
}
</script>
<style scoped>
/* Helper classes */
.label-text-item {
    font-size: 14px;
    padding-top: 15px;
    font-weight: 600;
}
.basil {
    background-color: #FFFBE6 !important;
}
.basil--text {
    color: #356859 !important;
}
</style>
