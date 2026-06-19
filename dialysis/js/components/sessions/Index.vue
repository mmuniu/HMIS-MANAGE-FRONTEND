<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div v-else>
        <v-card>
            <v-card-title class="text-bold grey--text text--darken-1">
                Dialysis sessions
            </v-card-title>

            <v-divider class="my-0"></v-divider>

            <v-card-text>
                <v-data-table
                        :headers="sessions.headers"
                        :items="sessions.data"
                        class="mb-3"
                        flat
                        hide-default-footer
                >
                    <template v-slot:body="{ items }" >

                        <tr v-for="item in items"  :key="item.id">
                            <td class="py-3">{{ item.visit.patient.full_name }}</td>
                            <td>{{ item.schedule.location }}</td>
                            <td>{{ item.schedule.start }}</td>
                            <td>{{ item.schedule.end }}</td>
                            <td>
                                <v-btn small color="blue" dark
                                    :href="route('dialysis.evaluate', [item.visit.id, 'monitoring'])">
                                    Manage
                                </v-btn>

                                <v-btn small color="pink" dark>
                                    Check Out
                                </v-btn>
                            </td>
                         </tr>
                    </template>

                    <template slot="footer" v-if="links">
                        <td colspan="100%">
                            <v-row  class="py-2 pb-2">
                                <v-col cols="8" class="mt-3">
                                    Total patient records: {{ pagination.total }}
                                </v-col>

                                <v-col cols="3" class="text-right">
                                    <v-btn icon @click="navigate(links.prev)">
                                        <v-icon>chevron_left</v-icon>
                                    </v-btn>
                                    <v-btn icon @click="navigate(links.next)">
                                        <v-icon>chevron_right</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </td>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            search: "",
        };
    },

    watch: {
        search(search) {
            if (search.length > 3) {
                this.setDialysisPatients({ search });
            }

            if (search.length == 0) {
                this.setDialysisPatients({ page: 1 });
            }
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisSessions",
        ]),

        sessions() {
            return this.getDialysisSessions;
        },

        initialised() {
            return this.sessions && this.sessions.data;
        },

        links() {
            return this.sessions.links;
        },

        pagination() {
            return this.sessions.meta;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisSessions",
        ]),

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];
                this.setDialysisSessions({ page });
            }
        },
    },

    mounted() {
        this.setDialysisSessions({
            page: 1,
        });
    },
};
</script>