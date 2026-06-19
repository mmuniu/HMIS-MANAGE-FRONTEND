<template>
    <v-dialog
        v-model="dialog"
        width="900px"
        persistent
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
                small
            >
                Assign
            </v-btn>
        </template>
        <v-card>
            <v-card-title class="primary">
                <span class="text-h5 text-white">Assign procedure</span>
                <v-spacer/>
                <v-btn icon color="white" @click="closeDialog()">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text>

                <collabmed-loading v-if="!found"></collabmed-loading>

                <div v-else>
                    <v-row>
                        <v-col>
                            <v-select
                                v-model="assign.procedures"
                                :items="found.data"
                                :menu-props="{ maxHeight: '400' }"
                                label="Select procedure"
                                item-text="procedure_name"
                                :item-disabled="checkIsItemDisabled"
                                item-value="id"
                                multiple
                                persistent-hint
                            ></v-select>
                        </v-col>
                        <v-col>
                            <!--  :roles-like="['doc']"-->
                            <users-search
                                leave-selected
                                :label="'Select technician'"
                                v-model="assign.user_id"
                            ></users-search>
                        </v-col>
                    </v-row>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary darken-1"
                       @click="save()">
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import {mapActions, mapGetters} from "vuex";
import Investigations from "@evaluation/libs/investigations/Investigation";

export default {
    props: [
        'visitId', 'destination'
    ],

    data () {
        return {
            dialog: false,
            found: null,
            assign: {
                id: null,
                procedures: [],
                user_id: null
            },
            investigationObj: new Investigations()
        }
    },

    computed: {
        ...mapGetters({
            investigations: 'getInvestigations',
        }),
    },

    watch: {
        investigations (val) {
            this.found = val;
        },

        dialog(val) {
            if(val === true) {
                this.initialize();
            }
        }
    },

    methods: {
        ...mapActions([
            'setInvestigations',
        ]),

        closeDialog () {
            this.dialog = false;
            this.found = null;
        },

        checkIsItemDisabled(item) {
            return item.assigned_to !== null && item.assigned_to !== 0;
        },

        initialize() {
            this.setInvestigations({
                params: {
                    visit_id: this.visitId,
                    type: this.destination,
                    action: 'withoutResults',
                },
            });
        },

        async save() {
            let response = await this.investigationObj.assignProcedures(this.visitId, this.assign);

            if(response.alert === 'success') {
                this.found = null;
                this.dialog = false;
            }
        }
    },
}
</script>
