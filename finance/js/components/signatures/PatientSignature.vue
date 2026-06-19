<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 18/11/2018
* Time: 09:40
* Project: platform
-->
<template>
    <div v-if="selectedInvoice" class="elevation-3 px-4 py-4">
        <h5 class="title">Patient Signature</h5>
        <v-divider></v-divider>

        <div v-if="selectedInvoice.has_patient_signature">
            <img :src="selectedInvoice.patient_signature" alt="signature" class="img-fluid elevation-4 patient-signature">
        </div>

        <div v-else>
            <p class="red--text">No Signature Found!</p>
        </div>

        <v-tabs v-model="tabs"
            color="transparent"
            slider-color="blue"
            v-if="!selectedInvoice.has_patient_signature"
        >
            <v-tab ripple href="#signature-pad">
                Signature Pad Device
            </v-tab>
            <v-tab ripple href="#online-signature">
                Online Signature
            </v-tab>

            <v-tab-item :value="'signature-pad'">
                <v-card flat>
                    <v-card-text>
                        <h5 class="title">Sign via the Signature Pad</h5>

                        <div class="w-100">
                            <iframe class="signature-pad-iframe" :src="signaturePadUrl()" allowfullscreen></iframe>
                        </div>

                    </v-card-text>
                </v-card>
            </v-tab-item>

            <v-tab-item :value="'online-signature'">
                <v-card flat>
                    <v-card-text>
                        <!-- TODO:: move this to an iframe for simplicity/avoid errors -->

                        <h5 class="title">Sign in the box below <small>(Use a stylus)</small></h5>

                        <div class="signature-holder">
                            <vueSignature ref="signature" :sigOption="option" :w="width" :h="height" class="elevation-4"></vueSignature>
                        </div>

                        <div class="signature-actions">
                            <v-row>
                                <v-col>
                                    <v-btn color="link" small @click="clear" :disabled="disabled">
                                        Clear
                                    </v-btn>
                                    <v-btn color="info" small @click="undo" :disabled="disabled">
                                        Undo
                                    </v-btn>

                                    <v-btn color="success" small @click="save" :disabled="disabled" :loading="loading">
                                        Save
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </div>

                    </v-card-text>
                </v-card>
            </v-tab-item>

        </v-tabs>

    </div>
</template>

<script>

import Invoice from '@finance/libs/invoices/Invoice';

export default {
    props: {
        width: {
            default: '700px',
            type: String,
        },
        height: {
            default: '300px',
            type: String,
        },
        invoiceId: {
            required: true,
        },
    },

    data() {
        return {
            hidden: true,
            disabled: false,
            loading: false,
            initialised: false,
            invoice: new Invoice(),
            option: {
                penColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(255,255,255)',
            },

            tabs: [
                { text: 'Signature Pad Device', value: 'signature-pad' },
                { text: 'Online Signature', value: 'online-signature' },
            ],
        };
    },

    computed: {
        selectedInvoice() {
            return this.invoice.selectedInvoice;
        },
    },

    methods: {
        next() {
            const active = parseInt(this.active);
            this.active = (active < 2 ? active + 1 : 0);
        },

        save() {
            this.disabled = true;
            this.loading = true;
            const _this = this;
            // var png = _this.$refs.signature.save()
            const jpeg = _this.$refs.signature.save('image/jpeg');
            // var svg = _this.$refs.signature.save('image/svg+xml');

            this.invoice.patient_signature = jpeg;
            this.invoice.updateSignature(this.selectedInvoice.id);
        },

        clear() {
            const _this = this;
            _this.$refs.signature.clear();
        },

        undo() {
            const _this = this;
            _this.$refs.signature.undo();
        },

        signaturePadUrl() {
            return route('finance.iframes.signature-pad', this.selectedInvoice.id);
        },
    },

    mounted() {
        this.invoice.find(this.invoiceId);
    },
};
</script>

<style>
    .hide {
        display: none;
    }
    .show {
        display: block;
    }
    .patient-signature {
        max-height: 150px;
    }
    .signature-pad-iframe {
        width: 100%;
        min-height: 500px;
    }
</style>
