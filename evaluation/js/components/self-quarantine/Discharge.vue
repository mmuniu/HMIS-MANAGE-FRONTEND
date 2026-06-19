<template>
    <v-card flat>
        <finance-patient-information
                :patient-id="patientId"
        ></finance-patient-information>

        <collabmed-loading v-if="!initialized"></collabmed-loading>

        <v-card-text v-else>

            <v-row>
                <v-col cols="12" md="4">
                    <v-select :items="dischargeReasons"
                              @change="validateChange()"
                              label="Discharge reason"
                              v-model="discharge_info.discharge_reason">
                    </v-select>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12" md="4" v-if="discharge_info.discharge_reason === 'Transfer to facility'">
                    <v-autocomplete
                            :items="facilities.facilities"
                            outline
                            v-model="discharge_info.facility_id"
                            color="blue-grey lighten-2"
                            label="Select Facility"
                            item-text="name"
                            clearable
                            @click:clear="facilityCleared"
                            item-value="id"
                            @input="facilitySelected"
                    ></v-autocomplete>
                </v-col>
            </v-row>

            <v-row v-if="discharge_info.discharge_reason === 'Lost contact'">
                <v-col cols="12" md="4">
                    <v-textarea label="Please provide reason for loss of contact"
                                v-model="discharge_info.contact_loss_reason"
                                placeholder="Give some info as to what led to the loss of contact"
                    ></v-textarea>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12" md="4">
                    <v-textarea label="Any other comments"
                                v-model="discharge_info.discharge_comments"
                    ></v-textarea>
                </v-col>
            </v-row>

            <v-row>
                <v-col  cols="12" md="4">
                    <v-btn small color="primary" @click="discharge()">confirm discharge</v-btn>
                </v-col>
            </v-row>

        </v-card-text>
    </v-card>
</template>
<script>
    import { mapActions, mapGetters } from 'vuex';
    import SelfQuarantine from '@evaluation/libs/SelfQuarantine/SelfQuarantine';

    export default {
        props: [
            'reasonsForDischarge', 'selfQuarantineId', 'patientId'
        ],

        data: () => ({
            selfQuarantine: new SelfQuarantine(),
            dischargeReasons: [],
            discharge_info: {
                discharge_reason: null,
                facility_id: null,
                contact_loss_reason: null,
                comments: null,
            }
        }),

        computed: {
            ...mapGetters({
                facilities: 'getFacilities',
                inst: 'getSelfQuarantinePatients',
            }),

            initialized () {
                return !!this.facilities;
            }
        },

        watch: {
            inst (val) {
                if(val) {
                    this.discharge_info.discharge_reason = val.discharge_reason;
                    this.discharge_info.facility_id = val.transfer_facility_id;
                    this.discharge_info.contact_loss_reason = val.contact_loss_reason;
                    this.discharge_info.comments = val.discharge_comments;
                }
            }
        },

        methods: {
            ...mapActions([
                'setFacilities', 'setSelfQuarantinePatients'
            ]),

            facilitySelected(facility) {
                this.discharge_info.facility_id = facility;
            },

            facilityCleared() {
                this.discharge_info.facility_id = null;
            },

            validateChange () {
                if(this.discharge_info.discharge_reason === 'Lost contact') {
                    this.facilityCleared();
                }

                if(this.discharge_info.discharge_reason === 'Transfer to facility') {
                    this.discharge_info.contact_loss_reason = null;
                }
            },

            initialize() {
                this.dischargeReasons = JSON.parse(this.reasonsForDischarge);
                this.setFacilities();
                this.setSelfQuarantinePatients({
                    params: {
                        inst_id: this.selfQuarantineId
                    }
                });
            },

            async discharge () {
                let response = await this.selfQuarantine.dischargePatient(this.selfQuarantineId, this.discharge_info);

                if(response) {
                    window.history.back();
                }
            }
        },

        mounted() {
            this.initialize();
        }
    }
</script>
