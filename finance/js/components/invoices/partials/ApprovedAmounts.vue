<template>
    <v-dialog v-model="dialog" persistent max-width="800">
        <template v-slot:activator="{ on, attrs }">
            <v-btn color="success" dark v-bind="attrs" v-on="on">
                approved amounts
            </v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary ">Add approved amounts</v-card-title>
            <v-card-text>

            </v-card-text>
            <v-card-actions>
                <v-btn color="green darken-1" text @click="dialog = false">Agree</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    props: [
        'invoice',
    ],

    data: () => ({
        dialog: false,
    }),
};
</script>
