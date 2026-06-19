<template>
    <collabmed-loading v-if="!content"></collabmed-loading>

    <div v-else>
        <v-row  class="mb-5">
            <v-col cols="12">
                <dialysis-procedures-form :content="content"></dialysis-procedures-form>
            </v-col>

            <v-col cols="12" class="mt-5">
                <dialysis-procedures-table :content="content"></dialysis-procedures-table>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import Evaluator from "@dialysis/libs/evaluation/Evaluator";

export default {
    data() {
        return {
            evaluator: new Evaluator(),
        };
    },

    components: {

    },

    computed: {
        content() {
            return this.evaluator.content;
        },
    },

    mounted() {
        const visitId = this.$route.params.visitId;

        this.evaluator.fetch(visitId, "procedures");
    },
};
</script>
