<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="text-bold grey--text text--darken-1">
            <v-card class="navio mb-4" flat>
                <v-btn-toggle flat>
                    <v-btn @click="toPublished()">
                        <span :class="[ $route.path == '/evaluation/deliveries/prepare' ?  'primary--text' : ''  ]" style="font-weight: bold">Prepare delivery</span>
                    </v-btn>
                    <v-btn>
                        <span :class="[ $route.path != '/evaluation/deliveries/prepare' ?  'primary--text' : ''  ]" style="font-weight: bold">Queued delivery</span>
                    </v-btn>
                </v-btn-toggle>
            </v-card>
        </v-card-title>

        <v-card-text>
            <v-row >
                <v-spacer></v-spacer>
                <v-col md="2" cols="12">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="start_date"
                                                label="Start date"></collabmed-date-time-picker>
                </v-col>
                <v-col md="2" cols="12">
                    <collabmed-date-time-picker outline @input="setEndDate" :datetime="start_date"
                                                label="End date"></collabmed-date-time-picker>
                </v-col>
                <v-col md="2" cols="12">
                    <partner-institution-staff-search
                            label="Referring doctor" @results="referringDoctorSelected"
                            class="mx-3" outline></partner-institution-staff-search>
                </v-col>
                <v-col md="2" cols="12">
                    <v-btn small color="primary" @click="filterDeliveries()">Filter</v-btn>
                </v-col>
            </v-row>


            <v-row v-resize="onResize">
                <v-data-table :headers="headers"
                              :rows-per-page-items="[25]"
                              :items="queued.data" :search="search"
                              :hide-headers="isMobile"
                              :class="{mobile: isMobile}"
                >
                    <template slot="items" slot-scope="props">
                        <!--md views -->
                        <tr v-if="!isMobile">
                            <td>{{ props.index + 1 }}</td>
                            <td>{{ props.item.title }}</td>
                            <td>
                                <v-chip v-if="props.item.status" small color="success">Signed</v-chip>
                                <v-chip v-else small color="error">Un signed</v-chip>
                            </td>
                            <td>
                                <span v-if="props.item.signed_by">{{ props.item.signed_by }}</span>
                                <span v-else>Not signed</span>
                            </td>
                            <td>{{ props.item.created_at }}</td>
                            <td>
                                <v-btn small color="primary" @click="viewDeliveryInfo(props.item)">view</v-btn>
                            </td>
                        </tr>

                        <!--mobile view-->
                        <tr v-else>
                            <td colspan="11">
                                <div class="flex-content">
                                    <div style="font-weight: bold" class="flex-item" data-label="Calories">{{ props.item.title }}</div>
                                    <div class="flex-item" data-label="Fat (g)">
                                        <span>Prepared By:{{ props.item.user.full_name }} </span> <br/>
                                        <span>Doc: {{  props.item.created_at}}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <v-btn small icon  @click="viewDeliveryInfo(props.item)">
                                    <v-icon small color="primary">visibility</v-icon>
                                </v-btn>
                            </td>
                        </tr>
                    </template>
                    <v-alert slot="no-results" :value="true" color="error" icon="warning">
                        Your search for "{{ search }}" found no results.
                    </v-alert>
                </v-data-table>
            </v-row>


            <!-- view delivery details -->
            <v-dialog v-model="dialog" max-width="800" v-if="delivery">
                <v-card>
                    <v-card-title class="headline primary white--text">
                        Delivery: {{ delivery.title }}
                        <v-spacer></v-spacer>
                        <v-chip v-if="delivery.status" small color="success">Signed</v-chip>
                        <v-chip v-else small color="error">Un signed</v-chip>
                    </v-card-title>

                    <v-card-text>
                        <h5>Prepared By: {{ delivery.user.full_name }}</h5>

                        <v-row >
                            <v-col class="px-4 pb-4" cols="12" md="6" >
                                <v-list three-line>
                                    <template v-for="(result, index) in delivery.investigations">
                                        <v-list-tile :key="index">
                                            <v-list-tile-content>
                                                <v-list-tile-title>
                                                    <span style="font-weight: bold">{{ result.procedure }}</span>
                                                </v-list-tile-title>
                                                <v-list-tile-sub-title><span style="font-weight: bold">Patient:</span>  {{ result.patient }}</v-list-tile-sub-title>
                                                <v-list-tile-sub-title><span style="font-weight: bold">Date posted:</span>  {{ result.created_at }}</v-list-tile-sub-title>
                                                <v-list-tile-sub-title v-if="delivery.status">
                                                    <span style="font-weight: bold">Received By:</span>  {{ delivery.signed_by }}
                                                </v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action v-if="!delivery.status">
                                                <v-btn icon ripple @click="removeFromGroup(result)">
                                                    <v-icon color="error lighten-1">cancel</v-icon>
                                                </v-btn>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                    </template>
                                </v-list>
                            </v-col>
                            <v-col class="px-4" cols="12" md="6" v-if="!delivery.status">
                                <v-text-field label="Received by: " outline v-model="signed_by"></v-text-field>
                                <core-signature-pad height="200px" width="100%" @signed="saveSignature"></core-signature-pad>
                            </v-col>
                            <v-col class="px-4" cols="12" md="6" v-else>
                                <img :src="delivery.signature" height="200px" width="100%"  />
                            </v-col>
                        </v-row>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="error darken-1" @click="closeDialog()">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>


        </v-card-text>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import { _ } from 'vue-underscore';
