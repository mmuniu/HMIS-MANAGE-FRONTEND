/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-25
* Time: 05:48
*/

<template>
    <div>
        <v-card flat>
            <v-card-title>
                <h2 class="subheading font-weight-thin text-capitalize">
                    View procedures awaiting approvals
                </h2>

                <v-spacer></v-spacer>

                <v-text-field
                        v-model="search"
                        append-icon="search"
                        label="Search from loaded results"
                        hide-details
                ></v-text-field>

            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>

                    <div v-if="list && list.data">

                        <v-data-table
                                :headers="headers"
                                :items="list.data"
                                :search="search"
                                :loading="saveLoader"
                                class="mb-3"
                                flat hide-default-footer
                                disable-initial-sort
                        >
                            <template v-slot:item.patient_name="{ item }">{{ item.visit ? item.visit.patient_name : '-' }}</template>
                            <template v-slot:item.approvals="{ item }">
                                <v-chip color="green" text-color="white" @click="viewApprovals(item)" v-if="item.approvals.length > 0" class="pointer">
                                    <v-avatar class="green darken-3">{{ item.approvals.length }}</v-avatar>
                                    View
                                </v-chip>

                                <span v-else class="text-center">
                                        -
                                    </span>
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn dark small color="blue" :loading="saveLoader" @click="addApproval(item)">
                                    <v-icon small>add</v-icon> Approval
                                </v-btn>
                            </template>

                            <template v-slot:footer v-if="links">
                                <v-row  class="py-2 pb-2">
                                    <v-col cols="8" class="mt-3 ml-3">
                                        Showing {{ meta.from }} to {{ meta.to }} of {{ meta.total }} records
                                    </v-col>

                                    <v-col cols="3" class="text-right">
                                        <v-btn icon @click="navigate(links.prev)">
                                            <v-icon>chevron_left</v-icon>
                                        </v-btn>

                                        <v-btn icon @click="navigate(links.next)">
                                            <v-icon>chevron_right</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </template>

                            <v-alert slot="no-results" :value="true" color="error" icon="warning">
                                Your search for "{{ search }}" found no results.
                            </v-alert>

                        </v-data-table>
                    </div>
                </div>
            </v-card-text>
        </v-card>

        <!--dialog view approval -->
        <v-dialog v-model="dialog" width="85%" persistent>

            <v-card v-if="selected">
                <v-card-title class="headline  white--text green" primary-title>
                    Approvals | {{ selected.procedure_name | strtoupper }}

                    <v-spacer></v-spacer>

                    <v-btn icon dark @click.native="close" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <div v-if="selected.approvals">
                        <v-data-table
                                :headers="dialogHeader"
                                :items="selected.approvals"
                                class="mb-3"
                                flat hide-default-footer
                                disable-initial-sort
                        >
                            <template v-slot:item.approval_status="{ item }">
                                <v-icon v-if="item.is_approved" color="green">check</v-icon>
                                <v-icon v-else color="red">cancel</v-icon>
                                <span class="grey--text" v-if="item.status_name">{{ item.status_name | ucwords }}</span>
                            </template>
                            <template v-slot:item.approved_by="{ item }">
                                {{ item.user ? item.user.full_name : item.user_id }}
                            </template>
                            <template v-slot:item.approved_as_id="{ item }">
                                {{ item.approved_as_id ? item.approved_as : '-' }}
                            </template>
                            <template v-slot:item.price="{ item }" style="min-width: 250px">
                                <span>{{ item.initial_price | numberFormat }}</span>
                                <v-icon color="blue">arrow_right_alt</v-icon>
                                <span>{{ item.approval_price | numberFormat }}</span>
                            </template>
                            <template v-slot:item.amount="{ item }" style="min-width: 250px">
                                <span>{{ item.initial_price | numberFormat }}</span>
                                <v-icon color="blue">arrow_right_alt</v-icon>
                                <span>{{ item.approval_amount | numberFormat }}</span>
                            </template>
                            <template v-slot:item.date="{ item }">
                                <span class="">{{ item.created_at_w3c | moment('from') }}</span>
                                <span class="grey--text">{{ item.created_at }}</span>
                            </template>
                        </v-data-table>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!--dialog add approval-->
        <v-dialog v-model="dialogAdd" width="500" persistent>

            <v-card v-if="selected">
                <v-card-title class="headline  white--text blue" primary-title>
                    Add Approval | {{ selected.procedure_name }}

                    <v-spacer></v-spacer>

                    <v-btn icon dark @click.native="close" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>

                    <v-switch
                            v-model="obj.approval.is_approved"
                            :label="obj.approval.is_approved ? 'I Approve' : 'I Reject' "
                    ></v-switch>

                    <v-select v-model="obj.approval.approved_as_id"
                              label="Action Role As" outline class="mr-3"
                              :items="userRoles"
                              item-text="display_name" item-value="id"
                              @change="errors.clear('approval.approved_as_id')"
                    ></v-select>

                    <div v-if="obj.approval.is_approved">
                        <v-text-field label="Approval Price"
                                    v-model="obj.approval.approval_price" outline class="mr-3"
                                    @change="errors.clear('approval.approval_price')"
                        ></v-text-field>

                        <v-text-field label="Quantity"
                                    v-model="selected.quantity" outline class="mr-3" disabled
                        ></v-text-field>

                        <v-text-field label="Approval Amount"
                                    v-model="obj.approval.approval_amount" outline class="mr-3" disabled
                                    @change="errors.clear('approval.approval_amount')"
                        ></v-text-field>
                    </div>

                    <v-textarea label="Reason"
                                v-model="obj.approval.reason" outline class="mr-3"
                                :error="errors.has('approval.reason')"
                                :hint="errors.get('approval.reason')" persistent-hint
                                @change="errors.clear('approval.reason')"
                    ></v-textarea>

                </v-card-text>

                <v-card-actions>
                    <v-btn color="warning" flat @click="close" :loading="saveLoader">
                        Close
                    </v-btn>

                    <v-spacer></v-spacer>

                    <v-btn color="primary" @click="save" :loading="saveLoader">
                        Save
                    </v-btn>

                </v-card-actions>

            </v-card>
        </v-dialog>

    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import PendingProcedure from "@inpatient/libs/pending-procedures/PendingProcedure";

