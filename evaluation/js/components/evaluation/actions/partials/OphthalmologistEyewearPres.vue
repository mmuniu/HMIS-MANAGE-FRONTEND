<template>
    <div>
            <div>
        <div style="padding: 10px;">
            <div style="margin-right: 20px">
                <span style="font-weight: bold; padding-left: 30px">Eyewear Prescription</span>

                <div>
                    <div class="flex-container">
                        <div style="width: 30px;">
                            &nbsp;
                        </div>
                        <div class="group-header">Sphere</div>
                        <div class="group-header">Cylinder</div>
                        <div class="group-header">Axis</div>
                        <div class="group-header">Near add</div>
                    </div>

                    <div class="flex-container">
                            <div style="width: 30px;">RE: </div>
                                <div class="group-header">
                                    <input
                                        style="width: 90%;"
                                        @change="refraction.save()"
                                        v-model="refraction.eyewear_prescription.right.sphere"
                                    />
                                </div>
                                <div class="group-header">
                                    <input
                                        style="width: 90%;"
                                        @change="refraction.save()"
                                        v-model="refraction.eyewear_prescription.right.cylinder"
                                    />
                                </div>
                                <div class="group-header">
                                    <input
                                        style="width: 90%;"
                                        @change="refraction.save()"
                                        v-model="refraction.eyewear_prescription.right.axis"
                                    />
                                </div>
                                <div class="group-header">
                                    <input
                                        style="width: 90%;"
                                        @change="refraction.save()"
                                        v-model="refraction.eyewear_prescription.right.near_add"
                                    />
                                </div>
                            </div>

                            <div class="flex-container">
                                <div style="width: 30px;">LE: </div>
                                <div class="group-header">
                                    <input
                                        style="width: 90%;"
                                        @change="refraction.save()"
                                        v-model="refraction.eyewear_prescription.left.sphere"
                                    />
                                </div>
                                <div class="group-header">
                                    <input
                                        style="width: 90%;"
                                        @change="refraction.save()"
                                        v-model="refraction.eyewear_prescription.left.cylinder"
                                    />
                                </div>
                                <div class="group-header">
                                    <input
                                        style="width: 90%;"
                                        @change="refraction.save()"
                                        v-model="refraction.eyewear_prescription.left.axis"
                                    />
                                </div>
                                <div class="group-header">
                                    <input
                                        style="width: 90%;"
                                        @change="refraction.save()"
                                        v-model="refraction.eyewear_prescription.left.near_add"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Refraction from "@evaluation/libs/refraction/Refraction";

export default {
    data: () => ({
        refraction: new Refraction(),
    }),
    
     watch: {
        getRefraction(val) {
            if(val.length > 0) {
                this.refraction.assemble(val[0]);
            }
        }
    },


    computed: {
        ...mapGetters([
            'getRefraction'
        ])
    },

    methods: {
        ...mapActions([
            'setRefraction'
        ]),

        init() {
            this.setRefraction({
                params: {
                    visit_id: this.$route.params.visitId
                }
            })
        },
    },

    mounted () {
        this.refraction.visit_id = this.$route.params.visitId;

        this.init();
    }
}
</script>
