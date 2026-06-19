<template>
    <v-card flat>
        <v-card-text>
            <reference-range-create-form :referenceRangeData="referenceRange"></reference-range-create-form>
        </v-card-text>
    </v-card>
</template>
<script>
import ReferenceRangeCreateForm from './partials/ReferenceRangesForm';
import ReferenceRanges from '@evaluation/libs/setup/reference_ranges/ReferenceRanges';

export default {
    props: [
        'reference_range',
    ],

    components: {
        ReferenceRangeCreateForm,
    },

    data: () => ({
        range: new ReferenceRanges(),
    }),

    computed: {
        referenceRange() {
            return JSON.parse(this.reference_range);
        },
    },
};
</script>
