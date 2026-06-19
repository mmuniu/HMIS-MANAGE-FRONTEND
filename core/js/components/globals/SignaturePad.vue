<template>
    <div>
        <h5 class="title">Sign in the box below <small>(Use a stylus)</small></h5>

        <div>
            <vueSignature ref="signature" :sigOption="option" :w="width" :h="height" class="elevation-4"></vueSignature>
        </div>

        <div>
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
</template>

<script>

import Invoice from "@finance/libs/invoices/Invoice";

export default {
    props: {
        width: {
            default: "700px",
            type: String,
        },
        height: {
            default: "300px",
            type: String,
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
                penColor: "rgb(0, 0, 0)",
                backgroundColor: "rgb(255,255,255)",
            },
        };
    },

    methods: {
        save() {
            const _this = this;
            const svg = _this.$refs.signature.save("image/svg+xml");
            this.$emit("signed", svg);
        },

        clear() {
            const _this = this;
            _this.$refs.signature.clear();
        },

        undo() {
            const _this = this;
            _this.$refs.signature.undo();
        },
    },

    mounted() {
        this.invoice.find(this.invoiceId);
    },
};
</script>
