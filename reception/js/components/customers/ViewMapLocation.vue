<template>
    <collabmed-loading v-if="!initialized"></collabmed-loading>
    <v-card flat v-else>
        <!--<iframe width="600" height="450" frameborder="0" style="border:0"
                src="https://www.google.com/maps/embed/v1/place?q=place_id:ChIJY11u4K8lKxgRd8VlotjU4Wg&key=AIzaSyAXPsC6VZy82P_LaXTx4_ufWT9NWdS5SMU"
                allowfullscreen>
        </iframe>-->
        <iframe
                width="100%"
                height="800"
                frameborder="0"
                scrolling="no"
                marginheight="0"
                marginwidth="0"
                :src="location"
        >
        </iframe>
    </v-card>
</template>
<script>
export default {
    data() {
        return {
            lat: null,
            long: null,
            location: null,
        };
    },

    watch: {
        lat() {
            this.setLocation();
        },

        long() {
            this.setLocation();
        },
    },

    methods: {
        setLocation() {
            this.location = 'https://www.google.com/maps/embed/v1/place?key=AIzaSyAXPsC6VZy82P_LaXTx4_ufWT9NWdS5SMU&q=' + this.lat + ', ' + this.long + '&zoom=10';
            // this.location = "https://maps.google.com/maps?q=10.305385,77.923029&hl=es;z=14&amp;output=embed";
        },

        initialized() {
            return !this.lat || !this.long;
        },
    },

    mounted() {
        if (Object.keys(this.$route.query).length > 0) {
            if (this.$route.query.lat) {
                this.lat = this.$route.query.lat;
            }
            if (this.$route.query.long) {
                this.long = this.$route.query.long;
            }
        }
    },
};
</script>