export default {
    props: {
        roles: {
            required: true,
        },
    },

    data() {
        return {
            obj: new PendingProcedure(),
            selected: null,
            saveLoader: false,
            dialog: false,
            dialogAdd: false,
            search: "",
            page: 1,
            dialogHeader: [
                { text: " Status", value: "approval_status" },
                { text: "By", value: "approved_by" },
                { text: "Approval As", value: "approved_as_id" },
                { text: "Price", value: "price" },
                { text: "Amount", value: "amount" },
                { text: "Date", value: "date" },
                { text: "Reason", value: "reason" },
            ],
        };
    },

    computed: {
        ...mapGetters([
            "getInvestigationApprovalStatuses",
        ]),

        userRoles() {
            return JSON.parse(this.roles);
        },

        statuses() {
            return this.getInvestigationApprovalStatuses;
        },

        list() {
            return this.obj.procedures;
        },

        meta() {
            return this.list.meta;
        },

        links() {
            return this.list.links;
        },

        headers() {
            return this.list.headers;
        },

        price() {
            return this.obj.approval.approval_price;
        },

        isApproved() {
            return this.obj.approval.is_approved;
        },

        initialised() {
            return this.list && this.statuses;
        },

        saved() {
            return this.obj.saved;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        errors() {
            return this.obj.form.errors;
        },
    },

    watch: {
        saved(val) {
            if (val) {
                this.saveLoader = false;
                this.obj.form.submitted = false;
                this.obj.saved = false;
                this.close();

                this.get();
            }
        },

        submitted(val) {
            if (val) {
                this.saveLoader = false;
                this.obj.form.submitted = false;
            }
        },

        price(val) {
            if (val && this.selected) {
                this.obj.approval.approval_amount = this.selected.quantity * val;
            }
        },

        isApproved(val) {
            if (val) {
                const found = _.find(this.statuses, { name: "approved" });
                found ? this.obj.approval.status_id = found.id : null;
            } else {
                const found = _.find(this.statuses, { name: "rejected" });
                found ? this.obj.approval.status_id = found.id : null;
            }
        },

        initialised() {
            this.obj.approval.is_approved = false;
        },

    },

    methods: {
        ...mapActions([
            "setInvestigationApprovalStatuses",
        ]),

        initialise() {
            this.setInvestigationApprovalStatuses();
            this.get();
        },

        navigate(url) {
            if (url) {
                this.page = url.substring(url.indexOf("page=")).split("page=")[1];

                this.get();
            }
        },

        get() {
            this.saveLoader = true;
            this.obj.get(this.page);
        },

        close() {
            this.dialog = false;
            this.dialogAdd = false;
            this.selected = null;
            this.obj.reset();
        },

        viewApprovals(item) {
            this.selected = item;
            this.dialog = true;
        },

        addApproval(item) {
            this.selected = item;
            this.obj.approval.investigation_id = item.id;
            this.obj.approval.approval_price = item.price;
            this.obj.approval.approval_amount = item.amount;
            this.dialogAdd = true;
        },

        save() {
            this.saveLoader = true;
            this.obj.save();
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped lang="scss">
    .pointer {
        cursor: pointer;
    }
</style>
