<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div v-else>
        <v-card flat>
            <v-card-title>
                <span class="text-bold grey--text text--darken-1">Reference ranges listing</span>
                <v-spacer></v-spacer>
                <v-spacer></v-spacer>
                <v-switch label="Filter by parent procedure" v-model="filter_by_parent" class="mx-3"></v-switch>
                <evaluation-procedure-search  @results="procedureSearchReady"></evaluation-procedure-search>
            </v-card-title>

            <v-divider class="my-0"></v-divider>

            <v-card-text>
                <v-data-table
                        :headers="headers" :items="referenceRanges.data"
                        class="mb-3" flat disable-pagination
                        hide-default-footer
                >
                    <template v-slot:item.actions="{ item }">
                        <v-btn class="mx-0 cyan" slot="activator" dark small @click="editReferenceRange(item)">
                            edit
                        </v-btn>
                        <v-btn class="mx-0 error" slot="activator" dark small @click="deleteReferenceRange(item.id)">
                            Delete
                        </v-btn>
                    </template>

                    <template v-slot:iem.age_groups="{ item }">
                        sfsd
                       <span v-if="item.age_group">
                            {{  item.age_group.range }}
                       </span>
                    </template>

                    <template v-slot:item.normal="{ item }">
                        <v-icon small v-if="item.is_normal_range" color="success">check</v-icon>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>

</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ReferenceRanges from '@evaluation/libs/setup/reference_ranges/ReferenceRanges';

export default {
    data: () => ({
        procedure: null,
        filter_by_parent: false,
        range: new ReferenceRanges(),
        headers: [
            { text: 'Procedure', value: 'procedure' },
            { text: 'Parent Procedure', value: 'parent_procedure' },
            { text: 'Title ', value: 'title' },
            { text: 'Reference range', value: 'reference_range' },
            { text: 'Age Group', value: 'age_group.range' },
            { text: 'Gender', value: 'gender' },
            { text: 'Normal', value: 'normal' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            referenceRanges: 'getReferenceRanges',
        }),

        initialised() {
            return true;
        },
    },

    watch: {
        procedure(val) {
            const param = this.filter_by_parent ? { parent_procedure_id: val } : { procedure_id: val };
            this.setReferenceRanges({
                params: param,
            });
        },
    },

    methods: {
        ...mapActions([
            'setReferenceRanges',
        ]),

        procedureSearchReady(result) {
            this.procedure = result ? result.id : null;
        },

        editReferenceRange(range) {
            window.location.href = route('evaluation.setup.reference_ranges.edit', range.id);
        },

        deleteReferenceRange($range) {
            this.range.destroy($range);
            this.setReferenceRanges();
        },
    },

    mounted() {
        this.setReferenceRanges();
    },
};
</script>
