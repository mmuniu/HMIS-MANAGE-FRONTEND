<template>
    <v-dialog v-model="dialog" persistent max-width="800">
        <template v-slot:activator="{ on }">
            <v-btn color="primary" small dark v-on="on">{{ label ? label : 'Initiate contact tracing' }}</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline grey darken-3 white--text">
                Initiate new contact tracing
                <v-spacer></v-spacer>
                <v-btn small color="white"
                       @click="dialog = false"
                       text
                       rounded
                       fab style="font-weight: bold">
                    <span class="red--text">x</span>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <v-container fluid>
                    <v-row>
                       <!-- <v-col  cols="6" class="px-3">
                            <v-text-field label="Contact name" placeholder="person or place" v-model="contactTracing.contact"></v-text-field>
                        </v-col>-->

                        <v-col  cols="12" class="px-3 text-center">
                            <div v-if="name" class="font-weight-bold" style="font-size: 14px; padding-top: 5px;">{{ name}}</div>
                            <patient-search v-else leave-selected label="System patient name (optional)" @patientSelected="patientSelected"></patient-search>
                        </v-col>

                        <!--<v-col  cols="6" class="px-3">
                            <v-text-field label="Contact mobile" v-model="contactTracing.mobile"></v-text-field>
                        </v-col>

                        <v-col  cols="6" class="px-3">
                            <v-text-field label="secondary mobile" v-model="contactTracing.telephone"></v-text-field>
                        </v-col>

                        <v-col  cols="6" class="px-3">
                            <v-text-field label="Contact email" v-model="contactTracing.email"></v-text-field>
                        </v-col>

                        <v-col  cols="6" class="px-3">
                            <v-text-field label="Secondary email" v-model="contactTracing.secondary_email"></v-text-field>
                        </v-col>

                        <v-col  cols="6" class="px-3">
                            <v-text-field label="Contact address" v-model="contactTracing.address"></v-text-field>
                        </v-col>-->

                        <!--<v-col  cols="6" class="px-3">
                            <v-text-field label="Contact location" v-model="contactTracing.location_name"></v-text-field>
                        </v-col>-->
                    </v-row>
                    <v-row>
                        <v-col  cols="6" class="px-3">
                            <users-search label="Assign trackees" @results="userSelected"></users-search>
                        </v-col>

                        <v-col  cols="6" class="px-3">
                            <v-textarea label="Comments"
                                        placeholder="any further info to aid in the search for the given contacts"
                                        v-model="contactTracing.comments">
                            </v-textarea>
                        </v-col>

                        <v-col  cols="12" class="px-3">
                            <v-chip close class="ma-2"
                                    v-for="(user, index) in contactTracing.trackees"
                                    @input="removeUser(user)"
                                    :key="index">
                                {{ user.name }}
                            </v-chip>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn small class="mr-2" color="primary darken-1" @click="saveContact(0)">submit</v-btn>
                <v-btn small class="mr-2" color="success" @click="saveContact(1)">Intiate & Save contacts</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import ContactTracing from '@reception/libs/contact-tracing/ContactTracing';
import PatientSearch from '@reception/components/patients/PatientSearch';

export default {
    components: { PatientSearch },

    props: [
        'name', 'id', 'label',
    ],

    data: () => ({
        contactTracing: new ContactTracing(),
        dialog: false,
    }),

    methods: {
        patientSelected(patient) {
            this.contactTracing.patient_id = patient.id;
        },

        userSelected(user) {
            const data = {
                id: user.id,
                name: user.full_name,
            };

            if (this.contactTracing.trackees.indexOf(data) != null) {
                this.contactTracing.trackees.push(data);
            } else {
                flash({
                    message: 'Already in list',
                    alert: 'warning',
                });
            }
        },

        removeUser(user) {
            this.contactTracing.trackees.splice(this.contactTracing.trackees.indexOf(user), 1);
        },

        async saveContact(saveContacts) {
            if (this.id) {
                this.contactTracing.patient_id = this.id;
            }

            const response = await this.contactTracing.save();

            if (response) {
                if (response.alert === 'success') {
                    this.dialog = false;
                }

                flash(response);

                this.$emit('traced');

                if(saveContacts) {
                    window.open(`/reception/contact-tracing/${response.contact_id}/manage`, '_self');
                }
            }
        },
    },
};
</script>
