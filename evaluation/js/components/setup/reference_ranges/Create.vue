<template>
    <v-card flat>
        <v-card-text>
            <reference-range-create-form></reference-range-create-form>
        </v-card-text>
    </v-card>
</template>
<script>
import ReferenceRangeCreateForm from './partials/ReferenceRangesForm';

export default {
    components: {
        ReferenceRangeCreateForm,
    },
};
</script>
