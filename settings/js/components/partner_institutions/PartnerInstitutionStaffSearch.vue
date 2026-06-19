<template>
    <v-autocomplete
            v-model="selected"
            :loading="loading"
            :items="staff.data"
            :search-input.sync="search"
            @input="staffSelected()"
            color="black"
            class="black--text"
            item-text="name"
            item-value="id"
            flat clearable
            hide-no-data no-filter outline hide-details
            :label="label"
            return-object
    ></v-autocomplete>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        label: {
            type: String,
            default: "Search",
        },
    },

    data: () => ({
        loading: false,
        search: null,
        selected: null,
        placeholder: null,
    }),

    computed: {
        ...mapGetters({
            staff: "getInstitutionStaff",
        }),
    },

    watch: {
        search(val) {
            if (val != null && val.length > 3 || !this.selected) {
                this.performSearch();
            } else {
                this.placeholder = this.selected ? this.selected.name : null;
            }
        },
    },

    methods: {
        ...mapActions([
            "setInstitutionStaff",
        ]),

        staffSelected() {
            this.$emit("results", this.selected);
        },

        performSearch: _.debounce(function() {
            this.loading = true;
            this.setInstitutionStaff({
                params: {
                    search: this.search,
                },
            });
        }, 1000),
    },
};
</script>
