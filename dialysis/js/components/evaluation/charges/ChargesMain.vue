<template>
    <collabmed-loading v-if="!content"></collabmed-loading>

    <div v-else>
        <v-row  class="mx-2">
            <v-col cols="12">
                <ward-charges :content="content"></ward-charges>
            </v-col>

            <v-col cols="12">
                <v-divider></v-divider>
            </v-col>

            <v-col cols="12">
                <prescription-charges :content="content"></prescription-charges>
            </v-col>

            <!--<v-flex xs12>-->
                <!--<v-divider></v-divider>-->
            <!--</v-flex>-->

            <!--<v-flex xs12>-->
                <!--<procedure-charges :content="content"></procedure-charges>-->
            <!--</v-flex>-->
        </v-row>
    </div>
</template>

<script>
import { dialysis_evaluator_mixin } from "@dialysis/mixins/EvaluatorMixin";
import PrescriptionCharges from "./partials/PrescriptionCharges.vue";
import WardCharges from "./partials/WardCharges.vue";

export default {
    mixins: [
        dialysis_evaluator_mixin,
    ],

    components: {
        "ward-charges": WardCharges,
        "prescription-charges": PrescriptionCharges,
        // "procedure-charges": require("./partials/ProcedureCharges"),
    },

    mounted() {
        this.setup("charge-sheet");
    },
};
</script>
