/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-05-23
* Time: 18:36
*/

<template>
    <div>
        <v-dialog v-model="dialog" width="600" persistent>

            <v-card>
                <v-card-title class="headline  white--text purple" primary-title>
                    Change Wards <span v-if="item.patient"> | {{ item.patient.full_name }}</span>

                    <v-spacer></v-spacer>

                    <v-btn icon dark @click.native="close" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text  class="px-5">
                    <div style="font-size: 12px">
                        <p>
                            Basically change ward:  will move the patient from the current select ward to another ward.
                            This will as well stop all the (recurring) daily charges previously selected in the outgoing ward
                        </p>
                    </div>
                    <v-select
                            v-model="obj.wardChange.ward_id"
                            :items="wardsList"
                            @change="updateBeds()"
                            item-text="name"
                            item-value="id"
                            label="Select a Ward"
                            hide-details
                    ></v-select>

                    <v-select
                            v-model="obj.wardChange.bed_id"
                            :disabled="! obj.wardChange.ward_id"
                            :items="beds"
                            item-text="name"
                            item-value="id"
                            label="Select a Bed"
                            hide-details
                    ></v-select>

                    <v-select
                            v-model="obj.wardChange.charges"
                            :disabled="! obj.wardChange.ward_id"
                            :items="charges"
                            item-text="name"
                            item-value="id"
                            label="Select Charge(s)"
                            hide-details multiple
                    ></v-select>

                    <v-alert :value="true" v-if="errors.any()" type="error" outline>
                        <div v-html="errors.display()"></div>
                    </v-alert>

                </v-card-text>

                <v-card-actions>
                    <v-btn flat color="blue" @click="close" :loading="saveLoader">
                        Close
                    </v-btn>

                    <v-spacer></v-spacer>
                    <v-btn color="primary" dark @click="save" :loading="saveLoader">
                        Change Wards
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

export default {
    props: {
        show: {
            type: Boolean,
            required: true,
        },

        obj: {
            type: Object,
            required: true,
        },

        item: {
            required: true,
            type: Object,
        },

        wards: {
            required: true,
        },
    },

    data() {
        return {
            saveLoader: false,
            dialog: false,
            beds: [],
            charges: [],
        };
    },

    computed: {
        saved() {
            return this.obj.saved;
        },

        wardsList() {
            const self = this;

            return _.map(this.wards, (ward) => {
                ward.disabled = self.item.ward_id === ward.id ? true : false;

                return ward;
            });
        },

        submitted() {
            return this.obj.form.submitted;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        errors() {
            return this.obj.form.errors;
        },
    },

    watch: {
        show(val) {
            if (val) {
                this.dialog = true;
            }
        },

        contaminated(val) {
            if (val) {
                this.saveLoader = false;
            }
        },

        submitted(val) {
            if (val) {
                this.saveLoader = false;
            }
        },

        saved(val) {
            if (val) {
                this.saveLoader = false;
                this.dialog = false;
                this.obj.resetWardChange();
                this.$emit("saved");
            }
        },
    },

    methods: {
        updateBeds() {
            const ward = _.find(this.wards, { id: this.obj.wardChange.ward_id });

            this.beds = _.map(ward.beds, (item) => {
                let name = "Bed No. " + item.number;
                ! item.is_available ? name += " (Unavailable)" : "";

                return {
                    name: name,
                    id: item.id,
                    disabled: ! item.is_available,
                };
            });

            this.charges = _.map(ward.charges, (item) => {
                let name = item.name + " - Kshs. " + item.cost;
                item.type == "recurring" ? name += " [RECURRING]" : "";

                return {
                    id: item.id,
                    name: name,
                };
            });
        },

        close() {
            this.dialog = false;
            this.$emit("close");
        },

        save() {
            this.saveLoader = true;

            this.obj.changeWard();
        },
    },

    mounted() {
        this.dialog = this.show;

        this.obj.wardChange.admission_id = this.item.id;
    },
};
</script>

<style scoped lang="scss">

</style>
