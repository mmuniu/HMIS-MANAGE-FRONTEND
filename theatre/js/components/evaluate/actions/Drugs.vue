<template>
    <div>
        <v-card>
            <v-card-text>
                <v-row>
                    <v-col>
                        <prescribe-drugs is-of-type="theatre"
                                         :visit-id="parseInt(visitId)"
                                         :show-for-admission="true">
                        </prescribe-drugs>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <v-row class="mt-4">
            <v-col>
                <evaluation-prescriptions-index
                    :visit-id="parseInt(visitId)">
                </evaluation-prescriptions-index>
            </v-col>
        </v-row>
    </div>
</template>
<script>
export default {
    props: ['visitId', 'paymentMode'],
}
</script>
