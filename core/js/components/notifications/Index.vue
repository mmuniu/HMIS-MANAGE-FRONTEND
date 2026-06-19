<template>
    <v-card width="600">
        <v-toolbar dark>
            <v-btn small color="primary" @click="markAllAsRead()">
                mark all as read
            </v-btn>
            <v-btn small color="error" class="mx-2" @click="deleteAll()">
                delete all
            </v-btn>
        </v-toolbar>

        <collabmed-loading v-if="!notifications.data"></collabmed-loading>

        <div v-else style="overflow-y: scroll; height: 700px;">
            <v-list two-line>
                <v-list-item-group>
                    <template v-for="(item, index) in notifications.data">
                        <v-list-item :key="item.id" :class="item.is_read ? '' : 'pink lighten-5'">
                            <template v-slot:default="{ active }">
                                <v-list-item-content>
                                    <v-list-item-title v-text="item.title"></v-list-item-title>

                                    <v-list-item-subtitle v-text="item.message"></v-list-item-subtitle>
                                    <v-list-item-subtitle>
                                        <div style="font-size: 11px; font-style: italic">
                                            <span style="color: green; font-weight: bolder">
                                                {{ item.time_ago }}
                                            </span>
                                            <span style="color: purple; font-weight: bolder"
                                                  class="ml-6">
                                                {{ item.type }}
                                            </span>
                                        </div>
                                    </v-list-item-subtitle>
                                </v-list-item-content>

                                <v-list-item-action>
                                    <div style="display: flex">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn small
                                                       color="primary"
                                                       v-bind="attrs"
                                                       @click="markAsRead(item.id)"
                                                       v-on="on"
                                                       icon>
                                                    <v-icon small>book</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Mark as read</span>
                                        </v-tooltip>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn small
                                                       color="error"
                                                       v-bind="attrs"
                                                       @click="deleteNotification(item.id)"
                                                       v-on="on"
                                                       icon>
                                                    <v-icon small>delete</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Delete notification</span>
                                        </v-tooltip>
                                    </div>
                                </v-list-item-action>
                            </template>
                        </v-list-item>
                    </template>
                </v-list-item-group>
            </v-list>
        </div>

        <div v-if="notifications.data">
            <collabmed-paginator v-if="notifications.meta" :meta="notifications.meta" @change="navigate" ></collabmed-paginator>
        </div>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Notifications from "@core/libs/notifications/Notifications";

export default {
    data () {
        return {
            page: 1,
            notification: new Notifications()
        }
    },

    computed: {
        ...mapGetters({
            notifications: 'getNotifications'
        })
    },

    methods: {
        ...mapActions([
            'setNotifications',
        ]),

        async markAllAsRead() {
            const response = await this.notification.markAllNotificationsAsRead();

            if(response) {
                window.location.reload();
                // this.init();
            }
        },

        async deleteAll() {
            const response = await this.notification.deleteAllNotifications();

            if(response) {
                window.location.reload();
                // this.init();
            }
        },

        async markAsRead(notification_id) {
            const response = await this.notification.markNotificationAsRead(notification_id);

            if(response) {
                this.init();
            }
        },

        async deleteNotification(notification_id) {
            const response = await this.notification.deleteNotification(notification_id)

            if(response) {
                this.init();
            }
        },


        navigate(page) {
            this.page = page;
            this.init();
        },

        init() {
            this.setNotifications({
                page: this.page
            });
        }
    },

    mounted () {
        this.init();
    }
}
</script>
