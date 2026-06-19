<template>
    <v-dialog v-model="dialog" persistent max-width="70%">
        <template v-slot:activator="{ on }">
            <v-btn color="primary" dark v-on="on">Add new</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary white--text">
                Add a new region
                <v-spacer/>

                <v-btn icon @click="dialog = false">
                    <v-icon color="red">close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field label="Name" v-model="region.name"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field label="Address" v-model="region.address"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field label="Mobile" v-model="region.mobile"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field label="Email" v-model="region.email"></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer/>
                <v-btn color="green white--text darken-1" @click="submit()">Submit</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import Region from "@settings/libs/regions/Regions";

export default {
    data: () => ({
        dialog: false,
        region: new Region(),
    }),

    methods: {
        async submit() {
            const response = this.region.save();

            if (response) {
                this.dialog = false;
                this.$emit("regionCreated");
            }
        },
    },
};
</script>
