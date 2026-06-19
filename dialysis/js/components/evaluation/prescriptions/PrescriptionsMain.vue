<template>
    <collabmed-loading v-if="!content"></collabmed-loading>

    <div v-else>
        <v-row  >
            <v-col cols="12" sm="5">
                <dialysis-prescriptions-form :content="content"></dialysis-prescriptions-form>
            </v-col>

            <v-col cols="12" sm="7">
                <v-card class="mx-2 px-0">
                    <evaluation-prescriptions-index></evaluation-prescriptions-index>
                </v-card>
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

        visitId() {
            return this.$route.params.visitId;
        },
    },

    mounted() {
        this.evaluator.fetch(this.visitId, "prescriptions");
    },
};
</script>
