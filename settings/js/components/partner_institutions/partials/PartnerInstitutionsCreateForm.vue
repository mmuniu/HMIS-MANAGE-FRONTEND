<template>
    <form @submit.prevent="!partner ? savePartner() : updatePartner()">
        <v-row >
            <v-col class="mr-4" cols="12" md="5" >
                <div class="mx-3">
                    <v-text-field label="partner institution name" v-model="partnerInstitution.name" required outline></v-text-field>
                </div>
            </v-col>

            <v-col class="ml-4" cols="12" md="5" >
                <div class="mx-3">
                    <v-text-field label="Postal code" v-model="partnerInstitution.post_code" required outline></v-text-field>
                </div>
            </v-col>
        </v-row>

        <v-row >
            <v-col class="mr-4" cols="12" md="5" >
                <div class="mx-3">
                    <v-text-field label="Postal Address" v-model="partnerInstitution.address" required outline></v-text-field>
                </div>
            </v-col>

            <v-col class="ml-4" cols="12" md="5" >
                <div class="mx-3">
                    <v-text-field label="City/Town" v-model="partnerInstitution.town" required outline></v-text-field>
                </div>
            </v-col>
        </v-row>

        <v-row >
            <v-col class="mr-4" cols="12" md="5" >
                <div class="mx-3">
                    <v-text-field label="Telephone" v-model="partnerInstitution.telephone" required outline></v-text-field>
                </div>
            </v-col>

            <v-col class="ml-4" cols="12" md="5" >
                <div class="mx-3">
                    <v-text-field label="Street" v-model="partnerInstitution.street" outline></v-text-field>
                </div>
            </v-col>
        </v-row>

        <v-row >
            <v-col class="mr-4" cols="12" md="5" >
                <div class="mx-3">
                    <v-text-field label="Mobile Number" v-model="partnerInstitution.mobile" required outline></v-text-field>
                </div>
            </v-col>

            <v-col class="ml-4" cols="12" md="5" >
                <div class="mx-3">
                    <v-text-field label="Building" v-model="partnerInstitution.building" outline></v-text-field>
                </div>
            </v-col>
        </v-row>

        <v-row >
            <v-col class="mr-4" cols="12" md="5" >
                <div class="mx-3">
                    <v-text-field label="Email Address" v-model="partnerInstitution.email" required outline></v-text-field>
                </div>
            </v-col>

            <v-col class="ml-4" cols="12" md="5" >
                <div class="mx-3">
                    <v-text-field label="Fax No" v-model="partnerInstitution.fax" outline></v-text-field>
                </div>
            </v-col>
        </v-row>

        <v-row  class="mr-5">
            <v-col offset-md="9" cols="12" md="2" class="text-right">
                <div class="mx-2">
                    <v-btn v-if="!partner" type="submit" class="blue lighten-1" color="blue" large
                           :dark="!loader" :loading="loader" :disabled="loader">
                        Save
                    </v-btn>

                    <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                           :dark="!loader" :loading="loader" :disabled="loader">
                        update
                    </v-btn>
                </div>
            </v-col>
        </v-row>
    </form>
</template>

<script>
import { mapActions } from "vuex";
import PartnerInstitution from "@evaluation/libs/setup/partner_institutions/PartnerInstitution";

export default {
    props: [
        "partner",
    ],

    data() {
        return {
            partnerInstitution: new PartnerInstitution(),
            loader: false,
        };
    },

    watch: {
        contaminated(value) {
            if (value) {
                this.loader = false;
                this.partnerInstitution.form.errorDetected = false;
            }
        },

        submitted(value) {
            if (value) {
                this.loader = false;
                this.partnerInstitution.form.submitted = false;
                this.setPartnerInstitutions();
            }
        },
    },

    computed: {
        errors() {
            return this.partnerInstitution.form.errors;
        },

        submitted() {
            return this.partnerInstitution.form.submitted;
        },

        contaminated() {
            return this.partnerInstitution.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setPartnerInstitutions",
        ]),

        savePartner() {
            this.loader = true;
            this.partnerInstitution.save();
        },

        updatePartner() {
            this.loader = true;
            this.partnerInstitution.update(this.partner.id);
        },

        initializePage() {
            const partner = this.partner;

            if (partner) {
                this.partnerInstitution.assemble(partner);
            }
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
