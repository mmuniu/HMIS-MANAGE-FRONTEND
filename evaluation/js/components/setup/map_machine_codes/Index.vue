<template>
    <div>
        <v-card flat>
            <v-card-text>
                <form @submit.prevent="!mappingData ? saveMapping() : updateMapping()">
                    <v-row>
                        <!--<v-flex xs12 md4>
                            <div class="mx-3">
                                <v-text-field label="Machine test code id" v-model="mappings.machine_test_code_id"
                                              outline></v-text-field>
                            </div>
                        </v-flex>-->
                        <v-col cols="12" md="4">
                            <div class="mx-3">
                                <v-text-field label="Machine test name" v-model="mappings.machine_test_name" outline></v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-3">
                                <v-text-field label="machine test code" v-model="mappings.machine_test_code" outline></v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-3">
                                <evaluation-procedure-search @results="procedureSelected"></evaluation-procedure-search>
                            </div>
                        </v-col>

                        <v-col cols="12" md="4">
                            <div class="mx-3">
                                <v-btn type="submit" class="primary lighten-1" color="blue" large>
                                    Save
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </form>
            </v-card-text>
        </v-card>

        <v-card flat class="mt-3">
            <v-card-title>
                <h5 class="pt-4 px-4">Mapped procedures</h5>
            </v-card-title>
            <v-card-text>
                <v-data-table
                        :headers="headers"
                        :items="mappedProcedures.data"
                        hide-default-footer
                >
                    <template slot="items" slot-scope="props">
                        <td>{{ props.item.machine }}</td>
                        <td>{{ props.item.machine_test_code }}</td>
                        <td>{{ props.item.machine_test_name }}</td>
                        <td>{{ props.item.procedure }}</td>
                        <td>
                            <v-btn small color="error" @click="removeMapping(props.item)">remove</v-btn>
                        </td>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import MachineCodeMappings from '@evaluation/libs/setup/map_machine_codes/MapMachineCodes';
import { mapActions, mapGetters } from 'vuex';


export default {
    props: [
        'mappingData', 'machine',
    ],

    data: () => ({
        mappings: new MachineCodeMappings(),
        loading: false,
        headers: [
            { text: 'Machine', value: '' },
            { text: 'Machine Test code', value: '' },
            { text: 'Machine Test Name', value: '' },
            { text: 'procedure', value: '' },
            { text: 'Actions', value: '' },
        ],
    }),

    computed: {
        ...mapGetters({
            mappedProcedures: 'getMappedProcedures',
        }),

        machineData() {
            return JSON.parse(this.machine);
        },
    },

    methods: {
        ...mapActions([
            'setMappedProcedures',
        ]),

        procedureSelected(procedure) {
            this.mappings.system_procedure_id = procedure.id;
        },

        saveMapping() {
            this.mappings.save().then((response) => {
                this.initialize();
            });
        },

        removeMapping(mapping) {
            this.mappings.removeProcedureMapping(mapping).then((respone) => {
                this.initialize();
            });
        },

        initialize() {
            this.setMappedProcedures({
                params: {
                    machine_id: this.machineData.id,
                },
            });
        },
    },

    mounted() {
        this.mappings.machine_id = this.machineData.id;
        this.initialize();
    },
};
</script>
