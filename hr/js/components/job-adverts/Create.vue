<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 01/11/2018
* Time: 19:05
* Project: platform
-->

<template>
    <div>
        <v-layout row justify-center>
            <v-dialog v-model="display" persistent max-width="70%">

                <form v-on:submit.prevent="submit">
                    <v-card>
                        <v-card-title class="info">
                            <span class="headline white--text">Create a Job Advertisement</span>
                        </v-card-title>

                        <v-card-text>
                            <v-container grid-list-md>
                                <v-layout row wrap>

                                    <v-flex xs12>
                                        <v-text-field
                                                label="Title"
                                                v-model="jobAdvert.title"

                                                persistent-hint
                                                :error="errors.has('title')"
                                                :hint="errors.get('title')"
                                                @keyup="errors.clear('title')"
                                        ></v-text-field>
                                    </v-flex>

                                    <v-flex xs6>
                                        <v-text-field
                                                label="Slug"
                                                v-model="jobAdvert.slug"
                                                disabled

                                                persistent-hint
                                                :error="errors.has('slug')"
                                                :hint="errors.get('slug')"
                                                @keyup="errors.clear('slug')"
                                        ></v-text-field>
                                    </v-flex>

                                    <v-flex xs6>
                                        <v-text-field
                                                label="Position"
                                                v-model="jobAdvert.position"
                                                persistent-hint
                                                :error="errors.has('position')"
                                                :hint="errors.get('position')"
                                                @keyup="errors.clear('position')"
                                        ></v-text-field>
                                    </v-flex>

                                    <v-flex xs6>
                                        <v-select
                                                :items="departments"
                                                item-text="name"
                                                item-value="id"
                                                label="Department"
                                                v-model="jobAdvert.department_id"
                                                persistent-hint
                                                :error="errors.has('department_id')"
                                                :hint="errors.get('department_id')"
                                                @change="errors.clear('department_id')"

                                        ></v-select>
                                    </v-flex>

                                    <v-flex xs6>
                                        <v-menu
                                                :close-on-content-click="false"
                                                v-model="menu2"
                                                :nudge-right="40"
                                                lazy
                                                transition="scale-transition"
                                                offset-y
                                                full-width
                                                min-width="290px"
                                        >
                                            <v-text-field
                                                    slot="activator"
                                                    v-model="jobAdvert.expiry_date"
                                                    label="Expiry date"
                                                    prepend-icon="event"
                                                    readonly
                                                    persistent-hint
                                                    :error="errors.has('expiry_date')"
                                                    :hint="errors.get('expiry_date')"
                                                    @focus="errors.clear('expiry_date')"
                                            ></v-text-field>
                                            <v-date-picker v-model="jobAdvert.expiry_date" @input="menu2 = false"></v-date-picker>
                                        </v-menu>
                                    </v-flex>

                                    <v-flex xs12>
                                        <v-textarea v-model="jobAdvert.description">
                                            <div slot="label">
                                                Description <small>(optional)</small>
                                            </div>
                                        </v-textarea>
                                    </v-flex>

                                    <v-flex xs12>
                                        <v-textarea v-model="jobAdvert.remunerations">
                                            <div slot="label">
                                                Remunerations <small>(optional)</small>
                                            </div>
                                        </v-textarea>
                                    </v-flex>

                                </v-layout>
                            </v-container>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn class="primary" flat type="submit" :loading="loading" :disabled="loading">Submit</v-btn>
                            <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
                        </v-card-actions>
                    </v-card>
                </form>
            </v-dialog>
        </v-layout>
    </div>
</template>

<script>

    import JobAdvert from '@hr/libs/job-adverts/JobAdvert';
    import { mapActions, mapGetters } from "vuex";

    export default {
        props: [
            'dialog'
        ],

        data() {
            return {
                jobAdvert: new JobAdvert,
                date: new Date().toISOString().substr(0, 10),
                menu2: false,
                loading: false
            }
        },

        computed: {
              display() {
                  return this.dialog
              },

            ...mapGetters([
                "getDepartments"
            ]),

            departments() {
                  return this.getDepartments.data
            },

            contaminated() {
                  return this.jobAdvert.form.errorDetected;
            },

            errors() {
                  return this.jobAdvert.form.errors;
            },

            submitted() {
                return this.jobAdvert.submitted;
            },

            title() {
                  return this.jobAdvert.title;
            }

        },

        watch: {
            contaminated(value) {
                if(value) {
                    this.loading = false;
                    this.jobAdvert.form.errorDetected = false;
                }
            },

            submitted(value) {
                if(value) {
                    this.loading = false;
                }
            },

            title(value) {
                return this.jobAdvert.slug = value.toLowerCase().replace(' ', '-');
            }
        },

        methods: {
            ...mapActions([
                "setDepartments"
            ]),

            close() {
                this.$emit('close')
            },

            submit() {
                this.loading = true;
                this.jobAdvert.submit();
            }
        },

        mounted() {
            this.setDepartments();
        }
    }
</script>

<style scoped lang="scss">

</style>