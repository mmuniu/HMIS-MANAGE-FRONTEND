<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else flat>
        <v-card-title>
            <span class="text-bold grey--text text--darken-1">
                List of lab test remarks
            </span>
            <v-spacer></v-spacer>
            <evaluation-procedure-search label="Procedure" @results="procedureSelected"></evaluation-procedure-search>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="headers" :items="remarks.data" hide-default-footer
                    disable-pagination
                    class="mb-3" flat :rows-per-page-items="[25]"
            >
                <template v-slot:item.procedure="{ item }">
                    {{ item.procedure.name  }}
                </template>

                <template v-slot:item.age_group="{ item }">
                    <span v-if="item.age_group">{{ item.age_group.range }}</span>
                </template>

                <template v-slot:item.editable="{ item }">
                    <span v-if="item.editable">true</span>
                    <span v-else> false</span>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-btn slot="activator" class="mx-0 cyan" :href="`/evaluation/setup/test-remarks/${item.id}/edit`" dark small>
                        edit
                    </v-btn>
                    <v-btn slot="activator" class="mx-0 error" @click="deleteRemark(item.id)" dark small>
                        delete
                    </v-btn>

                    <v-btn color="primary" small dark @click.stop="item.dialog = true">view remark</v-btn>

                    <v-dialog v-model="item.dialog" max-width="40%">
                        <v-card>
                            <v-card-title class="headline primary">{{ item.procedure.name }}</v-card-title>
                            <v-card-text>
                                <div v-if="!item.view_source" v-html="item.remark"></div>
                                <div v-if="item.view_source"> {{ item.remark }} </div>
                            </v-card-text>

                            <v-card-actions>
                                <v-btn color="purple darken-1" @click="item.view_source = true">view_source</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn color="error darken-1" @click="item.dialog = false">Cancel</v-btn>
                                <v-btn color="primary darken-1" @click="item.dialog = false">Okay</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import TestRemark from '@evaluation/libs/setup/test_remarks/TestRemarks';
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'test-remarks-index',

    data: () => ({
        remark: new TestRemark(),
        headers: [
            { text: 'Procedure', value: 'procedure' },
            { text: 'Age Group', value: 'age_group' },
            { text: 'Title', value: 'title' },
            { text: 'Gender', value: 'gender' },
            { text: 'Editable', value: 'editable' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            remarks: 'getTestRemarks',
        }),

        initialised() {
            return this.remarks;
        },
    },

    methods: {
        ...mapActions([
            'setTestRemarks',
        ]),

        procedureSelected(procedure) {
            this.setTestRemarks({
                params: {
                    procedure_id: procedure.id,
                },
            });
        },

        deleteRemark(remark_id) {
            this.remark.destroy(remark_id);
            this.setTestRemarks();
        },
    },

    mounted() {
        this.setTestRemarks();
    },
};
</script>
