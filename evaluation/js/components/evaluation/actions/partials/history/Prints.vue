<template>
    <div>
        <h5 class="headline" style="font-weight: bold">Prints</h5>

        <div v-if="list">
            <v-btn color="primary" dark :href="list.print_visit_history_url" target="_blank">
                <v-icon small>fa fa-print</v-icon> &nbsp; Print Visit History Form
            </v-btn>

            <v-btn color="orange" dark :href="list.download_visit_history_url" target="_blank">
                <v-icon small>fa fa-download</v-icon> &nbsp; Download Visit History Form
            </v-btn>

            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary"
                           v-bind="attrs"
                           v-on="on"
                           dark
                           :href="list.print_referral_form_url"
                           target="_blank">
                        Print referral form
                    </v-btn>
                </template>
                <span>Print referral form based on this visit details</span>
            </v-tooltip>
        </div>

        <v-alert v-else :value="true" type="info">
            No buttons specified
        </v-alert>
    </div>

</template>

<script>
export default {
    props: ['items'],

    computed: {
        list() {
            return this.items;
        },
    },
};
</script>

<style scoped>
</style>
