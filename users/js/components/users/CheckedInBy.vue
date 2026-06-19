/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-06-01
* Time: 01:22
*/

<template>
    <v-autocomplete outline clearable
                    :label="label"
                    class="mb-4"
                    :items="users" item-text="name"
                    v-model="user"
                    hide-no-data
                    :required="required"
                    :outlined="outlined"
                    return-object
                    @click:clear="clearedSelected()"
                    @change="selectItem()"
                    :search-input.sync="search"
                    :loading="loading"
    >
        <template slot="item" slot-scope="{ item }">
            <v-list-item-content>
                <v-list-item-title class="caption" v-text="item.name"></v-list-item-title>
            </v-list-item-content>
        </template>
    </v-autocomplete>
</template>

<script>
import _ from 'lodash';
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'checked-in-by',

    props: {
        roles: {
            // performs an exact match on roles
            default: () => [],
            type: Array,
        },

        rolesLike: {
            // performs a LIKE %role% on roles
            default: () => [],
            type: Array,
        },

        label: {
            type: String,
            default: 'Checked-in by',
        },

        leaveSelected: {
            type: Boolean,
            default: false,
        },

        outlined: {
            type: Boolean,
            default: false,
        },

    userList: {
        type: Boolean,
        default: false,
    },

        required: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            user: null,
            users: [],
            search: '',
            loading: false,
        };
    },

    watch: {
        search(term) {
            if (term && term.length > 2 && this.user === null) {
                this.placeholder = '';
                this.searchItems(term);
            } else if (term) {
                this.placeholder = 'Enter ' + (3 - term.length) + ' more characters';
            }
        },

        getUsers({ data }) {
            this.loading = false;
            this.users = data;
        },
    },

    computed: {
        ...mapGetters([
            'getUsers',
        ]),
    },

    methods: {
        ...mapActions([
            'setUsers',
        ]),

        clearedSelected() {
            this.$emit('clearedSelected');
            this.users = [];
            this.user = null;
        },

        searchItems: _.debounce(function search(search) {
            this.loading = true;

            const action = {
                params: {
                    'no_pagination': true,
                    'users_list': this.userList ? 1 : 0,
                },
                search,
            };

            if (this.roles.length > 0) {
                action.params.roles = _.join(this.roles, ',');
            } else if (this.rolesLike.length > 0) {
                action.params.roles_like = _.join(this.rolesLike, ',');
            }

            this.setUsers(action);
        }, 700),

        selectItem(us) {
            this.$emit('results', this.user);
            if (!this.leaveSelected) {
                this.users = [];
            }
            this.user = null;
        },
    },
};
</script>

<style scoped lang="scss">

</style>
