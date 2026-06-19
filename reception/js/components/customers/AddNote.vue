<template>
        <v-card>
            <v-card-title primary-title class="blue white--text">
                <div>
                    <p class="headline">Add new note</p>
                </div>

                <v-spacer></v-spacer>

                <v-btn fab color="transparent" dark small @click="close()">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text>
                <v-radio-group row v-model="random_note.color">
                    <v-radio value="primary" color="primary" class="primary--text"></v-radio><span class="primary--text pr-4">blue</span>
                    <v-radio value="error" color="error" class="error--text"></v-radio><span class="error--text pr-4">red</span>
                    <v-radio value="success" color="success" class="success--text"></v-radio><span class="success--text pr-4">green</span>
                </v-radio-group>
                <v-textarea v-model="random_note.note"
                            label="Note"
                            placeholder="You can always view/edit/delete notes from the patients info"
                ></v-textarea>

                <v-btn @click="saveNote()" color="success" >save</v-btn>
            </v-card-text>
        </v-card>
</template>
<script>
import Patient from '@reception/libs/patients/Patient';

export default {
    props: [
        'patient-id',
    ],

    data: () => ({
        patient: new Patient(),
        random_note: {
            note: null,
            color: 'primary',
        },
    }),

    methods: {
        close() {
            this.$emit('closed');
        },

        async saveNote() {
            const response = await this.patient.saveRandomNote(this.patientId, this.random_note);

            if (response) {
                this.close();
                this.random_note.note = null;
                this.random_note.color='primary';
            }
        },
    },
};
</script>
