<template>
    <div>
        <v-tooltip bottom>
            <v-btn small slot="activator" :disabled="verified === 1" color="primary" @click="verifyDaysCharges()">Verify the days bills</v-btn>

            <span>Ensure that indeed this bills are correct</span>
        </v-tooltip>

        <v-btn small disabled v-if="verified">
            verified by: {{ getVerifier() }}
        </v-btn>
    </div>
</template>
<script>
import Chargesheet from "@inpatient/libs/chargesheet/Chargesheet";

export default {
    props: [
        "visitId", "date", "dayVerified", "verifications",
    ],

    data: () => ({
        chargesheet: new Chargesheet(),
        verified: false,
        verifier: null,
    }),

    methods: {
        async verifyDaysCharges() {
            const response = await this.chargesheet.verifyDaysCharges(this.visitId, this.date);

            if (response) {
                this.verified = true;

                this.verifier = response.verifier;
            }
        },

        getVerifier() {
            return this.verifier ? this.verifier : this.verifications ? JSON.parse(this.verifications)[this.date] : null;
        },
    },

    mounted() {
        this.verified = this.dayVerified != "" ? this.dayVerified : false;
    },
};
</script>
