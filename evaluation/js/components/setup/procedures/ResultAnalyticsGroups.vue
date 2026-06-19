<template>
    <v-card flat>
        <!-- creations -->
        <v-container fluid>
            <v-row >
                <v-col md="3" cols="12"  class="px-2">
                    <v-text-field v-model="group.name" label="Group name" outline></v-text-field>
                </v-col>

                <v-col md="3" cols="12" class="px-2">
                    <evaluation-procedure-search @results="procedureSelected"></evaluation-procedure-search>
                </v-col>

                <v-col md="3" cols="12" class="px-2">
                    <v-btn large color="success" @click="save()">save</v-btn>
                </v-col>
            </v-row>

            <v-row  v-if="group.procedures.length > 0" class="pt-2">
                <v-col>
                    <v-chip small color="primary" close @click="removeProcedure(procedure)" v-for="procedure in group.procedures" :key="procedure.id">{{ procedure.name }}</v-chip>
                </v-col>
            </v-row>
        </v-container>


        <!-- listing-->
        <div v-if="groups">
            <v-data-table
                    :headers="headers"
                    :items="groups"
                    class="elevation-1"
            >
                <template v-slot:items="props">
                    <tr>
                        <td>{{props.index + 1}}</td>
                        <td>{{props.item.name}}</td>
                        <td>{{props.item.user}}</td>
                        <td>
                            <v-chip small color="primary" v-for="procedure in props.item.procedures" :key="procedure.id">{{ procedure.name }}</v-chip>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </div>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import ResultGroup from '@evaluation/libs/procedures/ResultGroup';

export default {
    data: () => ({
        group: new ResultGroup(),
        headers: [
            { text: '#', value: '' },
            { text: 'name', value: 'name' },
            { text: 'user', value: 'user' },
            { text: 'Procedures', value: '' },
        ],
    }),

    computed: {
        ...mapGetters({
            groups: 'getResultAnalyticsGroups',
        }),
    },

    methods: {
        ...mapActions({
            fetchGroups: 'setResultAnalyticsGroups',
        }),

        procedureSelected(procedure) {
            this.group.procedures.push({
                name: procedure.name,
                id: procedure.id,
            });
        },

        async save() {
            const self = this;

            const response = await this.group.save();

            if (response) {
                self.fetchGroups();
            }
        },

        removeProcedure(procedure) {
            this.group.procedures.splice(_.findIndex(this.group.procedures, procedure), 1);
        },
    },

    mounted() {
        this.fetchGroups();
    },
};
</script>
