<template>
    <div>
        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <v-card v-else>
            <v-card-title class="subheading grey-text text-darken-2">
                <h2 class="body-2 ma-0 pa-0">List of all patients</h2>
            </v-card-title>

            <v-divider class="my-0"></v-divider>

            <v-card-text>
               <v-row>
                   <v-col offset-md="8" md="4" cols="12">
                       <v-text-field prepend-inner-icon="search"
                                     :label="label"
                                     v-model="search"
                                     hide-details
                       >
                       </v-text-field>
                   </v-col>
               </v-row>

                <v-data-table
                        :headers="patients.headers"
                        :items="patients.data"
                        :loading="loading"
                        disable-pagination
                        class="mb-3"
                        flat
                        hide-default-footer
                >
                    <template v-slot:item.name="{ item }"  class="py-3 blue--text text--lighten-2 patient-name">
                        <a :href="`/reception/patients/${item.id}/basic`">
                            {{ item.full_name }}
                        </a>

                        <br/>
                        <span class="ml-5 grey--text font-italic" v-if="item.schemes && item.schemes.length > 0">
                            Has {{ item.schemes.length }} {{ 'insurance' | pluralize(item.schemes.length) }}
                        </span>
                    </template>

                    <template v-slot:item.patient_actions="{ item }">
                        <a :href="getRoute(item)">
                            <v-btn small color="purple" dark >
                                <v-icon>print</v-icon> view files
                            </v-btn>
                        </a>
                    </template>

                    <template slot="footer" v-if="patients.links">
                        <v-row  class="py-2 pb-2">
                            <v-col cols="8" class="mt-3 ml-3">
                                Total patient records: {{ patients.meta.total }}
                            </v-col>

                            <v-col cols="3" class="text-right">

                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </v-card-text>

        </v-card>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    data: () => ({
        search: '',
        label: 'Search Patients...',
        loading: true,
    }),

    computed: {
        ...mapGetters({
            patients: 'getPatients',
        }),

        initialised() {
            return this.patients;
        },
    },

    watch: {
        search(term, old) {
            if (term.length > 3) {
                this.performSearch(term);
                this.label = 'Search Patients...';
            } else if (term.length > 0 && term.length <= 3) {
                this.label = 'Enter ' + (4 - term.length) + ' more characters';
            } else {
                this.label = 'Search Patients...';
            }

            if (term.length == 0) {
                this.setPatients({ page: 1 });
            }
        },
    },

    methods: {
        ...mapActions([
            'setPatients',
        ]),

        getRoute(patient) {
            return `/reception/patients/upload/docs/${patient.id}`;
        },

        performSearch: _.debounce(function(term) {
            this.loading = true;
            this.setPatients({
                search: term,
            });
        }, 1000),
    },

    mounted() {
        this.setPatients({
            page: 1,
        });
    },
};
</script>
