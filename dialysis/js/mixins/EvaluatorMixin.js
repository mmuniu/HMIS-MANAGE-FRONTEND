import Evaluator from "@dialysis/libs/evaluation/Evaluator";

export const dialysis_evaluator_mixin = {

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

    methods: {
        setup(item) {
            const visitId = this.$route.params.visitId;

            this.evaluator.fetch(visitId, item);
        },
    },
};
