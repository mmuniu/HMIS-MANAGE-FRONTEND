<template>
    <v-data-table
        :headers="headers"
        :items="items"
        disable-pagination
        hide-default-footer
    >
        <template v-slot:item.name="item">
            <span>{{ item.item.name }}</span> <br/>
            <span class="grey--text  caption">
                <span>Cash Price:  {{ item.item.cash_price }}</span>
                <span class="mx-2">Insurance Price:  {{ item.item.insurance_price }}</span>
            </span>
        </template>
        <template v-slot:item.cash_price="item">
            <input
                type="number"
                v-model="item.item.new_cash_price"
                style="width: 60%"
            />
        </template>
        <template v-slot:item.insurance_price="item">
            <input
                type="number"
                v-model="item.item.new_insurance_price"
                style="width: 60%"
            />
        </template>
        <template v-slot:item.units="item">
            <input
                type="number"
                v-model="item.item.units"
                style="width: 60%"
            />
        </template>
        <template v-slot:item.actions="item">
            <v-btn small
                   color="error"
                   icon
                   @click="removeItem(item, type)">
                <v-icon small>delete</v-icon>
            </v-btn>
        </template>
    </v-data-table>
</template>
<script>
export default {
    props: [
        'items', 'type'
    ],

    data() {
        return {
            headers: [
                { text: 'Name', value: 'name'},
                { text: 'Cash price', value: 'cash_price'},
                { text: 'Insurance price', value: 'insurance_price'},
                { text: 'Units', value: 'units'},
                { text: 'Actions', value: 'actions'},
            ]
        }
    },

    methods: {
        removeItem (item, type) {
            this.$emit('removeItem', item, type);
        }
    }
}
</script>
<style scoped>
    input[type=number] {
        padding: 7px 15px;
        margin: 3px 0;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }
</style>
