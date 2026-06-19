<template>
    <v-card flat class="p-4">
        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="admissionObj.admission_data.permit_no"
                                  label="Permit no" outlined
                    ></v-text-field>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <collabmed-date-time-picker
                        label="Collection date"
                        outline
                        @input="setCollectionDate"
                    ></collabmed-date-time-picker>
                </div>
            </v-col>
        </v-row>
        <v-row v-if="admission">
            <v-col cols="6">
                <v-col cols="12" md="12">
                    <v-btn block
                           :color=" admission.dispatch_date ? 'gray' : 'primary'"
                           :disabled="admission.dispatch_date ? true : false"
                           class="mt-4" @click.once="admissionObj.dispatch()">
                        {{ admission.dispatch_date ? 'Dispatch requested' : 'Dispatch' }}
                        <v-icon class="pl-2">arrow_right_alt</v-icon>
                    </v-btn>
                </v-col>
            </v-col>
        </v-row>
    </v-card>
</template>
<script>
import Admission from "@morgue/libs/admissions/Admissions";

export default {
    props: [
        'admissionInst',
    ],

    data () {
        return {
            admission: null,
            admissionObj: new Admission(),
        }
    },

    methods: {
        setCollectionDate(datetime) {
            this.admissionObj.admission_data.date_collected = datetime;
        },
    },

    watch: {
        admission () {
            this.admissionObj.admission_data.visit_id = this.admission.visit_id;
            this.admissionObj.admission_data.permit_no = this.admission.permit_no;
        }
    },

    mounted () {
        this.admission = JSON.parse(this.admissionInst);
    }
}
</script>
