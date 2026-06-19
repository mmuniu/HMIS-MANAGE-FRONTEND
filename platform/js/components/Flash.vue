<template>
    <v-snackbar :bottom="true" :right="true"
                :value="show" multi-line :color="alert">
        {{ body }}
        <v-btn icon dark @click.native="show = false">
            <v-icon>cancel</v-icon>
        </v-btn>
    </v-snackbar>
</template>

<script>
export default {
    props: ['details'],

    data() {
        return {
            body: '',
            show: false,
            alert: null,
            timeout: 5000,
        };
    },

    methods: {
        flash(details) {
            if (details.hasOwnProperty('errors')) { // will work for laravel validations, each field at a time though
                this.body = details.errors[Object.keys(details.errors)[0]];
            } else {
                this.body = details.message;
            }

            this.alert = details.alert;

            this.timeout = details.timeout ? details.timeout : 10000;

            this.show = true;

            setTimeout(() => {
                this.body = '';
                this.show = false;
                this.alert = null;
            }, this.timeout);
        },
    },

    created() {
        window.events.$on('flash', (details) => {
            this.flash(details);
        });
    },
};
</script>
