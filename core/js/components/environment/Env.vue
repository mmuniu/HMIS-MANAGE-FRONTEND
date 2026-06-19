/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-07-11
* Time: 23:14
*/

<template>
    <div>
        <v-card>
            <v-card-title>
                <h3 class="title">.ENV Configuration</h3>

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
                { text: "Name", value: "name" },
                { text: "Value", value: "value" },
            ],
            search: "",
            loading: true,
        };
    },

    computed: {
        list() {
            return _.map(this.obj.envConfig, (item) => {
                return {
                    name: item.name,
                    value: item.value,
                    slug: item.name,
                };
            });
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
        this.obj.getEnvConfig();
    },
};
</script>

<style scoped lang="scss">

</style>
