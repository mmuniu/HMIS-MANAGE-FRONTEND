<template>
    <v-card flat>
        <div v-if="refraction.eyewear_prescription" style="padding: 30px">
            <h3>Eyewear prescription</h3>

            <div>
                <div class="flex-container">
                    <div style="width: 30px;">&nbsp;</div>
                    <div style="font-weight: bold" class="group-header">Sphere</div>
                    <div style="font-weight: bold" class="group-header">Cylinder</div>
                    <div style="font-weight: bold" class="group-header">Axis</div>
                    <div style="font-weight: bold" class="group-header">Near add</div>
                </div>

                <div class="flex-container">
                    <div style="font-weight: bold; width: 30px;">RE:</div>
                    <div class="group-header">
                        {{ refraction.eyewear_prescription.right.sphere ? refraction.eyewear_prescription.right.sphere : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ refraction.eyewear_prescription.right.cylinder ? refraction.eyewear_prescription.right.cylinder : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ refraction.eyewear_prescription.right.axis ? refraction.eyewear_prescription.right.axis : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ refraction.eyewear_prescription.right.near_add ? refraction.eyewear_prescription.right.near_add : ' - ' }}
                    </div>
                </div>

                <div class="flex-container">
                    <div style="font-weight: bold; width: 30px;">LE:</div>
                    <div class="group-header">
                        {{ refraction.eyewear_prescription.left.sphere ? refraction.eyewear_prescription.left.sphere: ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ refraction.eyewear_prescription.left.cylinder ? refraction.eyewear_prescription.left.cylinder : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ refraction.eyewear_prescription.left.axis ? refraction.eyewear_prescription.left.axis : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ refraction.eyewear_prescription.left.near_add ? refraction.eyewear_prescription.left.near_add : ' - ' }}
                    </div>
                </div>
            </div>
        </div>

        <div>
            <eye-wear-prescription></eye-wear-prescription>
        </div>

        <div v-if="getPointsOfSale">
            <group-pos-create
                internal="1"
                :patient-id="patientId"
                :visit_id="visit_id"
                :pos-data="JSON.stringify(getPointsOfSale)"
            >
            </group-pos-create>
        </div>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import GroupPosCreate from "@evaluation/components/group-pos/Create"
import EyewearPres from "@evaluation/components/evaluation/actions/partials/EyewearPres";
import Refraction from "@evaluation/libs/refraction/Refraction";

import EyeWearPrescription from "@evaluation/components/evaluation/actions/partials/EyeWearPrescription";

export default {
    components: {
        GroupPosCreate, EyewearPres, EyeWearPrescription
    },

    data: () => ({
        patientId: null,
        visit_id: null,
        refraction: new Refraction(),

    }),

    computed: {
        ...mapGetters([
            'getPointsOfSale'
        ])
    },

    watch: {
       
    },

    methods: {
        ...mapActions([
           'setPointsOfSale'
        ]),


       async fetchPrescribeEyewear(){
        const response =  await this.refraction.fetchRefractionData(this.$route.params.visitId);
        const data = response[0];
        if(data.eyewear_prescription){    
            this.refraction.eyewear_prescription = data.eyewear_prescription
        }
        }
    },

    mounted() {
        this.visit_id = this.$route.params.visitId;

     
        this.fetchPrescribeEyewear()

        if(this.msetting('evaluation.optical_pos')) {
            this.setPointsOfSale({
                params: {
                    pos_list: this.msetting('evaluation.optical_pos')
                }
            })
        }
    }
}
</script>
<style scoped>

h6 {
    margin: 0;
}

.el-label {
    margin: 0 10px;
}

.flex-container {
    display: flex;
}

.group-header {
    width: 150px;
}
.group-header-iop {
    width: 150px;
    display: flex;
}
</style>
