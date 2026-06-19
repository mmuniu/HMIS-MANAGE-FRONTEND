<template>
    <v-row>
        <v-col cols="5">
            <v-card class="mx-3 tallish">
                <v-card-title class="subheading grey--text text--darken-2">
                    Order procedures form
                </v-card-title>

                <v-divider class="my-0"></v-divider>

                <evaluation-request-procedures :items="items" @itemAdded="till"></evaluation-request-procedures>
            </v-card>
        </v-col>

        <v-col cols="7">
            <v-card class="mx-3 tallish">
                <evaluation-procedures-cart :cart="cart"></evaluation-procedures-cart>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>

export default {
    props: [
        "content",
    ],

    data() {
        return {
            items: ["Nursing", "Doctor"],
            cart: [],
        };
    },

    methods: {
        till(cart) {
            this.cart = cart;
        },
    },
};
</script>

<style scoped>

</style>
