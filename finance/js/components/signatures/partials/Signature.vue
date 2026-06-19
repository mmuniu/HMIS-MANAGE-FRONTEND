<template>
    <div>
        <v-tabs v-model="tabs">
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
                            <iframe class="signature-pad-iframe"
                                    :src="signaturePadUrl()"
                                    allowfullscreen>
                            </iframe>
                        </div>

                    </v-card-text>
                </v-card>
            </v-tab-item>

            <v-tab-item :value="'online-signature'">
                <v-card flat>
                    <v-card-text>
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

        instance: {
            default: 'invoice',
            type: String,
        },

        instanceId: {
            default: null,
        }
    },

    data() {
        return {
            hidden: true,
            disabled: false,
            loading: false,
            initialised: false,
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

    methods: {
        save() {
            this.disabled = true;
            this.loading = true;
            const _this = this;
            // var png = _this.$refs.signature.save()
            const jpeg = _this.$refs.signature.save('image/jpeg');
            // var svg = _this.$refs.signature.save('image/svg+xml');

            this.$emit('imageSaved', jpeg);
        },

        signaturePadUrl() {
            return route('finance.iframes.signature-pad', {
                instanceId: this.instanceId,
                instance: this.instance,
            });
        },

        clear() {
            const _this = this;
            _this.$refs.signature.clear();
        },

        undo() {
            const _this = this;
            _this.$refs.signature.undo();
        },
    }
}
</script>
<style scoped>
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
