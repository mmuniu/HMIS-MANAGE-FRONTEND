<template>
    <div>
        <v-row>
            <v-col>
                <inpatient-consumables-create :payment-mode="paymentMode"
                                              :visit-id="visitId">
                </inpatient-consumables-create>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <inpatient-consumables-index :payment-mode="paymentMode"
                                             :visit-id="visitId">
                </inpatient-consumables-index>
            </v-col>
        </v-row>
    </div>
</template>
<script>
export default {
    props: ['visitId', 'paymentMode'],
}
</script>
