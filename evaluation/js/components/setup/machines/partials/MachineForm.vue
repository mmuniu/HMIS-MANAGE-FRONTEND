<template>
    <v-card flat>
        <v-card-text>
            <form @submit.prevent="!machineData ? saveMachine() : updateMachine()">
                <v-row >
                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <v-text-field label="Display name" v-model="machine.display_name"
                                          outline></v-text-field>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <v-text-field label="Machine identifier" v-model="machine.machine_identifier"
                                          hint="Ensure this is the name supplied from the machine"
                                          outline></v-text-field>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <v-text-field label="Provider" v-model="machine.provider" outline></v-text-field>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <v-text-field label="Provider Mobile" v-model="machine.provider_mobile" outline></v-text-field>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <v-text-field label="Provider email" type="email" v-model="machine.provider_email" outline></v-text-field>
                        </div>
                    </v-col>
                </v-row>

                <v-row >
                    <v-col cols="12">
                        <div class="mx-3">
                            <v-btn v-if="!machineData" type="submit" class="primary lighten-1" color="blue" large>
                                Save
                            </v-btn>

                            <v-btn v-else type="submit" class="primary lighten-1" color="blue" large>
                                update
                            </v-btn>
                        </div>
                    </v-col>
                </v-row>
            </form>
        </v-card-text>
    </v-card>
</template>
<script>
import Machine from '@evaluation/libs/setup/machine/Machine.js';
import { mapActions } from 'vuex';

export default {
    props: {
        machineData: {
            default: null,
        },
    },

    data: () => ({
        machine: new Machine(),
    }),

    methods: {
        ...mapActions([
            'setMachines',
        ]),

        saveMachine() {
            this.machine.save().then((response) => {
                this.setMachines();
            });
        },

        updateMachine() {
            this.machine.update();
        },
    },

    mounted() {
        if (this.machineData) {
            this.machine.assemble(JSON.parse(this.machineData));
        }
    },
};
</script>
