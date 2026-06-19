import Assessment from "@dialysis/libs/sessions/Assessment";

export const assessment_mixin = {
    data() {
        return {
            assess: new Assessment(),
            loading: false,
            nextStep: "",
        };
    },

    watch: {
        contaminated() {
            this.loading = false;
            this.assess.form.errorDetected = false;
        },

        submitted(value) {
            if (value) {
                this.assess.form.submitted = false;
                this.navigateTo();
            }
        },
    },

    computed: {
        sessionId() {
            return this.$route.params.sessionId;
        },

        errors() {
            return this.assess.form.errors;
        },

        submitted() {
            return this.assess.form.submitted;
        },

        contaminated() {
            return this.assess.form.errorDetected;
        },
    },

    methods: {
        navigateTo() {
            if (this.nextStep !== null) {
                const url = `/dialysis/session/${this.sessionId}/assess/${this.nextStep}`;
                this.$router.push(url);
            } else {
                flash({
                    alert: "success",
                    message: "Dialysis session started",
                });

                const days = ["sunday", "modnay", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                const date = new Date();
                location.href = "/dialysis/sessions";
            }
        },

        save() {
            this.loading = true;
            this.assess.save();
        },

        initialisePage(type, nextStep = null) {
            this.assess.session_id = this.sessionId;
            this.assess.type = type;
            this.nextStep = nextStep;
            this.loading = false;
        },
    },
};
