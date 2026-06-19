<template>
    <div>
        <!-- Order procedures for a visit -->
        <v-card class="mb-4">
            <v-card-text>
                <order-procedures :items="items" :domain="domain"
                                  :visit_identifier="visit_id"
                                  :destination="destination"
                                  :admission_id="admission_id"
                ></order-procedures>
            </v-card-text>
        </v-card>

        <!-- List of all the ordered procedures during the visit -->
        <v-card>
            <v-card-title class="text-bold grey--text text--darken-1">
                List of ordered procedures
            </v-card-title>

            <v-divider class="my-0"></v-divider>

            <v-card-text>
                <ordered-procedures :domain="domain"
                                    :visit_identifier="visit_id"
                                    :destination="destination"
                ></ordered-procedures>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    props: [
        'visit_id', 'destination', 'admission_id',
    ],

    data() {
        return {
            items: ['Lab', 'Ultrasound', 'Radiology', 'LABORATORY', 'RADIOLOGY'],
            domain: 'investigations',
        };
    },
};
</script>
