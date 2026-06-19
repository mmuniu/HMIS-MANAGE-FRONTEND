<template>
    <v-autocomplete
            clearable
            hide-details
            solo flat
            return-object
            large
            prepend-inner-icon="search"
            single-line placeholder="Search for a icd10 diagnosis"
            :items="icd10.search.results" item-text="name"
            :no-filter="true"
            @input="diagnosisSelected()"
            item-value="id" v-model="selectedResult" label="Condition"
            :loading="searching"
            :search-input.sync="icd10.search.term"
            outline
    >
        <template slot="item" slot-scope="{ item }">
            <v-list-tile-avatar color="cyan" size="42"  class="headline font-weight-light white--text">
                <span class="subheading caption"  >{{ item.code }}</span>
            </v-list-tile-avatar>
            <v-list-tile-content>
                <v-list-tile-title class="caption" v-text="item.name"></v-list-tile-title>
            </v-list-tile-content>
        </template>
    </v-autocomplete>
</template>
<script>
import Icd10 from '@evaluation/libs/icd10/Icd10';

export default {
    data() {
        return {
            icd10: new Icd10(),
            selectedResult: null,
        };
    },

    computed: {
        term() {
            return this.icd10.search.term;
        },

        searching() {
            return this.icd10.search.loading;
        },

    },

    watch: {
        term(value) {
            if (value) {
                if (value.length > 2) {
                    if (value.charAt(1) === '-') {
                        this.searchByCode();
                    } else {
                        this.searchByName();
                    }
                } else {
                    this.resetSearch();
                }
            }
        },
    },

    methods: {
        diagnosisSelected() {
            this.$emit('results', this.selectedResult);
        },

        searchByCode: _.debounce(function search(search) {
            this.icd10.searchByCode();
        }, 700),

        searchByName: _.debounce(function search(search) {
            this.icd10.searchByName();
        }, 700),

        resetSearch: _.debounce(function search(search) {
            this.icd10.search.reset();
        }, 700),
    },
};
</script>
