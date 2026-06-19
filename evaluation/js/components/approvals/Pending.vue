<template>
    <div>
        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <div v-else>
            <h4 class="subheadline font-weight-light">Pending</h4>

            <div v-if="items && items.length > 0">
                <list v-for="(item, index) in items" :key="index" :item="item" @saved="updateList(index)"></list>
            </div>

            <v-responsive v-else height="200" class="grey lighten-4 text-center py-5">
                <v-row>
                    <v-col>
                        <h5 class="display-1">No Items are awaiting approval</h5>
                    </v-col>
                </v-row>
            </v-responsive>

        </div>
    </div>

</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Approval from '@evaluation/libs/approvals/Approval';
import List from './partials/List';

export default {
    components: {
        List,
    },

    data() {
        return {
            approval: new Approval(),
            list: null,
            items: null,
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

        list(value) {
            if (value.data) {
                // group items together for each visit_id
                this.items = _(value.data)
                    .groupBy((x) => x.visit_id)
                    .map((value, key) => ({ visit_id: key, investigations: value }))
                    .value();
            }
        },
    },

    methods: {
        ...mapActions([
            'setInvestigationApprovals',
        ]),

        updateList(index) {
            this.items.splice(index, 1);
        },
    },

    mounted() {
        this.setInvestigationApprovals({
            params: {
                key: 'pending',
            },
        });
    },
};
</script>

<style scoped lang="scss">

</style>