import Delivery from '@evaluation/libs/delivery/Delivery';

export default {
    data: () => ({
        start_date: '',
        end_date: '',
        isMobile: false,
        search: '',
        delivery: null,
        deliveryClass: new Delivery(),
        signature_dialog: false,
        dialog: false,
        signed_by: null,
        signature: null,
        headers: [
            { text: '#', value: '' },
            { text: 'Title', value: 'title' },
            { text: 'Status', value: 'status' },
            { text: 'Received By', value: 'signed_by' },
            { text: 'Created_at', value: 'created_at' },
            { text: 'Actions', value: '' },
        ],
        filters: {
            institution: null,
            start_date: null,
            end_date: null,
            signed: null,
        },
    }),

    computed: {
        ...mapGetters({
            queued: 'getResultDeliveries',
        }),

        initialised() {
            return !!this.queued;
        },
    },

    methods: {
        ...mapActions([
            'setResultDeliveries',
        ]),

        viewDeliveryInfo(delivery) {
            this.dialog = true;
            this.delivery = delivery;
        },

        closeDialog() {
            this.dialog = false;
            this.delivery = null;
        },

        setStartDate(date) {
            this.filters.start_date = date;
        },

        setEndDate(date) {
            this.filters.end_date = date;
        },

        referringDoctorSelected(institution) {
            this.filters.institution = institution.id;
        },

        filterDeliveries() {
            const data = _.pick(this.filters, function(param) {
                if (param != null || param == 0) {
                    return param;
                }
            });

            this.setResultDeliveries({
                params: data,
            });
        },

        saveSignature(signature) {
            if (this.signed_by) {
                const data = {
                    delivery_id: this.delivery.id,
                    signature: signature,
                    signed_by: this.signed_by,
                };
                this.deliveryClass.saveSignature(data);
            } else {
                flash({
                    message: 'Oops!, Seems like you forgot to give us your name',
                    alert: 'error',
                });
            }
        },

        async removeFromGroup(result) {
            await this.deliveryClass.removeFromQueue(result);
            await this.delivery.investigations.splice(_.indexOf(this.delivery.investigations, result), 1);
        },

        toPublished() {
            window.location.href = '/evaluation/deliveries/prepare';
        },

        onResize() {
            if (window.innerWidth < 769) {
                this.isMobile = true;
            } else {
                this.isMobile = false;
            }
        },
    },

    mounted() {
        this.setResultDeliveries();
    },
};
</script>
