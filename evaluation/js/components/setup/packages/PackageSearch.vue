<template>
    <v-autocomplete
        v-model="selected"
        :loading="loading"
        :items="packages.data"
        :search-input.sync="search"
        @input="packageSelected()"
        color="black"
        class="black--text"
        item-text="name"
        :placeholder="placeholder"
        item-value="id"
        flat
        clearable
        @click:clear="packageSelectionCleared()"
        hide-no-data no-filter outline hide-details
        :label="label"
        return-object
    ></v-autocomplete>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
    props: {
        label: {
            type: String,
            default: 'Search for package',
        },
        placeholder: {
            type: String,
            default: 'Start typing to search',
        },
    },

    data () {
        return {
            search: '',
            loading: false,
            selected: null,
        }
    },

    computed: {
        ...mapGetters({
            packages: 'getPackages'
        })
    },

    methods: {
        ...mapActions([
            'setPackages'
        ]),

        packageSelected () {
            this.$emit('input', this.selected);
        },

        packageSelectionCleared () {
            this.$emit('cleared');
        }
    },

    mounted () {
        this.setPackages();
    }
}
</script>
