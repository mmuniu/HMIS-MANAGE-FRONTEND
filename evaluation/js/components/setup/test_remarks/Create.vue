<template>
    <v-card flat>
        <v-card-text>
            <test-remark-form></test-remark-form>
        </v-card-text>
    </v-card>
</template>
<script>
import TestRemarkForm from './partials/TestRemarkForm';

export default {
    components: {
        TestRemarkForm,
    },
};
</script>
