/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-07-12
* Time: 01:54
*/

<template>
    <div>
        <v-card>
            <v-card-title>
                <h3 class="title">OAUTH keys</h3>

                <v-spacer></v-spacer>

                <v-text-field
                        v-model="search"
                        append-icon="search"
                        label="Search"
                        hide-details
                ></v-text-field>

            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="! initialised"></collabmed-loading>

                <div v-else>

                    <v-data-table
                            flat
                            v-if="list"
                            :headers="headers"
                            :items="list"
                            :loading="loading"
                            :search="search"
                            hide-default-footer
                    >
                    </v-data-table>

                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import Environment from "@core/libs/Environment";

export default {
    data() {
        return {
            obj: new Environment(),
            headers: [
                { text: "#", value: "id" },
                { text: "User ID", value: "user_id" },
                { text: "Name", value: "name" },
                { text: "Secret", value: "secret" },
                { text: "Redirect", value: "redirect" },
                { text: "Personal Access Client", value: "personal_access_client" },
                { text: "Password Client", value: "password_client" },
                { text: "Revoked", value: "revoked" },
                { text: "Created On", value: "created_at" },
                // { text: 'Actions', value: 'value'},
            ],
            search: "",
            loading: true,
        };
    },

    computed: {
        list() {
            return this.obj.envConfig;
        },

        initialised() {
            return this.list;
        },
    },

    watch: {
        list(value) {
            if (value) {
                this.loading = false;
            }
        },
    },

    methods: {
        editItem(item) {
            flash({ message: "Not Permitted!", alert: "info" });
        },
    },

    mounted() {
        this.obj.getOauthConfig();
    },
};
</script>

<style scoped lang="scss">

</style>
