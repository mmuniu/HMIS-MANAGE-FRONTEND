<template>
    <v-card class="mx-3 tall" v-if="investigations">
        <v-data-table
                flat
                :headers="investigations.headers"
                :items="investigations.data"
                hide-default-footer
        >
            <template v-slot:item.date="{ item}">
                {{ item.created_at }}
                <br/>
                <span class="black--text text--darken-1" v-if="item.user" v-text="item.user.full_name"></span>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
    props: [
        "content",
    ],

    data() {
        return {
            investigations: [],
        };
    },

    watch: {
        getInvestigations(investigations) {
            this.investigations = investigations;
        },
    },

    computed: {
        ...mapGetters([
            "getInvestigations",
        ]),
    },

    methods: {
        ...mapActions([
            "setInvestigations",
        ]),
    },

    mounted() {
        this.setInvestigations({
            "params": {
                "visit_id": this.$route.params.visitId,
            },
        });
    },
};
</script>

<style scoped>

</style>
