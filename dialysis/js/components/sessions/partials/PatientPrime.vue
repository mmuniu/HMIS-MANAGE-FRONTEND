<template>
    <span></span>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import DialysisVisit from "@dialysis/libs/sessions/DialysisSession";

export default {
    props: [
        "scheduleId",
    ],

    data() {
        return {
            visit: new DialysisVisit(),
            loader: false,
        };
    },

    watch: {
        // contaminated(){
        //     this.loader = false;
        //     this.machine.form.errorDetected = false;
        // },
        //
        // submitted(){
        //     this.loader = false;
        //     this.machine.form.submitted = false;
        // }
    },

    computed: {
        ...mapGetters([
            "getUsers",
        ]),

        users() {
            return _.map(this.getUsers, (user) => {
                return {
                    id: user.id,
                    name: user.profile.full_name,
                };
            });
        },

        errors() {
            return this.visit.form.errors;
        },

        submitted() {
            return this.visit.form.submitted;
        },

        contaminated() {
            return this.visit.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setUsers",
        ]),

        // save(){
        //     this.machine.schedule_id = this.scheduleId;
        //     this.loader = true;
        //     this.machine.save();
        // }
    },

    mounted() {
        this.setUsers();
    },
};
</script>
