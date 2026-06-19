<template>
    <v-row  class="pt-0">
        <v-col cols="12">
            <div class="mx-3 mb-3">
                <v-switch label="Service charge is paid as a one-off fee" v-model="charge.is_one_off"></v-switch>
            </div>
        </v-col>

        <v-col cols="12">
            <div class="mx-3">
                <v-text-field label="Service code" v-model="charge.service_code" :error="errors.has('service_code')" outline required
                              :hint="errors.get('service_code')" persistent-hint @keyup="errors.clear('service_code')"></v-text-field>
            </div>
        </v-col>

        <v-col cols="12">
            <div class="mx-3">
                <v-text-field label="Amount" type="number" v-model="charge.amount" :error="errors.has('amount')" outline required
                              :hint="errors.get('amount')" persistent-hint @keyup="errors.clear('amount')"></v-text-field>
            </div>
        </v-col>

        <v-col cols="12">
            <transition-group name="slide-fade">

                <v-row  key="recurrent" v-if="!charge.is_one_off">
                    <v-col cols="12">
                        <div class="mx-3">
                            <v-divider></v-divider>
                        </div>
                    </v-col>

                    <v-col cols="12">
                        <div class="mx-3 mb-3">
                            <v-switch label="Floor charge on incomplete cycles" v-model="charge.is_floored"></v-switch>
                        </div>
                    </v-col>

                    <v-col cols="12" >
                        <div class="mx-3">
                            <v-text-field label="Total cycles" type="number" v-model="charge.total_cycles" :error="errors.has('total_cycles')" outline required
                                          :hint="errors.get('total_cycles')" persistent-hint @keyup="errors.clear('total_cycles')"></v-text-field>
                        </div>
                    </v-col>

                    <v-col cols="12" >
                        <div class="mx-3">
                            <v-select label="Cycle recurrence" :items="charge.cycles" :error="errors.has('cycle')"  outline
                                      v-model="charge.cycle" :hint="errors.get('cycle')" persistent-hint @change="errors.clear('cycle')"></v-select>
                        </div>
                    </v-col>
                </v-row>
            </transition-group>
        </v-col>

        <v-col cols="12">
            <div class="mx-3 descend">
                <v-btn v-if="!service" type="submit" class="blue lighten-1" color="blue" large block
                       :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                       @click="saveServiceCharge()">
                    Save charge
                </v-btn>

                <v-btn v-else type="submit" class="blue lighten-1" color="blue" large block
                       :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                       @click="updateServiceCharge()">
                    Update charge
                </v-btn>
            </div>
        </v-col>
    </v-row>
</template>

<script>
import { mapActions } from 'vuex';
import ServiceCharge from '@finance/libs/serviceCharges/ServiceCharge';

export default {
    props: [
        'service',
    ],

    data() {
        return {
            charge: new ServiceCharge,
            formLoader: false,
        };
    },

    watch: {
        'charge.is_one_off': {
            handler: function(value, oldValue) {
                if (value === true) {
                    this.charge.total_cycles = null;
                    this.charge.cycle = null;
                    this.errors.clear('total_cycles');
                    this.errors.clear('cycle');
                }
            },
            deep: true,
        },

        contaminated(value) {
            if (value) {
                this.formLoader = false;

                this.charge.form.errorDetected = false;
            }
        },

        submitted(value) {
            if (value) {
                this.formLoader = false;

                this.charge.form.submitted = false;

                this.setServiceCharges();
            }
        },
    },

    computed: {
        errors() {
            return this.charge.form.errors;
        },

        submitted() {
            return this.charge.form.submitted;
        },

        contaminated() {
            return this.charge.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            'setServiceCharges',
        ]),

        initializePage() {
            if (this.service) {
                this.charge.populate(this.service);
            }
        },

        saveServiceCharge() {
            this.formLoader = true;
            this.charge.save();
        },

        updateServiceCharge() {
            this.formLoader = true;
            this.charge.update();
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
