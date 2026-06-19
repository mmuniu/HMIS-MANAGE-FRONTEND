/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-14
* Time: 10:37
* Project: platform
*/

<template>
    <v-card class="grey lighten-3">
        <v-card-title primary-title>
            <h5 class="font-weight-bold font-weight-thin headline">Changes - {{ item.charge ? item.charge.name : item.charge_id }}</h5></v-card-title>
        <v-card-text>
            <v-data-table
                    :items="changes"
                    :headers="headers"
                    class="" flat hide-default-footer
            >
                <template v-slot:item.new_price="{ item }" class="td-amount">
                    <strong>{{ item.old_price }}</strong>
                    <v-icon class="mx-2" color="blue" small>arrow_right_alt</v-icon>
                    <strong>{{ item.new_price | numberFormat }}</strong>
                </template>
                <template v-slot:item.new_quantity="{ item }">
                    <strong>{{ item.old_quantity }}</strong>
                    <v-icon class="mx-2" color="blue" small>arrow_right_alt</v-icon>
                    <strong>{{ item.new_quantity | numberFormatInt  }}</strong>
                </template>
                <template v-slot:item.new_discount="{ item }">
                    <strong>{{ item.old_discount }}</strong>
                    <v-icon class="mx-2" color="blue" small>arrow_right_alt</v-icon>
                    <strong>{{ item.new_discount | numberFormat  }}</strong>
                </template>
                <template v-slot:item.new_amount="{ item }" class="td-amount">
                    <strong>{{ item.old_amount }}</strong>
                    <v-icon class="mx-2" color="blue" small>arrow_right_alt</v-icon>
                    <strong>{{ item.new_amount | numberFormat  }}</strong>
                </template>
                <template v-slot:item.notes="{ item }"><div v-html="item.notes"></div></template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>

export default {
    props: {
        item: {
            required: true,
        },

        changes: {
            required: true,
        },

    },

    data() {
        return {
            headers: [
                { text: "Changed By", value: "user.full_name" },
                { text: "Price", value: "new_price" },
                { text: "Quantity", value: "new_quantity" },
                { text: "Discount", value: "new_discount" },
                { text: "Amount", value: "new_amount" },
                { text: "Date", value: "created_at" },
                { text: "Reason / Notes", value: "notes" },
            ],
        };
    },
};
</script>

<style scoped lang="scss">
    .td-amount {
        min-width: 210px;
    }
</style>
