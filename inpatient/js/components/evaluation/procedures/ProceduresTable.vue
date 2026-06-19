<template>
    <v-card class="mx-3 tall" v-if="procedures">
        <v-data-table
                flat
                :headers="procedures.headers"
                :items="procedures.data"
                hide-default-footer
        >
            <template v-slot:item.date="{ item }">
                {{ item.created_at }}
                <br/>
                <span class="grey--text text--darken-1" v-if="item.user" v-text="item.user.full_name"></span>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import Evaluator from "@dialysis/libs/evaluation/Evaluator";
import StoreProduct from "@inventory/libs/products/StoreProduct";

export default {
    props: [
        "content",
    ],

    data() {
        return {

        };
    },

    computed: {
        procedures() {
            return this.content.procedures_done;
        },
    },

    mounted() {
    },
};
</script>

<style scoped>

</style>
