export const form_mixin = {
    data() {
        return {
            loader: false,
        };
    },

    watch: {
        contaminated() {
            this.loader = false;
            this[this.form].form.submitted = false;
            this[this.form].form.errorDetected = false;
        },

        submitted() {
            this.loader = false;
            this[this.form].form.submitted = false;
        },
    },

    computed: {
        errors() {
            return this[this.form].form.errors;
        },

        submitted() {
            return this[this.form].form.submitted;
        },

        contaminated() {
            return this[this.form].form.errorDetected;
        },
    },

    methods: {
        save() {
            this.loader = true;
            this[this.form].save();
        },
    },
};
