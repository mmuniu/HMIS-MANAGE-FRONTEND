<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="text-bold grey--text text--darken-1">
            List of all partner institutions
            <v-spacer></v-spacer>


            <v-dialog v-model="dialog" persistent max-width="40%">
                <template v-slot:activator="{ on }">
                    <v-btn small color="primary"  v-on="on">Add member</v-btn>
                </template>
                <v-card>
                    <v-card-title class="headline primary" v-if="!editing">Add member</v-card-title>
                    <v-card-title class="headline primary" v-else>Update staff details</v-card-title>
                    <v-card-text>
                        <v-row >
                            <v-col class="mx-4" cols="12" md="5" >
                                <div class="mx-3">
                                    <v-text-field label="Full Name" v-model="partnerInstitution.staff.full_name" required outline></v-text-field>
                                </div>
                            </v-col>

                            <v-col class="mx-4" cols="12" md="5" >
                                <div class="mx-3">
                                    <v-text-field label="Mobile" v-model="partnerInstitution.staff.mobile" required outline></v-text-field>
                                </div>
                            </v-col>
                        </v-row>
                        <v-row >
                            <v-col class="mx-4" cols="12" md="5" >
                                <div class="mx-3">
                                    <v-text-field label="Email Address" type="email" v-model="partnerInstitution.staff.email" required outline></v-text-field>
                                </div>
                            </v-col>

                            <v-col class="mx-4" cols="12" md="5" >
                                <div class="mx-3">
                                    <v-text-field label="Postal Address" v-model="partnerInstitution.staff.postal_address" outline></v-text-field>
                                </div>
                            </v-col>
                        </v-row>
                        <v-row >
                            <v-col class="mx-4" cols="12" md="5" >
                                <div class="mx-3">
                                    <v-text-field label="Position" v-model="partnerInstitution.staff.position" required outline></v-text-field>
                                </div>
                            </v-col>

                            <v-col class="mx-4" cols="12" md="5" >
                                <div class="mx-3">
                                    <v-select label="Salutation" :items="['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']" v-model="partnerInstitution.staff.salutation" outline></v-select>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="error darken-1" @click="closeDialog()">Cancel</v-btn>
                        <v-btn color="primary darken-1" @click.once="saveStaff()" v-if="!editing">save</v-btn>
                        <v-btn color="primary darken-1" @click.once="updateStaffData()" v-else>update</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="headers" :items="staff.data"
                    class="mb-3" flat
            >
                <template v-slot:item.actions="{ item }">
                    <v-btn slot="activator" class="mx-0 cyan" @click="editMemberData(item)" dark small>
                        edit
                    </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import PartnerInstitution from "@evaluation/libs/setup/partner_institutions/PartnerInstitution";

export default {
    props: [
        "partner",
    ],

    data: () => ({
        dialog: false,
        partnerInstitution: new PartnerInstitution(),
        headers: [
            { text: "Name", value: "name" },
            { text: "Email", value: "address" },
            { text: "Mobile", value: "mobile" },
            { text: "Position", value: "position" },
            { text: "Actions", value: "actions" },
        ],
    }),

    computed: {
        ...mapGetters({
            staff: "getInstitutionStaff",
        }),

        initialised() {
            return !!this.staff;
        },

        institution() {
            return JSON.parse(this.partner);
        },
    },

    methods: {
        ...mapActions([
            "setInstitutionStaff",
        ]),

        editMemberData(member) {
            this.editing = true;
            this.partnerInstitution.assembleMember(member, this.institution.id);
            this.dialog = true;
        },

        updateStaffData() {
            this.partnerInstitution.updateSatff().then((response) => {
                this.initialise();
                this.dialog = false;
            });
        },

        saveStaff() {
            this.partnerInstitution.addStaff().then((response) => {
                this.initialise();
                this.dialog = false;
            });
        },

        closeDialog() {
            this.dialog = false;
            this.editing = false;
            this.partnerInstitution.assembleMember(null, this.institution.id);
        },

        initialise() {
            this.setInstitutionStaff({
                params: {
                    institution_id: this.institution.id,
                },
            });

            this.partnerInstitution.staff.institution_id = this.institution.id;
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>
