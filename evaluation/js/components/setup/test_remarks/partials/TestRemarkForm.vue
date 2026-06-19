
<template>
    <div v-if="!initialised"></div>
    <div v-else>
        <form @submit.prevent="!testRemarksData ? saveRemark() : updateRemark()">
            <v-row >
                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <evaluation-procedure-search label="Procedure" :pre_selected="procedure" @results="setProcedure"></evaluation-procedure-search>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <v-select label="Gender" :items="['Male', 'Female', 'Both']"
                                  v-model="remark.gender" outline></v-select>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <v-select label="Age Group" :items="ageGroups.data" item-text="range" item-value="id"
                                  v-model="remark.age_group_id" outline
                        ></v-select>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <v-text-field label="Title" v-model="remark.title" :error="errors.has('title')" outline
                                      placeholder="Title to show"
                                      :hint="errors.get('title')" persistent-hint @keyup="errors.clear('title')"
                        ></v-text-field>
                    </div>
                </v-col>

                <v-col class="mx-3" cols="12" >
                    <div>
                        <tinymce id="editor"
                                 api-key="ey11bm7sj7q4whqw7qptr2f8g5v5kgz667je1np4tevo4sl8"
                                 :init="{
                                     plugins: [
                                       'advlist autolink lists link image charmap print preview anchor',
                                       'searchreplace visualblocks code fullscreen',
                                       'insertdatetime media table paste code help wordcount'
                                     ],
                                     toolbar:
                                       'undo redo | formatselect | bold italic backcolor | \
                                       alignleft aligncenter alignright alignjustify | \
                                       bullist numlist outdent indent | removeformat | help'
                                 }"
                                 v-model="remark.remark"></tinymce>
                    </div>
                </v-col>

                <!--<v-flex xs12 mx-3>
                    <v-switch v-model="remark.editable" label="Check here if the remark can be edited upon posting results"></v-switch>
                </v-flex>-->

                <v-col cols="12" class="text-right">
                    <div class="mx-3">
                        <v-btn v-if="!testRemarksData" small type="submit" class="blue lighten-1" color="blue" large
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
import TestRemark from '@evaluation/libs/setup/test_remarks/TestRemarks';
import { mapGetters, mapActions } from 'vuex';

export default {
    props: [
        'testRemarksData',
    ],

    data: () => ({
        remark: new TestRemark(),
        loader: false,
    }),

    watch: {
        contaminated(value) {
            if (value) {
                this.loader = false;
                this.remark.form.errorDetected = false;
            }
        },

        submitted(value) {
            if (value) {
                this.loader = false;
                this.remark.form.submitted = false;
            }
        },

        testRemarksData(val) {
            this.remark.editRemark(val);
        },
    },

    computed: {
        ...mapGetters({
            ageGroups: 'getAgeGroups',
        }),

        procedure() {
            return this.testRemarksData ? this.testRemarksData.procedure : null;
        },

        errors() {
            return this.remark.form.errors;
        },

        submitted() {
            return this.remark.form.submitted;
        },

        initialised() {
            return this.ageGroups;
        },

        contaminated() {
            return this.remark.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            'setAgeGroups', 'setTestRemarks',
        ]),

        setProcedure(procedure) {
            this.remark.procedure_id = procedure ? procedure.id : null;
        },

        async saveRemark() {
            this.loader = true;
            await this.remark.save();
            await this.setTestRemarks();
            this.loader = false;
        },

        async updateRemark() {
            this.loader = true;
            await this.remark.updateRemark(this.testRemarksData.id);
            await this.setTestRemarks();
            this.loader = false;
        },

        editRemark() {
            if (this.testRemarksData) {
                this.remark.editRemark(this.testRemarksData);
            }
        },
    },

    mounted() {
        this.setAgeGroups();
        this.editRemark();
    },
};
</script>
