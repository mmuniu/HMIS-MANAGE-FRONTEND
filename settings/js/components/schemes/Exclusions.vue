/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-05-18
* Time: 15:04
*/

<template>
    <div>
        <v-card flat color="#ecf0f5">
            <v-card-title>
                <h2 class="headline">Scheme | <span v-if="selected">{{ selected.name | ucwords }}</span></h2>

                <v-spacer></v-spacer>

                <v-tooltip top>
                    <v-btn color="teal" dark :loading="saveLoader" @click="duplicate(selected)" slot="activator">
                        Copy Scheme Exclusions <v-icon>file_copy</v-icon>
                    </v-btn>
                    <span>Copy Scheme Exclusions to another Insurance Scheme</span>
                </v-tooltip>

            </v-card-title>

            <v-card-text>
                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>

                    <v-row class="row-fluid flex" >
                        <v-col cols="12" sm="7">

                            <div class="elevation-3 px-3 py-3 white">
                                <h4 class="title">Add an Exclusion</h4>
                                <exclusions-form :obj="obj"></exclusions-form>
                            </div>

                        </v-col>

                        <v-col cols="12" sm="5">
                            <div class="px-3">
                                <h4 class="title">Existing exclusions for the Scheme</h4>

                                <div v-if="selected.exclusions && selected.exclusions.length > 0">

                                    <v-row  v-for="(item, index) in selected.exclusions" :key="index">
                                        <v-col cols="1" md="1">
                                            <h4 class="ml-2">{{ index + 1 }}.</h4>
                                        </v-col>
                                        <v-col cols="8" sm="9">
                                            <h5 class="title" v-if="item.procedure">{{ item.procedure.name }}</h5>
                                            <h5 class="title" v-if="item.product">{{ item.product.name }}</h5>
                                            <p>
                                                {{ item.price | numberFormat }}
                                                <br>
                                                <small v-if="item.facility"><strong>Facility:</strong> {{ item.facility.name }}</small>
                                            </p>
                                        </v-col>
                                        <v-col cols="3" md="2">
                                            <v-btn fab color="primary" small :loading="saveLoader" @click="edit(item)">
                                                <v-icon>edit</v-icon>
                                            </v-btn>
                                        </v-col>

                                        <v-col cols="12" md="12">
                                            <v-divider inset></v-divider>
                                        </v-col>

                                    </v-row>
                                </div>

                                <v-alert v-else type="info" :value="true" outline>
                                    No exclusions found
                                </v-alert>
                            </div>
                        </v-col>
                    </v-row>

                </div>
            </v-card-text>
        </v-card>

        <!--edit modal-->
        <v-dialog v-model="dialog" max-width="500" persistent>
            <v-card v-if="editedExclusion.id">
                <v-card-title class="info white--text">
                    <div>
                        <p class="headline">Update {{ editedExclusion.friendly_name }}</p>
                        <span></span>
                    </div>
                </v-card-title>

                <v-card-text>

                    <v-text-field
                            label="Exclusion Price"
                            v-model="editedExclusion.price"
                            class=""
                            min="0"
                            type="number"
                            :error="errors.has('price')" outline
                            :hint="errors.get('price')" persistent-hint
                    >
                    </v-text-field>

                </v-card-text>

                <v-card-actions>
                    <v-btn flat color="blue" @click="close">Close</v-btn>

                    <v-spacer></v-spacer>

                    <v-btn color="blue" dark @click="update" :loading="saveLoader">Update</v-btn>

                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--duplicate modal -->
        <v-dialog v-model="dialogDuplicate" max-width="500" persistent>
            <v-card v-if="schemes && facilities">
                <v-card-title class="info white--text">
                    <div>
                        <p class="headline">Duplicate Scheme Exclusions</p>
                        <span></span>
                    </div>
                </v-card-title>

                <v-card-text>

                    <v-autocomplete label="Select an Insurance Scheme"
                                    :items="schemesFiltered"
                                    item-text="name"
                                    item-value="id"
                                    v-model="obj.duplicatedSchemeExclusions.scheme_id"
                                    :error="errors.has('scheme_id')" outline
                                    :hint="errors.get('scheme_id')" persistent-hint
                                    @change="errors.clear('scheme_id')"
                    ></v-autocomplete>

                    <v-row class="row-fluid"  v-for="(item, index) in obj.duplicatedSchemeExclusions.exclusions" :key="index">
                        <v-col sm="3">
                            {{ item.name }}
                            <br/>
                            <v-btn icon small color="red" dark @click="removeItem(item)">
                                <v-icon small>delete</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col sm="4">
                            <v-autocomplete  outline
                                             label="Select a Facility"
                                             class="mb-4"
                                             :items="facilities"
                                             item-text="name" item-value="id"
                                             v-model="item.facility_id"
                                             hide-no-data
                                             autoselect-first
                            >
                            </v-autocomplete>
                        </v-col>
                        <v-col sm="4" offset-sm="1">
                            <v-text-field
                                    outline
                                    label="Price"
                                    type="number"
                                    step="0.01"
                                    v-model="item.price">
                            </v-text-field>
                        </v-col>
                    </v-row>

                </v-card-text>

                <v-card-actions>
                    <v-btn flat color="blue" @click="close">Close</v-btn>

                    <v-spacer></v-spacer>

                    <v-btn color="blue" dark @click="saveDuplicate" :loading="saveLoader">Save</v-btn>

                </v-card-actions>
            </v-card>

            <collabmed-loading v-else class="white">Loading Facilities and Schemes</collabmed-loading>

        </v-dialog>

    </div>
