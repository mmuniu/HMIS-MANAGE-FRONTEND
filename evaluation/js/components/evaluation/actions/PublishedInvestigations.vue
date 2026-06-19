<template>
    <v-card>
      {{ type }}
        <done-investigations :action="action" :visitid="visit_id" :type="type"></done-investigations>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import InvestigationResults from '@evaluation/libs/investigation_results/InvestigationResults.js';
import DoneInvestigations from '@evaluation/components/evaluation/actions/partials/DoneInvestigations';

export default {
    props: [
        'visitid', 'type',
    ],

    components: {
        DoneInvestigations,
    },

    data: () => ({
        action: 'published',
        investigationResult: new InvestigationResults(),
        visit_id: null,
    }),

    mounted() {
        this.visit_id = this.visitid ? this.visitid : this.$route.params.visitId;

    },
};
</script>
