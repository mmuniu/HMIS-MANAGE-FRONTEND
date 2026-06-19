<template>
    <v-card class="mb-4">
        <v-card-text>
            <order-procedures :items="items" :domain="domain"></order-procedures>
        </v-card-text>
    </v-card>
</template>

<script>
import Investigation from '@evaluation/libs/investigations/Investigation';

export default {
    data() {
        return {
            investigation: new Investigation(),
            items: ['Lab'],
            domain: 'investigations',
        };
    },
};
</script>
