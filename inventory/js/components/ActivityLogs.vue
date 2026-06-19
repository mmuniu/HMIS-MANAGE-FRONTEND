<template>
    <div>
        <v-btn color="blue" dark @click.stop="drawer = !drawer">
            View Activities on {{ resourceType.replace('-', ' ').slice(0, -1) }}
        </v-btn>


        <v-navigation-drawer v-model="drawer" absolute temporary width="400" right class="mt-12">
            <v-list class="pa-1 mt-4">
                <h4 class="text-center font-weight-bolder">
                    Activity logs on {{ resourceType.replace('-', ' ').slice(0, -1) }}
                </h4>
            </v-list>

            <v-row  v-if="activities" class="mx-2">
                <v-col class="mx-3" cols="12" v-for="(item, index) in activities" :key="item.id">
                    <h4>{{ item.approved_by }}</h4>
                    <span class="text--primary">{{ item.date }}</span>
                    <li class="caption" v-for="activity in item.action_logs" :key="activity.id">
                        {{ activity.message }}
                    </li>
                    <br/><span style="font-weight: bold">Comment: </span><br/>
                    <span>{{ item.comment }}</span>
                    <v-divider
                            v-if="index + 1 < activities.length"
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
        "resourceType", "resourceId", "activities",
    ],

    data() {
        return {
            drawer: null,
        };
    },
};
</script>
