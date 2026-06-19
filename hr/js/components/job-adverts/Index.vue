<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 01/11/2018
* Time: 18:28
* Project: platform
-->

<template>
    <div>
        <v-layout>
            <v-flex xs6>
                <h5 class="headline">Job Adverts</h5>
            </v-flex>
            <v-flex xs6>
                <v-btn class="primary pull-right" @click="dialog = true">
                    <v-icon class="pr-2">add_circle_outline</v-icon> Job Advertisement
                </v-btn>
            </v-flex>
        </v-layout>

        <!-- dialogue -->
        <create :dialog="dialog" v-on:close="dialog = false"></create>


        <v-data-table
                v-if="list"
                :headers="headers"
                :items="list"
                hide-default-footer
                class="elevation-1"
        >
            <template slot="items" slot-scope="props">
                <td>{{ props.item.title }}</td>
                <td>{{ props.item.description }}</td>
                <td>{{ props.item.position }}</td>
                <td>{{ props.item.department.name }}</td>
                <td>{{ props.item.expiry_date }}</td>
                <td>{{ props.item.remunerations }}</td>
                <td>{{ props.item.created_at }}</td>

                <td>
                    <v-btn fab outline small color="primary">
                        <v-icon>edit</v-icon>
                    </v-btn>

                    <v-btn fab outline small color="red">
                        <v-icon>delete</v-icon>
                    </v-btn>
                </td>
            </template>
        </v-data-table>

        <v-alert v-else :value="true" type="info">
            No data found
        </v-alert>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import Create from './Create';
    import JobAdvert from '@hr/libs/job-adverts/JobAdvert';

    export default {
        components: {
            Create
        },

        data() {
            return {
                headers: null,
                list: null,
                dialog: false,
                jobAdvert: new JobAdvert,
            }
        },

        computed: {
            ...mapGetters([
                "getJobAdverts"
            ]),

            adverts() {
                return this.getJobAdverts
            }
        },

        watch: {
            adverts(value) {
                if(value) {
                    this.list = value.data;
                    this.headers = value.headers;
                }
            }
        },


        methods: {
            ...mapActions([
                "setJobAdverts"
            ]),
        },

        mounted() {
            this.setJobAdverts();
        }
    }
</script>

<style scoped lang="scss">

</style>
