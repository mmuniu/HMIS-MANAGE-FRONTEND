/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-09
* Time: 15:34
* Project: platform
*/

<template>
    <div>
        <v-dialog v-model="dialog" max-width="75%" persistent>
            <v-card v-if="item">
                <v-card-title primary-title class="teal white--text">
                    <div>
                        <p class="headline">{{ item.name }}</p>
                    </div>

                    <v-spacer></v-spacer>

                    <v-btn fab color="teal" dark small @click="close()">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>

                    <v-row  v-if="item.prices">
                        <v-col cols="12" sm="6" md="4" lg="4" v-for="(item, index) in item.prices" :key="index">
                            <v-card class="ml-2">
                                <v-card-title>
                                    <strong>Facility:</strong> {{ item.facility_name }}
                                </v-card-title>

                                <v-card-text>
                                    <p><strong>Cash:</strong> {{ item.cash_charge | numberFormat }}</p>
                                    <p><strong>Insurance:</strong> {{ item.insurance_charge | numberFormat }}</p>
                                    <p>
                                        <strong>Precharge:</strong>
                                        <v-icon color="green" v-if="item.precharge">check</v-icon>
                                        <v-icon color="red" v-else>clear</v-icon>
                                    </p>
                                    <p>
                                        <strong>Status(Active):</strong>
                                        <v-icon color="green" v-if="item.status">check</v-icon>
                                        <v-icon color="red" v-else>clear</v-icon>
                                    </p>
                                    <p>
                                        <strong>Charge Insurance:</strong>
                                        <v-icon color="green" v-if="item.charge_insurance">check</v-icon>
                                        <v-icon color="red" v-else>clear</v-icon>
                                    </p>
                                    <p><strong>Last Updated On: </strong> {{ item.updated_at }}</p>

                                </v-card-text>
                            </v-card>

                        </v-col>
                    </v-row>

                    <v-alert v-else :value="true" type="error" outline>
                        The item procedure has no facility prices set.
                    </v-alert>

                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue" text @click="close()">Close</v-btn>
                </v-card-actions>
            </v-card>

            <v-alert v-else :value="true" type="error" outline>
                No Order item
            </v-alert>
        </v-dialog>
    </div>
</template>

<script>

export default {
    props: {
        item: {
            required: true,
            type: Object,
        },

        show: {
            required: true,
            type: Boolean,
        },
    },

    data() {
        return {
            dialog: false,
        };
    },

    watch: {
        show(val) {
            if (val) {
                this.dialog = true;
            }
        },
    },

    methods: {
        close() {
            this.dialog = false;
            this.$emit('close');
        },
    },

    mounted() {
        this.dialog = this.show;
    },
};
</script>

<style scoped lang="scss">

</style>
