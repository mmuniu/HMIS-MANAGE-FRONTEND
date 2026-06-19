/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 23/09/2019
* Time: 00:51
*/

<template>
    <v-container v-if="meta" style="padding: 0" fluid>
        <v-divider v-if="border"></v-divider>
        <v-row class="my-2"  >
            <v-col cols="12" md="6" lg="5" class="mt-3">
                <span class="ml-3">Showing {{ meta.from }} to {{ meta.to }} of {{ meta.total }} records</span>
            </v-col>

            <v-col cols="12" md="6" lg="7">
                <v-pagination
                        v-model="page"
                        :length="meta.last_page"
                        circle
                        :total-visible="totalVisible"
                ></v-pagination>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    props: {
        meta: {
            required: true,
        },

        totalVisible: {
            type: Number,
            default: 6,
        },

        border: {
            default: true,
            type: Boolean,
        },
    },

    data() {
        return {
            page: 1,
        };
    },

    computed: {
        //
    },

    watch: {
        page(val) {
            this.$emit('change', val);
        },
    },

    methods: {
        //
    },

    mounted() {
        //
    },
};
</script>

<style scoped lang="scss">

</style>
