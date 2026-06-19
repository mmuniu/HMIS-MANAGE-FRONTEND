<template>
    <div>
        <v-btn color="blue" dark @click.stop="drawer = !drawer">
            View Activity on Requisition
        </v-btn>


        <v-navigation-drawer v-model="drawer" absolute temporary width="400" right class="mt-5">
            <v-list class="pa-1 mt-4">
                <h4 class="text-center font-weight-bolder">Activity logs on the requisition</h4>
            </v-list>

            <v-row  v-if="activities" class="mx-2">
                <v-col class="mx-3" cols="12" v-for="(item, index) in activities.data" :key="item.id">
                    <h4>{{ item.user.full_name }}</h4>
                    <span class="text--primary">{{ item.date }}</span>
                    <li class="caption" v-for="activity in item.activity" :key="activity.id">
                        {{ activity.message }}
                    </li>
                    <br/><span style="font-weight: bold">Comment: </span><br/>
                    <span>{{ item.comments }}</span>
                    <v-divider
                            v-if="index + 1 < activities.data.length"
                    ></v-divider>
                </v-col>
            </v-row>
        </v-navigation-drawer>
    </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

export default {
    props: [
        "requisition_id",
    ],

    data() {
        return {
            drawer: null,
            items: [
                { title: "Home", icon: "dashboard" },
                { title: "About", icon: "question_answer" },
            ],
        };
    },

    computed: {
        ...mapGetters({
            activities: "getActivityLogs",
        }),
    },

    methods: {
        ...mapActions([
            "setActivityLogs",
        ]),
    },

    mounted() {
        this.setActivityLogs({
            params: {
                requisition_id: this.requisition_id,
            },
        });
    },
};
</script>
