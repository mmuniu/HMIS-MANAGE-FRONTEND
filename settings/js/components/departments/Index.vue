<template>
    <v-card flat style="padding: 0; margin: 0">
        <form @submit.prevent="!departmentData ? saveDepartment() : updateDepartment()">
            <v-container fluid>
                <v-row >
                    <v-col class="pr-4" cols="12" md="3" >
                        <div class="mx-3">
                            <v-text-field label="Name" v-model="department.name" required outline></v-text-field>
                        </div>
                    </v-col>
                    <v-col class="pr-4" cols="12" md="3" >
                        <div class="mx-3">
                            <v-text-field label="Phone" v-model="department.phone" required outline></v-text-field>
                        </div>
                    </v-col>
                    <v-col class="pr-4" cols="12" md="3" >
                        <div class="mx-3">
                            <v-text-field label="Email" v-model="department.email" type="email"  required outline></v-text-field>
                        </div>
                    </v-col>
                    <v-col class="pr-4" cols="12" md="3" >
                        <div class="mx-3">
                            <v-text-field label="Credit limit" v-model="department.credit_limit"  type="number" required outline></v-text-field>
                        </div>
                    </v-col>
                </v-row>

                <v-row >
                    <v-col cols="12">
                        <v-btn v-if="!departmentData" type="submit" class="blue lighten-1" color="blue" large
                               :dark="!loader" :loading="loader" :disabled="loader">
                            Save
                        </v-btn>

                        <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                               :dark="!loader" :loading="loader" :disabled="loader">
                            update
                        </v-btn>
                    </v-col>
                </v-row>

                <v-divider></v-divider>

                <!-- listing of the created departments-->
                <collabmed-loading v-if="!departments.data"></collabmed-loading>
                <v-card flat v-else>
                    <v-card-title>
                        All created departments
                        <v-spacer></v-spacer>
                        <v-text-field
                                v-model="search"
                                append-icon="search"
                                label="Search"
                                single-line
                                hide-details
                        ></v-text-field>
                    </v-card-title>
                    <v-data-table
                            :headers="headers"
                            :items="departments.data"
                            :search="search"
                    >
                        <template v-slot:item.actions="{ item }">
                            <v-btn small color="primary" @click="editDepartment(item)">edit</v-btn>
                        </template>
                        <template v-slot:no-results>
                            <v-alert :value="true" color="error" icon="warning">
                                Your search for "{{ search }}" found no results.
                            </v-alert>
                        </template>
                    </v-data-table>
                </v-card>
            </v-container>
        </form>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import Department from "@settings/libs/departments/Departments";

export default {
    data: () => ({
        departmentData: null,
        loader: false,
        department: new Department(),
        search: "",
        headers: [
            { text: "Name", value: "name" },
            { text: "Phone", value: "phone" },
            { text: "Email", value: "email" },
            { text: "Credit Limit", value: "credit_limit" },
            { text: "Actions", value: "actions" },
        ],
    }),

    computed: {
        ...mapGetters({
            departments: "getDepartments",
        }),
    },

    methods: {
        ...mapActions([
            "setDepartments",
        ]),

        editDepartment(item) {
            this.departmentData = item;
            this.department.assemble(item);
        },

        saveDepartment() {
            const self = this;
            this.loader = true;

            this.department.save().then((response) => {
                self.setDepartments();
                self.loader = false;
            });
        },

        updateDepartment() {
            const self = this;
            this.loader = true;

            this.department.update().then((response) => {
                self.setDepartments();
                self.departmentData = null;
                self.loader = false;
            });
        },
    },

    mounted() {
        this.setDepartments();
    },
};
</script>
