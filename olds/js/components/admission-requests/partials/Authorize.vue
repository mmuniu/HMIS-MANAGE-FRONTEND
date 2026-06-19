<template>
    <v-dialog v-model="dialog" width="500" persistent>

        <v-card>
            <v-card-title class="headline  white--text primary" primary-title>
                Authorize

                <v-spacer></v-spacer>

                <v-btn icon dark @click.native="close" absolute right>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text  class="px-5">

                <v-text-field
                        v-model="authorize_data.required_amount"
                        label="Required Amount"
                        hide-details outline readonly
                ></v-text-field>

                <br/>

                <v-text-field
                        v-model="authorize_data.authorized_amount"
                        type="number"
                        label="Enter Authorize Amount"
                        hide-details outline
                ></v-text-field>

            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-btn color="primary" dark @click="save">
                    Save
                </v-btn>

            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: {
            show: {
                type: Boolean,
                required: true,
            },

            requiredAmount: {
                required: true
            },

            itemId: {
                required: true
            }
        },

        data() {
            return {
                dialog: false,
                authorize_data: {
                    authorized_amount: null,
                    required_amount: null,
                    item_id: null,
                }
            };
        },

        computed: {
            saved() {
                return this.obj.saved;
            },
        },

        watch: {
            show(val) {
                this.dialog = val;
            },
        },

        methods: {
            close() {
                this.dialog = false;
                this.$emit("close");
            },

            save() {
                this.$emit('save', this.authorize_data)
            },
        },

        mounted() {
            this.dialog = this.show;
            this.authorize_data.required_amount = this.requiredAmount;
            this.authorize_data.item_id = this.itemId;
        },
    };
</script>

<style scoped lang="scss">

</style>
