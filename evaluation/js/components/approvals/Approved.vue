<template>
    <div>
        <collabmed-loading v-if="!initialised" type="alternating-balls"></collabmed-loading>

        <div v-else>
            <h4 class="subheadline font-weight-light">Approved</h4>

            <v-data-table :headers="list.headers" :items="list.data"
                          class="mb-3" flat hide-default-footer>
                <template slot="items" slot-scope="{ item }">
                    <td class="py-3">{{ item.investigation.procedure_name }}</td>
                    <td class="patient">{{ item.patient_name | ucwords }}</td>
                    <td class="approver">
                        {{ item.user.full_name }} <strong>{{ item.approved_as ? 'as ' + item.approved_as : '' }}</strong>
                    </td>
                    <td>{{ item.initial_price | numberFormat }}</td>
                    <td>{{ item.initial_amount | numberFormat }}</td>
                    <td>{{ item.approval_price | numberFormat }}</td>
                    <td>{{ item.approval_amount | numberFormat }}</td>
                    <td><div v-html="item.reason"></div></td>
                    <td>
                    </td>
                </template>

                <template slot="footer" v-if="list.links">
                    <td colspan="100%">
                        <v-row  class="py-2 pb-2">
                            <v-col cols="8" class="mt-3 ml-3">
                                Total records: {{ list.meta.total }}
                            </v-col>

                            <v-col cols="3" class="text-right">
                                <v-btn icon @click="navigate(list.links.prev)">
                                    <v-icon>chevron_left</v-icon>
                                </v-btn>

                                <v-btn icon @click="navigate(list.links.next)">
                                    <v-icon>chevron_right</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </td>
                </template>
            </v-data-table>
        </div>
    </div>

</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Approval from '@evaluation/libs/approvals/Approval';

export default {
    data() {
        return {
            approval: new Approval(),
            list: null,
        };
    },

    computed: {
        ...mapGetters([
            'getInvestigationApprovals',
        ]),

        initialised() {
            return this.list;
        },
    },

    watch: {
        getInvestigationApprovals(value) {
            if (value) {
                this.list = value;
            }
        },
    },

    methods: {
        ...mapActions([
            'setInvestigationApprovals',
        ]),
    },

    mounted() {
        this.setInvestigationApprovals({
            params: {
                key: 'approved',
            },
        });
    },
};
</script>

<style scoped lang="scss">
    .approver, .patient {
        min-width: 180px;
    }
</style>
