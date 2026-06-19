/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-08
* Time: 16:44
* Project: platform
*/

<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" width="500" persistent v-if="destinationVisit">
            <v-card>
                <v-card-title class="subheading">
                    Add a visit destination
                    <v-spacer></v-spacer>
                    <v-btn text icon color="red" small @click="close()">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider class="ma-0 pa-0"></v-divider>

                <v-card-text>
                    <v-row >
                        <v-col cols="12">
                            <p class="caption"><strong>Current Destinations: </strong></p>
                            <p class="title">{{ destinationVisit.queued_at }}</p>

                            <v-divider></v-divider>
                        </v-col>
                        <v-col cols="12">

                            <v-autocomplete
                                    v-model="visitDestination.add"
                                    :items="allDestinations"
                                    outline
                                    color="blue-grey lighten-2"
                                    label="Add Destination"
                                    item-text="name"
                                    item-value="id"
                                    multiple chips
                            >
                                <template slot="item" slot-scope="data">
                                    <template v-if="typeof data.item !== 'object'">
                                        <v-list-tile-content v-text="data.item"></v-list-tile-content>
                                    </template>
                                    <template v-else>
                                        <v-list-tile-content>
                                            <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                                        </v-list-tile-content>
                                    </template>
                                </template>
                            </v-autocomplete>

                        </v-col>

                        <v-col cols="12">
                            <users-search
                                    @results="userSelected"
                                   :roles-like="getCheckinToRoles"
                                   label="Search for doctor / consultant">
                            </users-search>
                        </v-col>

                        <v-col cols="12" v-if="visitDestination.consultants.length > 0">
                            <v-chip small outlined
                                    v-for="(consultant, index) in visitDestination.consultants"
                                    :key="consultant.id"
                                    close
                                    @click:close="removeConsultant(index)"
                                    color="primary"
                                    class="mx-2">
                                {{ consultant.name }}
                            </v-chip>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions>
                    <v-btn class="mb-2" color="blue" large block
                           :dark="!loader" :loading="loader" :disabled="loader"
                           @click="save()"
                    >
                        Add destination
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>

import { mapActions, mapGetters } from 'vuex';
import { _ } from 'vue-underscore';
import VisitDestination from '@reception/libs/visits/VisitDestination';

export default {
    props: {
        destinationVisit: {
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
            loader: false,
            allDestinations: [],
            visitDestinations: null,
            visitDestination: new VisitDestination,
        };
    },

    computed: {
        ...mapGetters([
            'getDestinations',
        ]),

        submitted() {
            return this.visitDestination.form.submitted;
        },

        getCheckinToRoles () {

            if(this.msetting('reception.checkin_to_roles')) {

                let reg = RegExp("[a-z]+", 'gi');

                let data = this.msetting('reception.checkin_to_roles');

                return data.match(reg);
            } else {
                return [];
            }
        },
    },

    watch: {
        show(val) {
            if (val) {
                this.dialog = true;
            }
        },

        destinations(value) {
            const destiantions = JSON.parse(this.destinations);

            this.visitDestination.visitId = destiantions[0].visit;

            this.visitDestinations = _.pluck(destiantions, 'destination');
        },

        getDestinations({ data }) {
            _.each(data, (group, index) => {
                const groupName = this.ucwords(index);
                this.allDestinations.push({ header: groupName });
                _.each(group, (destination, key) => {
                    this.allDestinations.push({
                        id: destination.id,
                        name: destination.name,
                    });
                });
                this.allDestinations.push({ divider: true });
            });
        },

        submitted(value) {
            if (value) {
                this.visitDestination.form.submitted = false;

                this.loader = false;

                this.visitDestination.visitId = null;
                this.visitDestination.add = [];

                this.$emit('changed');
            }
        },
    },

    methods: {
        ...mapActions([
            'setDestinations',
        ]),

        userSelected (val) {
            let consultant = {
                name: val.full_name,
                id: val.id
            }

            if(!this.visitDestination.consultants.some(consul => JSON.stringify(consul) === JSON.stringify(consultant))) {
                this.visitDestination.consultants.push(consultant);
            }
        },

        removeConsultant(index) {
            this.visitDestination.consultants.splice(index, 1);
        },

        ucwords(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        save() {
            this.loader = true;
            this.visitDestination.addDestinations();
        },

        close() {
            this.dialog = false;
            this.visitDestination.visitId = null;
            this.visitDestination.add = [];
            this.$emit('close');
        },
    },

    mounted() {
        this.dialog = this.show;
        this.visitDestination.visitId = this.destinationVisit.id;
        this.setDestinations();

        this.destinationVisit.consultants.forEach((consultant) => {
            this.visitDestination.consultants.push({
                name: consultant.consultant_name,
                id: consultant.consultant_id
            })
        });
    },

};
</script>

<style scoped lang="scss">

</style>
