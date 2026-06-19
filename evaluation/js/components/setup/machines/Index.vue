<template>
    <div>
        <v-card flat class="mt-3">
            <v-card-title>
                <h5 class="pa-4">All Created machines</h5>
            </v-card-title>
            <v-card-text>
                <v-data-table
                        :headers="headers"
                        :items="machines.data"
                        class="mb-3"
                        hide-default-footer
                >
                    <template v-slot:item.actions="{ item }">
                        <v-btn small color="primary" @click="editMachineDetails(item)">edit</v-btn>
                        <v-btn small color="primary" @click="mapMachineProcedures(item)">Procedures</v-btn>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    data: () => ({
        headers: [
            { text: 'Name', value: 'display_name' },
            { text: 'Machine Identifier', value: 'machine_identifier' },
            { text: 'Provider', value: 'provider' },
            { text: 'Mobile', value: 'mobile' },
            { text: 'Email', value: 'email' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            machines: 'getMachines',
        }),
    },

    methods: {
        ...mapActions([
            'setMachines',
        ]),

        editMachineDetails(machine) {
            window.location.href = `/evaluation/setup/machines/${machine.id}/edit`;
        },

        /*
            * map machine code to existing system procedures
            * */
        mapMachineProcedures(machine) {
            window.location.href = `/evaluation/setup/machines/${machine.id}/procedures`;
        },
    },

    mounted() {
        this.setMachines();
    },
};
</script>
