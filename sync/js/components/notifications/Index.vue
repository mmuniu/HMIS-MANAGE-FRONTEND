/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-07-08
* Time: 14:49
*/

<template>
    <div>
        <v-card>
            <v-card-title>
                <h3 class="title">Sync Notifications</h3>
            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="! initialised"></collabmed-loading>

                <div v-else>

                    <v-row>
                        <v-col cols="12" md="6" offset-md="6">
                            <v-text-field
                                    v-model="search"
                                    append-icon="search"
                                    label="Search from loaded results"
                                    hide-details
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <v-data-table
                            :headers="list.headers"
                            :items="list.data"
                            :search="search"
                            hide-default-footer
                            class="mb-3"
                            flat
                    >
                        <template v-slot:item.user_name="{ item }">
                            {{ item.user_id }}
                            <br/>
                            <small v-if="item.user_name">~ {{ item.user_name }}</small>
                        </template>
                        <template v-slot:item.facility_identifier="{ item }">
                            {{ item.facility_identifier }}
                            <br/>
                            <small v-if="item.facility_name">{{ item.facility_name }}</small>
                        </template>
                        <template v-slot:item.data="{ item }">
                            <div v-html="item.data"></div>
                        </template>
                        <template v-slot:item.date="{ item }">
                            {{ item.created_at }}
                            <br/>
                            <small v-if="item.created_at_w3c" class="grey--text">~ {{ item.created_at_w3c | moment('from') }}</small>
                        </template>
                    </v-data-table>
                </div>
            </v-card-text>
        </v-card>

    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
    data() {
        return {
            search: "",
        };
    },

    computed: {
        ...mapGetters([
            "getSyncNotifications",
        ]),

        list() {
            return this.getSyncNotifications;
        },

        initialised() {
            return this.list;
        },
    },

    watch: {
        //
    },

    methods: {
        ...mapActions([
            "setSyncNotifications",
        ]),

        initialise() {
            this.setSyncNotifications();
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped lang="scss">

</style>
