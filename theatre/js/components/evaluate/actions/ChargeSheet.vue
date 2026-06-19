<template>
    <v-card flat>
        <v-card-title>
            Theatre Chargesheet

            <v-spacer></v-spacer>

            <v-btn small color="primary" @click="processBill()">Process invoices</v-btn>
        </v-card-title>

        <collabmed-loading v-if="!chargesheet"></collabmed-loading>

        <v-card-text v-else>
            <h5>Ward/Operating room charges</h5>
            <div>
                <p class="display-inline headers" style="width: 30%">Name</p>
                <p class="display-inline headers" style="width: 20%">Rate</p>
                <p class="display-inline headers" style="width: 20%">Minutes</p>
                <p class="display-inline headers" style="width: 20%">Total</p>
            </div>

            <div>
                <p class="display-inline" style="width: 30%">{{ chargesheet.theatreBill.name }}</p>
                <p class="display-inline" style="width: 20%">{{ chargesheet.theatreBill.rate }}</p>
                <p class="display-inline" style="width: 20%">{{ chargesheet.theatreBill.minutes }}</p>
                <p class="display-inline" style="width: 20%">{{ chargesheet.theatreBill.total }}</p>
            </div>


            <h3 class="mt-4">Drugs/Prescriptions charges</h3>
            <div>
                <p class="display-inline headers" style="width: 30%">Name</p>
                <p class="display-inline headers" style="width: 20%">Quantity</p>
                <p class="display-inline headers" style="width: 20%">Price</p>
                <p class="display-inline headers" style="width: 20%">Total</p>
            </div>

            <div v-if="chargesheet.prescriptionsBill.length > 0"  v-for="(drug, index) in chargesheet.prescriptionsBill" :key="index">
                <p class="display-inline" style="width: 30%">{{ drug.drug }}</p>
                <p class="display-inline" style="width: 20%">{{ drug.dose }}</p>
                <p class="display-inline" style="width: 20%">{{ drug.price }}</p>
                <p class="display-inline" style="width: 20%">{{ drug.total }}</p>
            </div>



            <h3 class="mt-4">Consumables charges</h3>
            <div>
                <p class="display-inline headers" style="width: 30%">Name</p>
                <p class="display-inline headers" style="width: 20%">Quantity</p>
                <p class="display-inline headers" style="width: 20%">Price</p>
                <p class="display-inline headers" style="width: 20%">Total</p>
            </div>

            <div v-if="chargesheet.consumables.length > 0" v-for="(consumable, index) in chargesheet.consumables" :key="index">
                <p class="display-inline" style="width: 30%">{{ consumable.name }}</p>
                <p class="display-inline" style="width: 20%">{{ consumable.quantity }}</p>
                <p class="display-inline" style="width: 20%">{{ consumable.price }}</p>
                <p class="display-inline" style="width: 20%">{{ consumable.total }}</p>
            </div>



            <h3 class="mt-4">Clinician charges</h3>
            <div>
                <p class="display-inline headers" style="width: 30%">Name</p>
                <p class="display-inline headers" style="width: 20%">Rate/min</p>
                <p class="display-inline headers" style="width: 20%">Time (in mins)</p>
                <p class="display-inline headers" style="width: 20%">Charges</p>
            </div>

            <div v-if="chargesheet.medicsBill.length > 0"  v-for="(medic, index) in chargesheet.medicsBill" :key="index">
                <p class="display-inline" style="width: 30%">{{ medic.name }}</p>
                <p class="display-inline" style="width: 20%">{{ medic.rate }}</p>
                <p class="display-inline" style="width: 20%">{{ medic.time }}</p>
                <p class="display-inline" style="width: 20%">{{ medic.total }}</p>
            </div>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
    props: [
        'visitId', 'paymentMode'
    ],

    computed: {
        ...mapGetters({
            chargesheet: 'getTheatreChargeSheet'
        }),
    },

    methods: {
        ...mapActions([
            'setTheatreChargeSheet'
        ]),

        processBill () {
            window.open(`/finance/split-bill/${this.visitId}`, '_blank');
        }
    },

    mounted () {
        this.setTheatreChargeSheet({
            params: {
                operation_id: this.$route.params.operationId
            }
        })
    }
}
</script>
<style scoped>
h3 {
    margin-top: 40px !important
}

input[type=number] {
    padding: 7px 15px;
    margin: 3px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

.headers {
    font-size: 16px;
    font-weight: 400;
}
.display-inline {
    display: inline-block;
    padding-left: 20px;
    padding: 7px 7px;
    margin: 3px 0;
}
</style>
