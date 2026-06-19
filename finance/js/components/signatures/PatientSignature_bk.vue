<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 18/11/2018
* Time: 09:40
* Project: platform
-->
<template>
    <v-row v-if="selectedInvoice">
        <v-col sm="3">
            <h5 class="title">Patient Signature</h5>

            <div v-if="selectedInvoice.has_patient_signature">
                <img :src="selectedInvoice.patient_signature" alt="signature" class="img-fluid elevation-4 patient-signature">
            </div>

            <div v-else>
                <p class="red--text">No Signature Found!</p>
            </div>

        </v-col>

        <v-col sm="9" v-if="!selectedInvoice.has_patient_signature">
            <div v-if="choice == 'canvas'">
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
            </div>

            <div v-else>
                <h5 class="title">Sign via the Signature Pad</h5>
                <v-btn color="primary" dark @click="promptPadSignature()">
                    Prompt Signature Input
                </v-btn>

                <p id="status">Not connected</p>

                <div class="elavation-5 pad-container">
                    <p id="chek_boxes_selectedElementsLable" style="font-weight:bold;">Number of selection elements:</p>

                    <select id="chek_boxes_selectedElements" >
                        <option value="1" selected>1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>

                    <!-- the listboxes -->
                    <table>
                        <thead>
                            <tr>
                                <th>Mode:</th>
                                <th>Pad Types:</th>
                            </tr>
                        </thead>
                        <tr>
                            <td>
                                <select name="ModeListName" id="ModeList" size="2"  onchange="ModeListName_onchange()">
                                    <option value="Default" selected>Default mode</option>
                                    <option value="API">API mode</option>
                                </select>
                            </td>
                            <td>
                                <select name="PadTypeListName" id="PadTypeList" size="2">
                                    <option value="USB" selected>signotec signature HID pad</option>
                                    <option value="Serial">signotec signature Serial pad</option>
                                </select>
                            </td>
                        </tr>
                    </table>

                    <!-- the pad properties -->
                    <table>
                        <tr>
                            <td>
                                <p style="font-weight:bold;">Pad Type:</p>
                            </td>
                            <td>
                                <p id="PadType_0" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p style="font-weight:bold;">Serial Number:</p>
                            </td>
                            <td>
                                <p id="SerialNumber_0" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p style="font-weight:bold;">Firmware Version:</p>
                            </td>
                            <td>
                                <p id="FirmwareVersion_0" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p style="font-weight:bold;">RSA Support:</p>
                            </td>
                            <td>
                                <p id="RSASupport_0" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p style="font-weight:bold;">Cert. ID:</p>
                            </td>
                            <td>
                                <p id="CertID_0" />
                            </td>
                        </tr>
                    </table>

                    <!-- the check boxes -->
                    <table>
                        <tr>
                            <td><p style="font-weight:bold;">Nr.</p></td>
                            <td><p style="font-weight:bold;">Field ID</p></td>
                            <td><p style="font-weight:bold;">Text</p></td>
                            <td><p style="font-weight:bold;">Status</p></td>
                            <td><p style="font-weight:bold;">Required field</p></td>
                        </tr>
                        <tr>
                            <td><p id="fieldNumber1">1</p></td>
                            <td><input id="fieldID1" type="text" value="fieldID1"></td>
                            <td><input id="fieldText1" type="text" value="Here is the first text"></td>
                            <td><input id="fieldChecked1" type="checkbox" value="fieldChecked1"></td>
                            <td><input id="fieldRequired1" type="checkbox" value="fieldRequired1"></td>
                        </tr>
                        <tr>
                            <td><p id="fieldNumber2">2</p></td>
                            <td><input id="fieldID2" type="text" value="fieldID2"></td>
                            <td><input id="fieldText2" type="text" value="Here is the second text"></td>
                            <td><input id="fieldChecked2" type="checkbox" value="fieldChecked2"></td>
                            <td><input id="fieldRequired2" type="checkbox" value="fieldRequired2"></td>
                        </tr>
                        <tr>
                            <td><p id="fieldNumber3">3</p></td>
                            <td><input id="fieldID3" type="text" value="fieldID3"></td>
                            <td><input id="fieldText3" type="text" value="Here is the third text"></td>
                            <td><input id="fieldChecked3" type="checkbox" value="fieldChecked3"></td>
                            <td><input id="fieldRequired3" type="checkbox" value="fieldRequired3"></td>
                        </tr>
                        <tr>
                            <td><p id="fieldNumber4">4</p></td>
                            <td><input id="fieldID4" type="text" value="fieldID4"></td>
                            <td><input id="fieldText4" type="text" value="Here is the fourth text"></td>
                            <td><input id="fieldChecked4" type="checkbox" value="fieldChecked4"></td>
                            <td><input id="fieldRequired4" type="checkbox" value="fieldRequired4"></td>
                        </tr>
                        <tr>
                            <td><p id="fieldNumber5">5</p></td>
                            <td><input id="fieldID5" type="text" value="fieldID5"></td>
                            <td><input id="fieldText5" type="text" value="Here is the fifth text"></td>
                            <td><input id="fieldChecked5" type="checkbox" value="fieldChecked5"></td>
                            <td><input id="fieldRequired5" type="checkbox" value="fieldRequired5"></td>
                        </tr>
                    </table>

                    <!-- the select of signature color -->
                    <table>
                        <tr>
                            <td>
                                <p id="signatureColorLabel" style="font-weight:bold;">Signature Color:</p>
                            </td>
                            <td>
                                <select id="signaturePenColorSelect">
                                    <option name="signaturePenColorBlack" value="0x00000000" selected>black</option>
                                    <option name="signaturePenColorGrey" value="0x007f7f7f">grey</option>
                                    <option name="signaturePenColorRed" value="0x000000ff">red</option>
                                    <option name="signaturePenColorGreen" value="0x0000ff00">green</option>
                                    <option name="signaturePenColorBlue" value="0x00ff0000">blue</option>
                                </select>
                            </td>
                        </tr>
                    </table>

                    <!-- the log string -->
                    <ul id="log"></ul>

                    <!-- the canvas, img and textarea elements to show the signature, signature image and the SignData as Base64 string -->
                    <table>
                        <thead>
                            <tr>
                                <th style="text-align:left;">Live Signature:</th>
                                <th style="text-align:left;">Signature Image:</th>
                                <th style="text-align:left;">SignData as Base64 string:</th>
                            </tr>
                        </thead>
                        <tr>
                            <td>
                                <canvas id="sigCanvas" width="640" height="480"></canvas>
                            </td>
                            <td style="width:320; height:160; border:1px solid black;">
                                <img id="Signature_0" alt="Signature 0" src="White.png" />
                            </td>
                            <td style="width:160; height:160; border:1px solid black;">
                                <textarea id="SignData_0" rows="30" cols="40" readonly="readonly" style="border-style:hidden; resize:none;"></textarea>
                            </td>
                        </tr>
                    </table>

                </div>
            </div>

        </v-col>

    </v-row>
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
            choice: 'pad', // pad or canvas
            invoice: new Invoice(),
            option: {
                penColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(255,255,255)',
            },
        };
    },

    computed: {
        selectedInvoice() {
            return this.invoice.selectedInvoice;
        },
    },

    watch: {
        selectedInvoice(val) {
            if (val) {
                this.setUpPad();
            }
        },
    },

    methods: {
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

        setUpPad() {
            if (this.choice == 'pad') {
                const plugin = document.createElement('script');
                plugin.setAttribute(
                    'src',
                    '/modules/finance/js/SignaturePad.js',
                );
                plugin.async = true;
                document.head.appendChild(plugin);
            }
        },

        promptPadSignature() {
            onMainWindowLoad();

            clearSignature();

            getSignature();
        },
    },

    mounted() {
        // this.signaturePad.clearSignature()
        this.invoice.find(this.invoiceId);
    },

    beforeDestroy() {
        if (this.choice == 'pad') {
            close_pad();
        }
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
</style>
