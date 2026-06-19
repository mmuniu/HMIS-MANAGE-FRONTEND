<template>
    <collabmed-loading v-if="!content"></collabmed-loading>

    <v-card v-else class="pt-0">
        <v-card-title>
            <monitoring-dialog @saved="reset()" @cancelled="doReset()"
                               :connected="connected" :readings="machineReadings">
            </monitoring-dialog>
        </v-card-title>
        <v-card-text>
            <v-data-table :headers="content.headers" :items="content.observations"
                          class="mb-3" flat hide-default-footer>
                <template   v-slot:body="{ items }">
                    <tr v-for="item in items"  :key="item.id">
                        <td class="py-1">
                            <code>{{ item.time }}</code>
                        </td>
                        <td class="py-1">{{ item.blood_pressure }}</td>
                        <td class="py-1">{{ item.pulse }}</td>
                        <td class="py-1">{{ item.temperature }}</td>
                        <td class="py-1">{{ item.blood_flow_rate }}</td>
                        <td class="py-1">{{ item.transmembrane_pressure }}</td>
                        <td class="py-1">{{ item.ultrafiltration }}</td>
                        <td class="py-1">{{ item.venous_pressure }}</td>
                        <td class="py-1">{{ item.dr }}</td>
                        <td class="py-1">{{ item.dialysate_temperature }}</td>
                        <td class="py-1">{{ item.heparin }}</td>
                        <td class="py-1">{{ item.prot_sulp }}</td>
                        <td class="py-1">{{ item.fluids }}</td>
                        <td class="py-1">{{ item.coag_time }}</td>
                        <!--<td class="py-1"><p class="pr-3">{{ item.comments }}</p></td>-->
                    </tr>   
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import Evaluator from "@dialysis/libs/evaluation/Evaluator";
import io from "socket.io-client";
import MonitoringDialog from "./MonitoringDialog.vue";

export default {
    components: {
        "monitoring-dialog": MonitoringDialog
    },

    data: function() {
        return {
            evaluator: new Evaluator(),
            socket: io("http://127.0.0.1:3000"),
            connected: false,
            machineReadings: null,
        };
    },

    computed: {
        content() {
            return this.evaluator.content;
        },
    },

    methods: {
        reset() {
            this.connected = false;
            this.evaluator.fetch(this.$route.params.visitId, "monitoring");
        },

        doReset() {
            this.connected = false;
        },
    },

    mounted() {
        this.reset();

        // Listening forp socket connection from dialysis machine
        const channel = "integration-channel:Ignite\\Dialysis\\Events\\MachineReadingsReceived";

        this.socket.on(channel, (data) => {
            if (!this.connected) {
                this.connected = true;
                this.machineReadings = data.readings;
            }
        });
    },
};
</script>

<style lang="scss">
    aside.v-navigation-drawer--close {
        margin: -20px;
    }
</style>
