<template>
    <v-card flat>
        <v-card-text>
            <test-remark-form :testRemarksData="remarkData"></test-remark-form>
        </v-card-text>
    </v-card>
</template>
<script>
import TestRemarkForm from './partials/TestRemarkForm';

export default {
    props: [
        'testremarksdata',
    ],

    components: {
        TestRemarkForm,
    },

    data: () => ({
        remarkData: null,
    }),

    mounted() {
        this.remarkData = JSON.parse(this.testremarksdata);
    },
};
</script>
