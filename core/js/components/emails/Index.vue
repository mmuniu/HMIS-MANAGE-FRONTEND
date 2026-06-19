<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey-text text-darken-2">
            <h2 class="body-2 ma-0 pa-0">Emails Sent via the System</h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-col offset-md="8" md="4" cols="12">
                <v-text-field prepend-inner-icon="search" :label="label" v-model="search"
                              outlined hide-details>
                </v-text-field>
            </v-col>
        </v-card-text>

        <h1> &nbsp; </h1>

        <v-data-table
                :headers="list.headers"
                :items="list.data"
                :loading="loading"
                class="mb-3" flat hide-default-footer
        >
            <template v-slot:item.group="{ item }">{{ item.group ? item.group.name : '-' }}</template>
            <template v-slot:item.sent_by="{ item }">{{ item.user ? item.user.full_name : '-' }}</template>
            <template v-slot:item.date="{ item }">{{ item.created_at }}</template>
            <template v-slot:item.actions="{ item }">
                <v-btn small outlined color="blue" @click="viewMessage(item)">
                    <v-icon small class="pr-2">fa fa-envelope</v-icon> View Message
                </v-btn>
            </template>

            <v-row  class="py-2 pb-2">
                <v-col cols="8" class="mt-3 ml-3">
                    Total email records: {{ list.meta.total }}
                </v-col>

                <v-col cols="3" class="text-right">
                    <v-btn icon @click="navigate(list.links.prev)">
                        <v-icon>chevron_left</v-icon>
                    </v-btn>

                    <v-btn icon @click="navigate(list.links.next)">
                        <v-icon>chevron_right</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
        </v-data-table>


        <v-dialog v-model="dialog" width="70%">

            <v-card v-if="selected">
                <v-card-title class="headline teal lighten-2 white--text" primary-title>
                    {{ selected.subject | ucwords }}
                </v-card-title>

                <v-card-text>
                    <p><strong>Facility:</strong> {{ selected.facility_name }}</p>
                    <p v-if="selected.cc"><strong>CC:</strong> {{ selected.cc.join(', ') }}</p>
                    <p v-if="selected.bcc"><strong>BCC:</strong> {{ selected.bcc.join(', ') }}</p>
                    <v-divider></v-divider>

                    <div v-html="selected.body"></div>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="dialog = false">  Close </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import _ from "lodash";

export default {
    data() {
        return {
            search: null,
            list: null,
            dialog: false,
            selected: null,
            loading: true,
            label: "Search Emails...",
        };
    },

    computed: {
        ...mapGetters([
            "getEmails",
        ]),

        initialised() {
            return this.list;
        },
    },

    watch: {
        getEmails(value) {
            if (value) {
                this.list = value;
                this.loading = false;
            }
        },

        initialised(value) {
            if (value) {
                this.loading = false;
            }
        },

        search(term, old) {
            if (term.length > 3 && term.length > old.length) {
                this.refresh(term);
                this.label = "Search Emails...";
            } else if (term.length > 0 && term.length <= 3) {
                this.label = "Enter " + (4 - term.length) + " more characters";
            } else {
                this.label = "Search Emails...";
            }

            if (term.length == 0) {
                this.setEmails({ page: 1 });
            }
        },
    },

    methods: {
        ...mapActions([
            "setEmails",
        ]),

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];
                this.setEmails({ page });
            }
        },

        viewMessage(email) {
            this.selected = email;
            this.dialog = true;
        },

        refresh: _.debounce(function(value) {
            this.loading = true;
            this.setEmails({
                search: value,
            });
        }, 1000),

    },

    mounted() {
        this.setEmails();
    },
};
</script>

<style scoped lang="scss">

</style>
