<template>
    <div>
        <span class="notification dropbtn">
            <svg  @click="showDropdown" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class="dropbtn">
                <g  @click="showDropdown">
                    <path  @click="showDropdown" xmlns="http://www.w3.org/2000/svg" d="m413.417969 360.8125c-32.253907-27.265625-50.75-67.117188-50.75-109.335938v-59.476562c0-75.070312-55.765625-137.214844-128-147.625v-23.042969c0-11.796875-9.558594-21.332031-21.335938-21.332031-11.773437 0-21.332031 9.535156-21.332031 21.332031v23.042969c-72.257812 10.410156-128 72.554688-128 147.625v59.476562c0 42.21875-18.496094 82.070313-50.945312 109.503907-8.296876 7.105469-13.054688 17.429687-13.054688 28.351562 0 20.589844 16.746094 37.335938 37.332031 37.335938h352c20.589844 0 37.335938-16.746094 37.335938-37.335938 0-10.921875-4.757813-21.246093-13.25-28.519531zm0 0" fill="#ffffff" data-original="#000000" style="" class="dropbtn"/>
                    <path  @click="showDropdown"  xmlns="http://www.w3.org/2000/svg" d="m213.332031 512c38.636719 0 70.957031-27.542969 78.378907-64h-156.757813c7.425781 36.457031 39.746094 64 78.378906 64zm0 0" fill="#ffffff" data-original="#000000" style="" class="dropbtn"/>
                </g>
            </svg>
            <span   @click="showDropdown" class="badge dropbtn" id="notifications-counter">
                {{ notifications && notifications.length ? notifications.length : 0 }}
            </span>
        </span>

        <div id="notificationDropdwn" class="dropdown-content">
            <v-card class="pb-0 primary" width="350" height="300" style="margin-top: 15px" v-if="notifications && notifications.length > 0">
                <v-list two-line class="pb-0" style="background: white">
                    <template>

                        <div  id="user-notifications-list">

                            <div class="user-notification" v-for="notification in notifications">
                                <a @click="viewNotification(notification)">
                                    <div>
                                        <div style="font-size: 14px; font-weight: bold">
                                            {{ notification.title }}
                                        </div>

                                        <div>{{ notification.message }}</div>

                                        <div style="font-size: 11px; display: flex; font-style: italic; justify-content: space-between; width: 300px">
                                            <div>
                                                {{ notification.time_ago }}
                                            </div>
                                            <div style="padding-right: 20px">
                                                {{ notification.type }}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </template>

                    <v-btn block large dark style="padding-top: 15px"
                           :href="route('system.notifications.index')"
                           class="primary text-xs-center ma-0 black--text caption">
                        View all notifications
                    </v-btn>
                </v-list>

            </v-card>
        </div>

        <!-- dialogue-->
        <results-modal v-if="showResultDialog && notification && notificationPayload"
                       :visit-id="notificationPayload.visit_id"
                       :type="notificationPayload.type"
                       v-on:close="showResultDialog = false">
        </results-modal>
    </div>
</template>
<script>
import ResultsModal from "@evaluation/components/evaluation/actions/partials/procedures/ResultsModal";

export default {
    props: [
        'userNotifications'
    ],

    components: {
        ResultsModal,
    },

    data () {
        return {
            notifications: null,
            showResultDialog: false,
            notification: null,
            notificationPayload: null
        }
    },

    methods: {
        viewNotification(notification) {
            if(notification.type === 'Results posted') {
                this.notification = notification;
                this.notificationPayload = JSON.parse(notification.payload)
                this.showResultDialog = true;
            }
        },

        showDropdown() {
            const el = document.getElementById("notificationDropdwn");
            const counter = document.getElementById('notifications-counter');

            if (counter) {
                counter.classList.remove('badge-num');
            }
            if(el.classList.contains('show')) {
                el.classList.remove('show');
            } else {
                el.classList.add('show');
            }
        }
    },

    mounted () {
        if(this.userNotifications) {
            this.notifications = JSON.parse(this.userNotifications);
        }

        window.onclick = function(event) {
            if (!event.target.matches('.dropbtn')) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                var i;
                for (i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }
    }
}
</script>
<style scoped>

.notification {
    color: white;
    cursor: pointer;
    text-decoration: none;
    padding: 5px 8px;
    position: relative;
    display: inline-block;
    border-radius: 100%;
}

.notification .badge {
    position: absolute;
    top: -8px;
    right: -5px;
    padding: 6px;
    border-radius: 50%;
    background-color: #7d2222;
    color: white;
}


.dropdown-content {
    display: none;
    position: absolute;
    background-color: #f1f1f1;
    min-width: 160px;
    right: 100px;
    overflow: auto;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
}

.dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
}

.dropdown a:hover {background-color: #ddd;}

.show {display: block;}
</style>
