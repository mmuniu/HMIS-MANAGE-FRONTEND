<template>
    <div>
        <h5 class="headline " style="font-weight: bold; text-decoration: underline">Inpatient Notes (Doctor/Nurse)</h5>

        <v-container fluid  v-if="list && list.length > 0">
            <v-row >
                <v-col md="6">
                    <p style="font-weight: bold">Name</p>
                </v-col>
                <v-col md="6">
                    <p style="font-weight: bold">Value</p>
                </v-col>
            </v-row>

            <v-row  v-for="item in list" :key="item.name" class="py-1">
                <v-col cols="6">{{ item.name | snakeCaseToSentenceCaseCapitalizeWords }}</v-col>
                <v-col cols="6">{{ item.value }}</v-col>
            </v-row>
        </v-container>

        <v-alert v-else :value="true" type="info">
            No data found
        </v-alert>
    </div>

</template>

<script>
export default {
    props: ['items'],

    data() {
        return {
            headers: [
                { text: 'Name', value: 'name' },
                { text: 'Title', value: 'title' },
                { text: 'Notes', value: 'notes' },
                { text: 'Date', value: 'date' },
            ],
        };
    },

    computed: {
        list() {
            return this.items;
        },
    },
};
</script>

<style scoped>
</style>
