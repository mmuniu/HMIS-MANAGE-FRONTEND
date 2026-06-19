<template>
    <v-card flat>
        <div v-if="getPrescribeEyewear.eyewear_pres" style="padding: 30px">
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
                        {{ getPrescribeEyewear.eyewear_pres.right.sphere ? getPrescribeEyewear.eyewear_pres.right.sphere : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ getPrescribeEyewear.eyewear_pres.right.cylinder ? getPrescribeEyewear.eyewear_pres.right.cylinder : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ getPrescribeEyewear.eyewear_pres.right.axis ? getPrescribeEyewear.eyewear_pres.right.axis : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ getPrescribeEyewear.eyewear_pres.right.near_add ? getPrescribeEyewear.eyewear_pres.right.near_add : ' - ' }}
                    </div>
                </div>

                <div class="flex-container">
                    <div style="font-weight: bold; width: 30px;">LE:</div>
                    <div class="group-header">
                        {{ getPrescribeEyewear.eyewear_pres.left.sphere ? getPrescribeEyewear.eyewear_pres.left.sphere : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ getPrescribeEyewear.eyewear_pres.left.cylinder ? getPrescribeEyewear.eyewear_pres.left.cylinder : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ getPrescribeEyewear.eyewear_pres.left.axis ? getPrescribeEyewear.eyewear_pres.left.axis : ' - ' }}
                    </div>
                    <div class="group-header">
                        {{ getPrescribeEyewear.eyewear_pres.left.near_add ? getPrescribeEyewear.eyewear_pres.left.near_add : ' - ' }}
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
import EyeWearPrescription from "@evaluation/components/evaluation/actions/partials/EyeWearPrescription";

export default {
    components: {
        GroupPosCreate, EyewearPres, EyeWearPrescription
    },

    data: () => ({
        patientId: null,
        visit_id: null,
    }),

    computed: {
        ...mapGetters([
            'getPrescribeEyewear', 'getPointsOfSale'
        ])
    },

    watch: {
        getPrescribeEyewear(val) {
            if(val) {
                if(val.length > 0) {
                    this.patientId = val[0].patientId;
                }
            }
        }
    },

    methods: {
        ...mapActions([
            'setPrescribeEyewear', 'setPointsOfSale'
        ]),
    },

    mounted() {
        this.visit_id = this.$route.params.visitId;

        this.setPrescribeEyewear({
            params: {
                visit_id: this.$route.params.visitId
            }
        });

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
