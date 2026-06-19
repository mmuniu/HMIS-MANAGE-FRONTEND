<template>
    <div>
        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <v-card v-else>
            <v-card-title class="subheading grey-text text-darken-2">
                <h2 class="body-2 ma-0 pa-0">List of all users</h2>
                <v-spacer></v-spacer>
                <users-search class="pt-2"
                              @results="userSelected"
                              leaveSelected
                              user-list
                              @clearedSelected="reloadData"
                ></users-search>
            </v-card-title>

            <v-divider class="my-0"></v-divider>

            <v-card-text>
                <v-data-table
                        :headers="headers"
                        :items="users.data"
                        disable-pagination
                        class="mb-3" flat
                        hide-default-footer
                >
                    <template v-slot:item.actions="{ item }">
                        <v-btn small color="primary" @click="profile(item)">profile</v-btn>
                        <v-btn small color="red"
                               v-if="item.active"
                               @click="deactivate(item)">
                            Deactivate
                        </v-btn>
                        <v-btn small color="success"
                               v-else @click="reactivate(item)">
                            Reactivate
                        </v-btn>
                    </template>

                    <template slot="footer" v-if="users.meta">
                        <v-row  class="py-2 pb-2">
                            <v-col cols="2" class="mt-3 ml-3">
                                Total number of users: {{ users.meta.total }}
                            </v-col>

                            <v-col cols="8" class="text-center">
                                <v-pagination
                                        v-model="page"
                                        :length="users.meta.last_page"
                                        circle
                                        :total-visible="8"
                                ></v-pagination>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
    data: () => ({
        page: 1,
        headers: [
            { text: "Name", value: "full_name", sortable: false },
            { text: "Username", value: "username", sortable: false },
            { text: "Email", value: "email", sortable: false },
            { text: "Roles", value: "roles", sortable: false },
            { text: "Registered on", value: "created_at", sortable: false },
            { text: "Actions", value: "actions", sortable: false },
        ],
    }),

    watch: {
        page(value) {
            this.page = value;

            this.initialize();
        },
    },

    computed: {
        ...mapGetters({
            users: "getUsers",
        }),

        initialised() {
            return this.users.data ? true : false;
        },
    },

    methods: {
        ...mapActions([
            "setUsers",
        ]),

        initialize() {
            this.setUsers({
                page: this.page,
                params: {
                    users_list: true,
                },
            });
        },

        reloadData() {
            this.initialize();
        },

        profile(user) {
            window.open(`/users/${user.id}/info`, "_self");
        },

        deactivate(user) {
            window.open(`/users/manage/${user.id}/deactivate`, "_self");
        },

        reactivate(user) {
            window.open(`/users/manage/${user.id}/reactivate`, "_self");
        },
    },

    mounted() {
        this.initialize();
    },
};
</script>
