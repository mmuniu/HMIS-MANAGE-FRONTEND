<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 23/11/2018
* Time: 19:19
* Project: platform
-->

<template>
    <div>
        <v-card>
            <v-card-title>
                Procedure Categories

                <v-spacer></v-spacer>
                <v-btn small color="teal" dark class="pull-right" @click="launch">
                    <v-icon class="tiny pr-2" small>add_circle</v-icon> Add
                </v-btn>
            </v-card-title>

            <v-dialog v-model="dialog" max-width="50%">
                <v-card>
                    <v-card-title>
                        <span class="headline">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <v-row >

                                <v-col cols="12" sm="12" md="12">
                                    <v-text-field v-model="settingsObj.info.name" label="Name"></v-text-field>
                                </v-col>

                                <v-col cols="12" sm="12" md="12">
                                    <v-text-field v-model="settingsObj.info.applies_to" label="Applies To"></v-text-field>
                                </v-col>

                                <v-col cols="12" sm="12" md="12">
                                    <v-switch
                                            v-model="settingsObj.info.non_clinical"
                                            label="A non clinical category (All procedures within this category will appear under other services pos)"
                                    ></v-switch>
                                </v-col>

                            </v-row>
                        </v-container>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" @click="close">Cancel</v-btn>
                        <v-btn color="success" dark @click="save">Save</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>


            <v-data-table
                    :headers="headers" :items="list"
                    class="mb-3" flat
            >
                <template v-slot:item.non_clinical="{ item }">
                    <v-icon color="success" v-if="!item.non_clinical">check</v-icon>
                    <v-icon color="error" v-else>close</v-icon>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn small color="primary" @click="editItem(item)">
                        <v-icon class="tiny" small>edit</v-icon> Edit
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ProcedureCategory from '@evaluation/libs/procedures/ProcedureCategory';

export default {
    data() {
        return {
            headers: [
                { text: 'Id', value: 'id' },
                { text: 'Name', value: 'name' },
                { text: 'Applies to ID', value: 'applies_to' },
                { text: 'Clinical', value: 'non_clinical' },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
            dialog: false,
            method: '',
            settingsObj: new ProcedureCategory,
            editedIndex: -1,
        };
    },

    computed: {
        ...mapGetters([
            'getProcedureCategories',
        ]),

        categories() {
            return this.getProcedureCategories.categories;
        },

        list() {
            return this.categories;
        },

        formTitle() {
            return this.method === 'post' ? 'New Item' : 'Edit Item';
        },
    },

    methods: {
        ...mapActions([
            'setProcedureCategories',
        ]),

        launch() {
            this.method = 'post';
            this.dialog = true;
        },

        editItem(item) {
            this.editedIndex = this.list.indexOf(item);
            this.settingsObj.info = Object.assign({}, item);
            this.dialog = true;
            this.method = 'put';
        },

        close() {
            this.dialog = false;
        },

        save() {
            if (this.method === 'post') {
                this.settingsObj.store();
            } else {
                this.settingsObj.update();
            }

            this.close();

            this.setProcedureCategories();
        },
    },

    mounted() {
        this.setProcedureCategories();
    },
};
</script>

<style scoped lang="scss">

</style>
