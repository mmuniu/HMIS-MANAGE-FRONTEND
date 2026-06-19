<template>
    <v-container fluid>
        <v-row >
            <v-col cols="12">
                <internal-orders-create
                        :userId="userId"
                ></internal-orders-create>
            </v-col>

            <v-col cols="12" class="mt-5">
                <internal-orders-index></internal-orders-index>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import InternalOrdersCreate from "./partials/InternalOrdersCreate";
import InternalOrdersIndex from "./partials/InternalOrdersIndex";

export default {
    name: "InternalOrders",

    props: [
        "userId",
    ],

    components: {
        "internal-orders-create": InternalOrdersCreate,
        "internal-orders-index": InternalOrdersIndex,
    },
};
</script>
