import Visit from "@reception/libs/visits/Visit";

export const evaluationMixin = {
    data() {
        return {
            visitObj: new Visit(),
        };
    },

    computed: {
        visit() {
            return this.visitObj.selectedVisit;
        },
    },

    methods: {
        loadCurrentVisit() {
            if (this.visitId) {
                this.visitObj.find(this.visitId);
            } else {
                this.visitObj.find(this.$route.params.visitId);
            }
        },
    },

    mounted() {
        this.loadCurrentVisit();
    },
};
