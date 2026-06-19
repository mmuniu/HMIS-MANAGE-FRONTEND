<template>
    <collabmed-loading v-if="!content"></collabmed-loading>

    <div v-else>
        <v-row  class="mb-5">
            <v-col cols="12">
                <dialysis-investigations-form :content="content"></dialysis-investigations-form>
            </v-col>

            <v-col cols="12" class="mt-5">
                <dialysis-investigations-table :content="content"></dialysis-investigations-table>
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

    computed: {
        content() {
            return this.evaluator.content;
        },
    },

    mounted() {
        const visitId = this.$route.params.visitId;

        this.evaluator.fetch(visitId, "investigations");
    },
};
</script>
