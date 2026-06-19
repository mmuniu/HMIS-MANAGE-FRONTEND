/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-05-19
* Time: 16:18
*/

<template>
    <v-autocomplete  outline clearable
                    label="Search and select procedure"
                    class="mb-4"
                    :items="procedures" item-text="name"
                    v-model="procedure"
                    hide-no-data
                    return-object
                    @change="selectItem()"
                    :search-input.sync="search"
                    :loading="loading"
                    :hint="placeholder"
    >
        <template slot="item" slot-scope="{ item }">
            <v-list-tile-content>
                <v-list-tile-title class="caption" v-text="item.name"></v-list-tile-title>
                <v-list-tile-sub-title>
                    <span class="caption blue--text font-weight-bold" v-if="item.exclusion_price">Exclusion Price: {{ item.exclusion_price }} </span>
                </v-list-tile-sub-title>

            </v-list-tile-content>
        </template>
    </v-autocomplete>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {
            procedure: null,
            procedures: [],
            search: '',
            loading: false,
            placeholder: '',
        };
    },

    watch: {
        search(term) {
            if (term && term.length > 2 && this.procedure === null) {
                this.placeholder = '';
                this.searchProcedures(term);
            } else if (term) {
                this.placeholder = 'Enter ' + (3 - term.length) + ' more characters';
            }
        },

        getProcedures({ data }) {
            this.loading = false;
            this.procedures = data;
        },
    },

    computed: {
        ...mapGetters([
            'getProcedures',
        ]),
    },

    methods: {
        ...mapActions([
            'setProcedures',
        ]),

        searchProcedures: _.debounce(function search(search) {
            this.loading = true;

            const action = {
                params: {
                    'no_pagination': true,
                },
                search,
            };

            this.setProcedures(action);
        }, 700),

        selectItem() {
            this.$emit('results', this.procedure);
            this.procedures = [];
            this.procedure = null;
        },
    },
};
</script>

<style scoped lang="scss">

</style>
