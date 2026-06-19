/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-23
* Time: 19:23
*/

<template>
    <v-dialog v-model="dialog" width="500" persistent>

        <v-card>
            <v-card-title class="headline  white--text green" primary-title>
                Authorize

                <v-spacer></v-spacer>

                <v-btn icon dark @click.native="close" absolute right>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text  class="px-5">

                <v-text-field
                        v-model="obj.authorization.required_amount"
                        label="Required Amount"
                        hide-details outline readonly
                ></v-text-field>

                <br/>

                <v-text-field
                        v-model="obj.authorization.authorized"
                        type="number"
                        label="Enter Authorize Amount"
                        hide-details outline
                ></v-text-field>    

            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-btn color="primary" flat @click="close">
                    Close
                </v-btn>

                <v-spacer></v-spacer>

                <v-btn color="green" dark @click="save">
                    Save
                </v-btn>

            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import AdmissionRequest from "@inpatient/libs/admission-requests/AdmissionRequest";

    export default {
        props: {
            show: {
                type: Boolean,
                required: true,
            },

            item: {
                required: true,
            },
        },

        data() {
            return {
                dialog: false,
                obj: new AdmissionRequest(),
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
                this.obj.authorize();
            },
        },

        mounted() {
            console.log(this.obj.authorization)
            this.dialog = this.show;
            this.obj.authorization.admission_request_id = this.item.id;
            this.obj.authorization.required_amount = this.item.authorization.amount;
        },
    };
</script>

<style scoped lang="scss">

</style>
