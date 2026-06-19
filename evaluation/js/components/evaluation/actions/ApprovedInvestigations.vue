<template>
    <done-investigations :action="action"></done-investigations>
</template>
<script>
import DoneInvestigations from '@evaluation/components/evaluation/actions/partials/DoneInvestigations';

export default {
    components: {
        DoneInvestigations,
    },

    data: () => ({
        action: 'approved',
    }),
};
</script>
