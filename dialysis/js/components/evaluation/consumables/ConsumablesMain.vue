<template>
    <collabmed-loading v-if="!content"></collabmed-loading>

    <div v-else>
        <v-row  >
            <v-col cols="12" sm="12" md="5">
                <dialysis-consumables-form :content="content"></dialysis-consumables-form>
            </v-col>

            <v-col cols="12" sm="12" md="7">
                <dialysis-consumables-table :content="content"></dialysis-consumables-table>
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
        "dialysis-consumables-form": require("./ConsumablesForm"),
        "dialysis-consumables-table": require("./ConsumablesTable"),
    },

    computed: {
        content() {
            return this.evaluator.content;
        },
    },

    mounted() {
        const visitId = this.$route.params.visitId;

        this.evaluator.fetch(visitId, "consumables");
    },
};
</script>
