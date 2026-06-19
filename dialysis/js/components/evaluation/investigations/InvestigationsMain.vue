<template>
    <div>
        <!-- Order procedures for a visit -->
        <v-card class="mb-4">
            <v-card-text>
                <order-procedures :items="items" :domain="domain"></order-procedures>
            </v-card-text>
        </v-card>

        <!-- List of all the ordered procedures during the visit -->
        <v-card>
            <v-card-title class="text-bold grey--text text--darken-1">
                List of ordered procedures
            </v-card-title>

            <v-divider class="my-0"></v-divider>

            <v-card-text>
                <ordered-procedures :domain="domain"></ordered-procedures>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            items: ["Nursing", "Doctor", "Dental", "ENT"],
            domain: "treatment",
        };
    },
};
</script>
