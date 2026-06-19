<template>
    <v-card flat>
        <v-card-title>
            <span class="blue--text">
                The levels will be ranked based on the specified weight (more weight more power)
            </span>
        </v-card-title>
        <v-card-text>
            <v-row  class="mx-2">
                <v-col class="mr-2" md="1" >
                    <v-text-field type="number" label="weight"
                                  outline
                                  v-model="approvalLevel.weight"
                    ></v-text-field>
                </v-col>
                <v-col md="3">
                    <users-search @results="setUsers"></users-search>
                </v-col>
                <v-col class="mx-3" md="6" v-if="approvalLevel.users.length > 0">
                    <v-chip v-for="user in approvalLevel.users" color="blue" outline @input="removeUser(user)" close :key="user.id">{{ user.full_name }} </v-chip>
                </v-col>
                <v-col>
                    <v-btn color="primary" @click="addLevel()">Add level</v-btn>
                </v-col>
            </v-row>

            <v-data-table :headers="headers" :items="levels" class="mb-3" flat hide-default-footer>
                <template v-slot:item.users="{ item }">
                    <v-chip v-for="user in item.users" color="blue"  @input="removeUser(user)" close :key="user.id">{{ user.full_name }} </v-chip>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn icon color="red"  @click="removeLevel(item.id)"> x </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import ApprovalLevels from "@inventory/libs/approval_levels/ApprovalLevels";

export default {
    data: () => ({
        approvalLevel: new ApprovalLevels(),
        headers: [
            { text: "weight", value: "weight" },
            { text: "users", value: "users" },
            { text: "Actions", value: "actions" },
        ],
    }),

    computed: {
        ...mapGetters({
            levels: "getApprovalLevels",
        }),
    },

    methods: {
        ...mapActions([
            "setApprovalLevels",
        ]),

        setUsers(user) {
            if (_.findIndex(this.approvalLevel.users, user)) {
                this.approvalLevel.users.push(user);
            } else {
                flash({
                    message: "User already in list",
                    alert: "error",
                });
            }
        },

        addLevel() {
            this.approvalLevel.saveLevel();
            this.setApprovalLevels();
        },

        removeLevel(level_id) {
            this.approvalLevel.removeLevel(level_id);
            this.setApprovalLevels();
        },

        removeUser(user) {
            this.approvalLevel.users.splice(_.indexOf(this.users, user), 1);
        },
    },

    mounted() {
        this.setApprovalLevels();
    },
};
</script>
