<template>
    <div>
        <!-- Order procedures for a visit -->
        <v-card class="mb-4">
            <v-card-text>
                <theatre-order-procedures :items="items" 
                            :domain="domain"
                        :visit_identifier="visit_id"
                        :destination="destination"
                        :admission_id="admission_id"
                        :operation_id="operation_id"
                        :user_id="user"
                        :visit_id="visit_id"
                ></theatre-order-procedures>
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
        'destination', 'admission_id','visit_id','operation_id'
    ],

    data() {
        return {
            items: ['Lab', 'Ultrasound', 'Radiology', 'LABORATORY', 'RADIOLOGY'],
            domain: 'investigations',
        };
    },
};
</script>
