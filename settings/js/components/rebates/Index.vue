/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-15
* Time: 23:05
* Project: platform
*/

<template>

    <div>

        <v-card>
            <v-card-title primary-title>
                <h3 class="display-1 font-weight-light">Rebates</h3>

                <v-spacer></v-spacer>

                    <v-btn color="blue" dark @click="launch">
                        <v-icon>add</v-icon> Add Rebate
                    </v-btn>

                    <v-text-field
                            append-icon="search"
                            label="Search"
                            v-model="search"
                            class="ml-3"
                    >
                    </v-text-field>

            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="! initialised"></collabmed-loading>

                <div v-else>
                    <div v-if="list && list.data">
                        <v-data-table
                                :headers="headers"
                                :items="list.data"
                                :loading="saveLoader"
                                :search="search"
                        >
                            <template v-slot:item.scheme_name="{ item }">
                                { item.scheme ? item.scheme.full_name + " ~ " + item.scheme.company.name  : '-' }}
                            </template>
                            <template v-slot:item.facility_name="{ item }">
                                {{ item.clinic ? item.clinic.name : '-' }}
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn icon color="blue" dark small @click="edit(item)">
                                    <v-icon small>edit</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </div>

                </div>

            </v-card-text>
        </v-card>

        <!-- dialog -->
        <v-dialog v-model="dialog" max-width="500" persistent>
            <v-card>
                <v-card-title class="info white--text">
                    <div>
                        <p class="headline">Create a Rebate</p>
                        <span></span>
                    </div>
                </v-card-title>

                <v-card-text>

                    <rebate-form
                            :facilities="getFacilities.facilities"
                            :schemes="getSchemes.data"
                            :obj="obj"
                    ></rebate-form>

                </v-card-text>

                <v-card-actions>
                    <v-btn flat color="blue" @click="close">Close</v-btn>

                    <v-spacer></v-spacer>

                    <v-btn color="blue" dark @click="save">Save</v-btn>

                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Rebate from "@settings/libs/rebates/Rebate";
import RebateForm from "./partials/Form";

export default {
    components: {
        RebateForm,
    },

    data() {
        return {
            obj: new Rebate,
            dialog: false,
            search: "",
            selected: null,
            saveLoader: false,
            headers: [
                { text: "#", value: "id" },
                { text: "Scheme", value: "scheme_name" },
                { text: "Facility", value: "facility_name" },
                { text: "Amount", value: "amount" },
                { text: "Notes", value: "notes" },
                { text: "Action", value: "actions" },
            ],
        };
    },

    computed: {
        ...mapGetters([
            "getFacilities", "getSchemes",
        ]),

        list() {
            return this.obj.rebates;
        },

        meta() {
            return this.list.meta;
        },

        links() {
            return this.list.links;
        },

        initialised() {
            return this.getFacilities && this.list;
        },

        saved() {
            return this.obj.saved;
        },

    },

    watch: {
        saved(val) {
            if (val) {
                this.saveLoader = false;
                this.obj.form.submitted = false;
                this.close();
                this.obj.get();
            }
        },
    },

    methods: {
        ...mapActions([
            "setFacilities", "setSchemes",
        ]),

        initialise() {
            this.setFacilities();
            this.setSchemes();

            this.obj.get();
        },

        launch() {
            this.selected = null;
            this.obj.facility_id = null;
            this.obj.insurance_id = null;
            this.obj.amount = null;
            this.obj.notes = null;

            this.dialog = true;
        },

        close() {
            this.dialog = false;
        },

        save() {
            this.saveLoader = true;

            this.selected ? this.obj.update(this.selected.id) : this.obj.save();
        },

        edit(item) {
            this.selected = item;
            this.obj.facility_id = item.facility_id;
            this.obj.scheme_id = item.scheme_id;
            this.obj.amount = item.amount;
            this.obj.notes = item.notes;

            this.dialog = true;
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped lang="scss">

</style>
