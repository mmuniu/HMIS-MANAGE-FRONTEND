/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-05-23
* Time: 16:53
*/

<template>

    <form @submit.prevent="search">
        <v-alert :value="true" v-if="errors" type="error" outline>
            <div v-html="errors"></div>
        </v-alert>

        <v-row class="row-fluid" >
            <v-col cols="4" sm="3" md="2">
                <v-text-field
                        v-model="filters.ip_number"
                        class="mr-2"
                        label="IP Number"
                        hide-details
                ></v-text-field>
            </v-col>
            <v-col cols="4" sm="3" md="2">
                <v-select
                        v-model="filters.name_category"
                        :items="categories"
                        item-text="text"
                        item-value="value"
                        label="Name Category"
                        hide-details
                ></v-select>
            </v-col>
            <v-col cols="5" sm="4" md="3">
                <v-text-field
                        v-model="filters.names"
                        class="mr-2"
                        append-icon="search"
                        label="Name"
                        hide-details
                ></v-text-field>
            </v-col>
            <v-col cols="4" sm="3" md="2">
                <v-text-field
                        v-model="filters.bed_number"
                        class="mr-2"
                        label="Bed Number"
                        hide-details
                ></v-text-field>
            </v-col>
            <v-col cols="4" sm="3" md="3">
                <v-row>
                    <v-col>
                        <v-btn dark color="primary" type="submit" :loading="loading">
                            <v-icon class="pl-2">search</v-icon>
                            Search
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn dark color="orange" type="reset" @click="reset" :loading="loading">
                            <v-icon class="pl-2">undo</v-icon>
                            Reset
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

    </form>


</template>

<script>


export default {
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            filters: {
                search: true,
            },
            categories: [
                { text: "First Name", value: "first_name" },
                { text: "Middle Name", value: "middle_name" },
                { text: "Last Name", value: "last_name" },
            ],

            errors: null,
        };
    },

    methods: {
        search() {
            this.errors = null;

            if (this.filters.hasOwnProperty("names") && ! this.filters.hasOwnProperty("name_category")) {
                this.errors = "Please select one name category";
                return;
            }

            this.$emit("search", this.filters);
        },

        reset() {
            this.filters = {
                search: true,
            };
            this.$emit("reset");
        },
    },

    mounted() {
        //
    },
};
</script>

<style scoped lang="scss">

</style>
