<template>
    <div v-if="!initialised"></div>
    <div v-else>
        <form @submit.prevent="!referenceRangeData ? saveReferenceRange() : updateReferenceRange()">
            <v-row >
                <v-col cols="12" md="3">
                    <div class="mx-3">
                       <evaluation-parent-procedure-search label="Parent procedure" :pre_selected="parentProcedure" :searchId="'parent_procedure_search'" @parent_results="setParentProcedure"></evaluation-parent-procedure-search>
                    </div>
                </v-col>
                <v-col cols="12" md="3">
                    <div class="mx-3">
                       <evaluation-procedure-search label="Sub procedure" :pre_selected="subProcedure" :searchId="'sub_procedure_search'" @results="setProcedure"></evaluation-procedure-search>
                    </div>
                </v-col>
                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <v-select label="Gender" :items="['Male', 'Female', 'Both']"
                                  v-model="range.gender" outline></v-select>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <v-select label="Age Group" :items="ageGroups.data" item-text="range" item-value="id"
                                  v-model="range.age_group_id" outline
                        ></v-select>
                    </div>
                </v-col>

                <v-col cols="12" md="3" >
                    <div class="mx-3">
                        <v-select @change="clearFields()" label="Type" :items="r_types"
                                  v-model="range.type" outline
                        ></v-select>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <v-text-field label="Flag" v-model="range.flag" outline
                                      placeholder="Specific range e.g. Desirable"
                                      hint="We'll prefix this before the actual range"
                                      @keyup="errors.clear('name')"></v-text-field>
                    </div>
                </v-col>

                <v-col cols="12" md="3" v-if="range.type === 'range'">
                    <div class="mx-3">
                        <v-text-field label="Lower value" v-model="range.lower" :error="errors.has('name')" outline
                                      :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')"></v-text-field>
                    </div>
                </v-col>

                <v-col cols="12" md="3" v-if="range.type === 'range'">
                    <div class="mx-3">
                        <v-text-field label="Upper value" v-model="range.upper" :error="errors.has('name')" outline
                                      :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')"></v-text-field>
                    </div>
                </v-col>

                <v-col cols="12" md="3" v-if="range.type === 'less_greater'">
                    <div class="mx-3">
                        <v-select label="Type" :items="value_types" item-text="text" item-value="value"
                                  v-model="range.lg_type" outline
                        ></v-select>
                    </div>
                </v-col>

                <v-col cols="12" md="3" v-if="range.type === 'less_greater'">
                    <div class="mx-3">
                        <v-text-field label="value" v-model="range.lg_value" :error="errors.has('name')" outline
                                      :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')"></v-text-field>
                    </div>
                </v-col>

                <v-col cols="12" md="3" v-if="range.type === 'text'">
                    <div class="mx-3">
                        <v-text-field label="value" v-model="range.text_reference" outline></v-text-field>
                    </div>
                </v-col>

                <v-col cols="12" md="3" >
                    <div class="mx-3">
                        <v-autocomplete
                                v-model="range.title_id"
                                :items="titles"
                                color="black"
                                class="black--text"
                                item-text="name"
                                item-value="id"
                                flat clearable
                                hide-no-data no-filter outline hide-details
                                label="Title"
                        ></v-autocomplete>
                    </div>
                </v-col>

                <v-col cols="12" md="3" >
                    <div class="mx-3">
                        <v-switch label="Mark this as the normal range" v-model="range.is_normal_range"></v-switch>
                    </div>
                </v-col>


                <v-col cols="12" md="3" class="text-right">
                    <div class="mx-2">
                        <v-btn v-if="!referenceRangeData" small type="submit" class="blue lighten-1" color="blue" large
                               :dark="!loader" :loading="loader" :disabled="loader">
                            Save
                        </v-btn>

                        <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                               :dark="!loader" :loading="loader" :disabled="loader">
                            update
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </form>
    </div>
</template>
<script>
import ReferenceRanges from '@evaluation/libs/setup/reference_ranges/ReferenceRanges';
import { mapGetters, mapActions } from 'vuex';

export default {
    props: [
        'referenceRangeData',
    ],

    data: () => ({
        range: new ReferenceRanges(),
        loader: false,
        r_types: [
            { text: 'Ranges', value: 'range' },
            { text: 'Equal or Less/Greater than', value: 'less_greater' },
            { text: 'Text', value: 'text' },
        ],
        value_types: [
            { text: 'Less than', value: '<' },
            { text: 'Greater than', value: '>' },
            { text: 'Equal to', value: '==' },
            { text: 'Less than or Equal to', value: '<=' },
            { text: 'Greater than or Equal to', value: '>=' },
        ],
    }),

    watch: {
        contaminated(value) {
            if (value) {
                this.loader = false;
                this.range.form.errorDetected = false;
            }
        },

        submitted(value) {
            if (value) {
                this.loader = false;
                this.range.form.submitted = false;
            }
        },
    },

    computed: {
        ...mapGetters({
            ageGroups: 'getAgeGroups',
            titles: 'getLabTestTitles',
        }),

        subProcedure() {
            return this.referenceRangeData ? this.referenceRangeData.procedure : null;
        },

        parentProcedure() {
            return this.referenceRangeData ? this.referenceRangeData.parent_procedure : null;
        },

        errors() {
            return this.range.form.errors;
        },

        submitted() {
            return this.range.form.submitted;
        },

        initialised() {
            return this.ageGroups && this.titles ? true : false;
        },

        contaminated() {
            return this.range.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            'setAgeGroups', 'setReferenceRanges', 'setLabTestTitles',
        ]),

        clearFields() {
            this.range.lower = null;
            this.range.upper = null;
            this.range.lg_type = null;
            this.range.lg_value = null;
        },

        setProcedure(procedure) {
            this.range.procedure_id = procedure ? procedure.id : null;
        },

        setParentProcedure(procedure) {
            this.range.parent_procedure_id = procedure ? procedure.id : null;
        },

        async saveReferenceRange() {
            this.loader = true;
            await this.range.save();
            await this.setReferenceRanges();
            this.loader = false;
            this.range.parent_procedure_id = null;
          this.range.procedure_id = null;

        },

        async updateReferenceRange() {
            this.loader = true;
            await this.range.update(this.referenceRangeData.id);
            await this.setReferenceRanges();
            this.loader = false;
        },

        editReferenceRange() {
            if (this.referenceRangeData) {
                this.range.editReferenceRange(this.referenceRangeData);
            }
        },
    },

    mounted() {
        this.setAgeGroups();
        this.setLabTestTitles();
        this.editReferenceRange();
    },
};
</script>
