<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 2018-12-16
* Time: 01:28
* Project: platform
-->

<template>
    <div>
        <v-row v-if="initialised">
            <v-col cols="6" sm="5" md="4">
                <h4 class="subheading font-weight-thin">Patient Name: <strong>{{ visit.patient_name }}</strong></h4>
                <p>Visit: <strong>{{ visit.id }}</strong></p>
                <p>Scheme: <strong>{{ visit.mode }}</strong></p>
            </v-col>

            <v-col cols="6" sm="7" md="8">
                <ol>
                    <li v-for="(inv, index) in items" :key="index">
                        {{ inv.procedure_name }}

                        <span class="pull-right">
                            &nbsp; Price: <strong>{{ inv.price | numberFormat }}</strong>
                            &nbsp; Qty: <strong>{{ inv.quantity }}</strong>
                            &nbsp; Amount: <strong>{{ inv.amount | numberFormat }}</strong>
                        </span>
                    </li>
                </ol>

                <h4 class="blue--text subheading text-right">Total: {{ total | numberFormat }}</h4>

                <v-btn color="success" small @click="approve">
                    <v-icon class="pr-2">check</v-icon> Approve
                </v-btn>

                <v-btn color="red" class="white--text" @click="reject" small>
                    <v-icon class="pr-2">cancel</v-icon> Reject
                </v-btn>
            </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-dialog v-model="dialog" width="70%">
            <v-card>
                <v-card-title class="headline white--text" :class="[ approveAction ? 'blue' : 'red' ]" primary-title>
                    {{ approveAction ? 'Approve' : 'Reject' }}
                    <v-btn icon dark @click.native="dialog = false" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>

                </v-card-title>

                <v-card-text v-if="dialog" class="mb-4 px-5">
                    <v-row  >
                        <v-col cols="12" sm="6">
                            <v-select v-model="approvalObj.approved_as_id"
                                      label="Approve As" outline
                                      :items="roles" item-text="name" item-value="id" persistent-hint
                            ></v-select>
                        </v-col>
                    </v-row>

                    <div v-for="(inv, index) in items" :key="index">
                        <v-row >
                            <v-col cols="12" sm="12" md="12">
                                <v-col cols="6" sm="6" md="6">
                                    <h4 class="subheadline">{{ index+1 }}. {{ inv.procedure_name }}</h4>
                                </v-col>
                            </v-col>

                            <v-col cols="12" sm="12" md="12">
                                <v-row >
                                    <v-col cols="12" md="3" sm="3">
                                        <v-switch
                                                :label="`${approvalObj.investigations[index].is_approved ? 'Approve' : 'Reject'}`"
                                                v-model="approvalObj.investigations[index].is_approved"
                                        ></v-switch>
                                    </v-col>

                                    <v-col cols="12" sm="3" md="3" v-if="approvalObj.investigations[index].is_approved">
                                        <v-text-field label="Approval Price"
                                                      v-model="approvalObj.investigations[index].approval_price" outline
                                                      class="mr-3"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col cols="12" sm="3" md="3" v-if="approvalObj.investigations[index].is_approved">
                                        <v-text-field label="Approval Amount"
                                                      v-model="approvalObj.investigations[index].approval_amount" outline
                                                      class="mr-3"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col cols="9" sm="9" md="9">
                                        <v-textarea label="Reason" v-model="approvalObj.investigations[index].reason" outline
                                                    class="mr-3" rows="2"
                                        ></v-textarea>
                                    </v-col>

                                    <v-col cols="3" sm="3" md="3">
                                        <v-checkbox
                                                label="Apply this reason to all"
                                                v-model="applyToAllCheckbox"
                                                v-if="index === 0"
                                        ></v-checkbox>
                                    </v-col>

                                </v-row>
                            </v-col>

                        </v-row>

                        <v-divider></v-divider>

                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-btn block color="primary" @click.prevent="save" :loading="saveLoader" :disabled="saveLoader">
                        <v-icon class="pr-2"></v-icon> Submit
                    </v-btn>
                </v-card-actions>

            </v-card>
        </v-dialog>
    </div>
</template>

<script>

import _ from 'lodash';
import Approval from '@evaluation/libs/approvals/Approval';
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        item: {
            required: true,
        },
    },

    data() {
        return {
            dialog: false,
            approvalObj: new Approval(),
            applyToAllCheckbox: false,
            saveLoader: false,
            approveAction: true,
        };
    },

    computed: {
        ...mapGetters([
            'getUserRoles',
        ]),

        /**
         *
         * @returns {*}
         */
        visit() {
            if (this.item.investigations) {
                return _.first(this.item.investigations).visit;
            } else {
                return null;
            }
        },

        items() {
            return this.item.investigations;
        },

        roles() {
            return _.map(this.getUserRoles.roles, (item) => {
                return {
                    name: item.display_name ? item.display_name : item.name,
                    id: item.id,
                };
            });
        },

        total() {
            return _.reduce(this.items, function(sum, n) {
                return sum + n.amount;
            }, 0);
        },

        initialised() {
            return this.visit && this.items;
        },

        submitted() {
            return this.approvalObj.form.submitted;
        },

        errors() {
            return this.approvalObj.form.errors;
        },

        contaminated() {
            return this.approvalObj.form.errorDetected;
        },
    },

    watch: {
        applyToAllCheckbox(value) {
            if (value) {
                const reason = _.first(this.approvalObj.investigations).reason;
                _.each(this.approvalObj.investigations, (item) => {
                    item.reason = reason;
                });

                setTimeout( () => {
                    this.applyToAllCheckbox = false;
                }, 1500);
            }
        },

        contaminated(value) {
            if (value) {
                this.saveLoader = false;
                this.approvalObj.form.errorDetected = false;
            }
        },

        submitted() {
            this.approvalObj.form.submitted = false;
            this.saveLoader = false;
            this.dialog = false;
            this.$emit('saved');
        },
    },

    methods: {
        ...mapActions([
            'setUserRoles',
        ]),

        approve() {
            this.approveAction = true;
            return this.populate();
        },

        reject() {
            this.approveAction = false;
            return this.populate();
        },

        populate() {
            this.approvalObj.visit_id = this.visit.id;

            _.each(this.items, (item, index) => {
                const newObj = {
                    id: item.id,
                    approval_price: item.price,
                    approval_amount: item.amount,
                    reason: null,
                    is_approved: this.approveAction,
                };

                this.$set(this.approvalObj.investigations, [index], newObj);
            });

            this.dialog = true;
        },

        save() {
            this.approvalObj.save();
        },
    },

    mounted() {
        this.setUserRoles();
    },
};
</script>

<style scoped lang="scss">

</style>