</template>

<script>
import Scheme from "@settings/libs/schemes/Scheme";
import ExclusionsForm from "./partials/ExclusionsForm";
import { mapActions, mapGetters } from "vuex";

export default {
    props: {
        schemeId: {
            required: true,
        },
    },

    components: {
        ExclusionsForm,
    },

    data() {
        return {
            obj: new Scheme(),
            saveLoader: false,
            dialog: false,
            dialogDuplicate: false,
            facilities: null,
            schemes: null,
        };
    },

    computed: {
        ...mapGetters([
            "getFacilities", "getSchemes",
        ]),

        submitted() {
            return this.obj.form.submitted;
        },

        saved() {
            return this.obj.saved;
        },

        duplicated() {
            return this.obj.duplicated;
        },

        errors() {
            return this.obj.form.errors;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        selected() {
            return this.obj.selected;
        },

        initialised() {
            return this.selected;
        },

        editedExclusion() {
            return this.obj.editedExclusion;
        },

        duplicatedSchemeExclusions() {
            return this.obj.duplicatedSchemeExclusions;
        },

        schemesFiltered() {
            return _.map(this.schemes, (item) => {
                let name = item.full_name;
                if (item.company) {
                    name += " (" + item.company.name + ")";
                }

                return {
                    id: item.id,
                    name: name,
                };
            });
        },
    },

    watch: {
        saved(val) {
            this.saveLoader = false;

            if (val) {
                this.obj.form.submitted = false;
                this.close();
                this.obj.saved = false;
            }
        },

        contaminated(val) {
            this.saveLoader = false;

            if (val) {
                this.saveLoader = false;
            }
        },

        duplicated(val) {
            if (val) {
                this.saveLoader = false;
                window.location = route("settings.exclusions.index", this.obj.duplicatedSchemeExclusions.scheme_id);
            }
        },

        getFacilities(val) {
            this.facilities = val.facilities;
        },

        getSchemes(val) {
            this.schemes = val.data;
        },
    },

    methods: {
        ...mapActions([
            "setFacilities", "setSchemes",
        ]),

        initialise() {
            this.obj.find(this.schemeId);
        },

        edit(item) {
            this.obj.editedExclusion.id = item.id;
            this.obj.editedExclusion.price = item.price;
            this.obj.editedExclusion.scheme_id = item.scheme_id;
            this.obj.editedExclusion.facility_id = item.facility_id;

            if (item.procedure) {
                this.obj.editedExclusion.friendly_name = item.procedure.name;
            }
            if (item.product) {
                this.obj.editedExclusion.friendly_name = item.product.name;
            }

            this.dialog = true;
        },

        close() {
            this.dialog = false;
            this.dialogDuplicate = false;
            this.obj.resetEditedExclusionData();
            this.obj.resetDuplicatedSchemeExclusions();
        },

        update() {
            this.saveLoader = true;
            this.obj.updateExclusion();
        },

        duplicate(scheme) {
            this.obj.resetDuplicatedSchemeExclusions();

            if (! this.facilities) {
                this.setFacilities();
            }

            if (! this.schemes) {
                this.setSchemes();
            }

            _.each(scheme.exclusions, (item) => {
                if (item.procedure) {
                    this.obj.duplicatedSchemeExclusions.exclusions.push({
                        name: item.procedure.name,
                        price: item.price,
                        facility_id: item.facility_id,
                        product_id: null,
                        procedure_id: item.procedure_id,
                        identifier: scheme.id + "-" + item.facility_id + "-" + item.price,
                    });
                } else if (item.product) {
                    this.obj.duplicatedSchemeExclusions.exclusions.push({
                        name: item.product.name,
                        price: item.price,
                        facility_id: item.facility_id,
                        product_id: item.product_id,
                        procedure_id: null,
                        identifier: scheme.id + "-" + item.facility_id + "-" + item.price,
                    });
                }
            });

            this.dialogDuplicate = true;
        },

        removeItem(item) {
            this.obj.duplicatedSchemeExclusions.exclusions = _.filter(this.obj.duplicatedSchemeExclusions.exclusions, (excs) => {
                return !(excs.identifier == item.identifier);
            });
        },

        saveDuplicate() {
            if (! this.obj.duplicatedSchemeExclusions.scheme_id) {
                flash({ message: "Please select a Scheme to proceed", alert: "warning" });
                return;
            }

            if (this.obj.duplicatedSchemeExclusions.exclusions.length < 1) {
                flash({ message: "No Exclusions available to duplicate!", alert: "warning" });
                return;
            }

            this.saveLoader = true;

            this.obj.saveDuplicateSchemeExclusions();
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped lang="scss">

</style>
