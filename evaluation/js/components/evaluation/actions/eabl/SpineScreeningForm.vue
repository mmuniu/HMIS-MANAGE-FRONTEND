<template>
    <v-card flat>
        <v-card-title>
            <span>Spine screening form</span>
            <v-spacer/>
            <v-btn small color="primary" @click="printSpineScanForm">
                print form
            </v-btn>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col md="6">
                    <v-select v-model="spine.suffer_headaches.state"
                              label="Do you suffer from headaches? (Please tick/cross the correct answer) If Yes how often"
                              :items="['Yes', 'No']"
                    >
                    </v-select>
                </v-col>
                <v-col>
                    <v-select v-model="spine.suffer_headaches.frequency"
                              v-if="spine.suffer_headaches.state === 'Yes'"
                              label="How often"
                              :items="['Daily', 'Once a week', 'Once a month', 'Occasionally']"
                    >
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col md="6">
                    <v-select v-model="spine.suffer_backaches.state"
                              label="Do you suffer from backaches? (Please tick/cross the correct answer) If Yes how often?"
                              :items="['Yes', 'No']"
                    >
                    </v-select>
                </v-col>
                <v-col>
                    <v-select v-model="spine.suffer_backaches.frequency"
                              v-if="spine.suffer_backaches.state === 'Yes'"
                              label="How often"
                              :items="['Daily', 'Once a week', 'Once a month', 'Occasionally']"
                    >
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col md="6">
                    <v-select v-model="spine.suffer_stiffness.state"
                              label="Do you suffer from stiffness of neck or neck pain? (Please tick/cross the correct answer) If Yes how often?"
                              :items="['Yes', 'No']"
                    >
                    </v-select>
                </v-col>
                <v-col>
                    <v-select v-model="spine.suffer_stiffness.frequency"
                              v-if="spine.suffer_stiffness.state === 'Yes'"
                              label="How often"
                              :items="['Daily', 'Once a week', 'Once a month', 'Occasionally']"
                    >
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col md="6">
                    <v-select v-model="spine.painful_joints.state"
                              label="Do you suffer from Painful Joints? (Please tick/cross the correct answer) If Yes, kindly specify?"
                              :items="['Yes', 'No']"
                    >
                    </v-select>
                </v-col>
                <v-col>
                    <v-select v-model="spine.painful_joints.place"
                              v-if="spine.painful_joints.state === 'Yes'"
                              label="Kindly specify"
                              :items="['Knee', 'Hip', 'Elbow', 'Shoulder', 'Wrist', 'Ankle']"
                    >
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col md="6">
                    <v-select v-model="spine.any_surgeries"
                              label="Any surgeries in the past?"
                              :items="['Yes', 'No']"
                    >
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col md="6">
                    <v-select v-model="spine.does_exercises.state"
                              label="Do you exercise? If yes, how often?"
                              :items="['Yes', 'No']"
                    >
                    </v-select>
                </v-col>
                <v-col>
                    <v-select v-model="spine.does_exercises.frequency"
                              v-if="spine.does_exercises.state === 'Yes'"
                              label="How often"
                              :items="['Daily 3-5 times a week', 'Once a week', 'Whenever I can']"
                    >
                    </v-select>
                </v-col>
            </v-row>

            <v-row>
                <v-col md="6">
                    <v-select v-model="spine.which_exercises"
                              label="What exercise do you do?"
                              :items="['Running', 'Walking', 'Gym-Aerobics, Dance, Machines, Martial Arts', 'Play a sport']"
                    >
                    </v-select>
                </v-col>
            </v-row>

            <v-row>
                <v-col md="6">
                    <v-btn small color="primary" @click="save()">save</v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Spine from "@evaluation/libs/Eabl/Spine";

export default {
    data () {
        return {
            spine: new Spine(),
        }
    },

    computed: {
        ...mapGetters({
            spineScreeningForm: 'getSpineScreening'
        })
    },

    watch: {
        spineScreeningForm (val) {
            if(val) {
                this.spine.assemble(val);
            }
        }
    },

    methods: {
        ...mapActions([
            'setSpineScreening'
        ]),

        async save() {
            await this.spine.save()
        },

        printSpineScanForm () {
            window.open(`/evaluation/spine-screening-form/${this.$route.params.visitId}/print`, '_blank');
        }
    },

    mounted () {
        this.spine.visit_id = this.$route.params.visitId;

        this.setSpineScreening({
            params: {
                visit_id: this.$route.params.visitId
            }
        })
    }
}
</script>
