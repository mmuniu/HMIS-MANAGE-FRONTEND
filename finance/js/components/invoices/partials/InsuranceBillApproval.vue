<template>
    <v-dialog v-model="dialog" width="600" persistent>

        <template v-slot:activator="{ on }">
            <v-btn color="primary" small dark v-on="on">
                approve
            </v-btn>
        </template>

        <v-card>

            <v-card-title class="headline primary white--text" primary-title>

                <span>Insurance bill approval</span>

                <v-spacer></v-spacer>

                <v-btn icon dark @click.native="dialog = false" absolute right>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text>
                <p class="grey--text">Indicate the approved amount by the insurance and mark the procedure as approved</p>

                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="record.amount" label="Approved amount" type="number"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="record.quantity" label="Approved quantity" type="number"></v-text-field>
                    </v-col>
                </v-row>

                <v-btn small color="primary" @click="approve()">mark as approved</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    props: [
        'item',
    ],

    data: () => ({
        dialog: false,
        record: null,
    }),

    methods: {
        approve() {
            window.open(`/evaluation/investigations/update-insurance-approval/${this.record.id}?amount=${this.record.amount}&quantity=${this.record.quantity}`, '_self');
        },
    },

    mounted() {
        this.record = JSON.parse(this.item);
    }
};
</script>
