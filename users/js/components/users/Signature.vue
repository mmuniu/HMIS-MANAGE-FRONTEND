<template>
    <div>
        <v-card-text>
            <!-- TODO:: move this to an iframe for simplicity/avoid errors -->

            <h5 class="title">Sign in the box below <small>(Use a stylus)</small></h5>

            <div class="signature-holder">
                <vueSignature ref="signature"  :w="width" :h="height" class="elevation-4"></vueSignature>
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
    </div>
</template>
<script>
import User from "@users/libs/users/User";

export default {
    props: [
        "userdata",
    ],

    data: () => ({
        disabled: false,
        loading: false,
        user: new User(),
        width: "400px",
        height: "200px",
    }),

    computed: {
        userInfo() {
            return JSON.parse(this.userdata);
        },
    },

    methods: {
        async save() {
            this.disabled = true;
            this.loading = true;
            const _this = this;
            const jpeg = _this.$refs.signature.save("image/jpeg");

            this.user.patient_signature = jpeg;

            const response = await this.user.updateSignature(this.userInfo.id);

            if (response) {
                this.disabled = false;
                this.loading = false;
                window.location.reload();
            }
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
};
</script>
