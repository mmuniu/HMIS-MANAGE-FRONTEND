/**
* Created by PhpStorm.
* User: jjoek
* Date: 2019-11-01
* Time: 01:59
*/

<template>
    <v-autocomplete outline clearable
                    :label="label"
                    class="mb-4"
                    :items="schemes" item-text="name"
                    v-model="scheme"
                    hide-no-data
                    :disabled="disabled"
                    return-object
                    @click:clear="clearedSelected()"
                    @change="selectItem()"
                    :search-input.sync="search"
                    :loading="loading"
                    :hint="placeholder"
    >
        <template slot="item" slot-scope="{ item }">
            <v-list-tile-content>
                <v-list-tile-title class="caption" v-text="item.name"></v-list-tile-title>
            </v-list-tile-content>
        </template>
    </v-autocomplete>
</template>

<script>
import _ from "lodash";
import { mapGetters, mapActions } from "vuex";

export default {
    name: "schemes-search",

    props: [
        'leaveSelected', 'disabled', 'companyId'
    ],

    data() {
        return {
            scheme: null,
            search: "",
            loading: false,
            placeholder: "",
        };
    },

    watch: {
        search(term) {
            if (term && term.length > 2 && this.scheme === null) {
                this.placeholder = "";
                this.searchItems(term);
            } else if (term) {
                this.placeholder = "Enter " + (3 - term.length) + " more characters";
            }
        },
    },

    computed: {
        ...mapGetters({
            schemes: "getSchemes",
        }),
    },

    methods: {
        ...mapActions([
            "setSchemes",
        ]),

        clearedSelected() {
            this.$emit("clearedSelected");
            this.schemes = [];
            this.scheme = null;
        },

        searchItems: _.debounce(function search(search) {
            this.loading = true;

            const action = {
                params: {
                    "no_pagination": true,
                },
                search,
            };

            if(this.companyId) {
                action.params.company_id = this.companyId
            }

            this.setSchemes(action);
        }, 700),

        selectItem(us) {
            this.$emit("results", this.scheme);

            if (!this.leaveSelected) {
                this.schemes = [];
                this.scheme = null;
            }
        },
    },
};
</script>

<style scoped lang="scss">

</style>
