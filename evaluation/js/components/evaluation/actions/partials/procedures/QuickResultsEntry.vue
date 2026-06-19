<template>
    <v-row justify="center">
        <v-dialog
            v-model="dialog"
            persistent
            max-width="900"
        >
            <v-card>
                <v-card-title class="text-h5">
                    {{ investigation.procedure_name }}
                </v-card-title>
                <v-card-text>
                    <tinymce
                        api-key="ey11bm7sj7q4whqw7qptr2f8g5v5kgz667je1np4tevo4sl8"
                        :init="{
                                                             plugins: [
                                                               'advlist autolink lists link image charmap print preview anchor',
                                                               'searchreplace visualblocks code fullscreen',
                                                               'insertdatetime media table paste code help wordcount'
                                                             ],
                                                             toolbar:
                                                               'undo redo | formatselect | bold italic backcolor | \
                                                               alignleft aligncenter alignright alignjustify | \
                                                               bullist numlist outdent indent | removeformat | help'
                                                        }"
                        :ref="'tm' + investigation.id"
                        :id="investigation.id + 'editor'"
                        v-model="result"
                        @editorInit="editorInit(result, 'tm' + investigation.id)">
                    </tinymce>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="blue darken-1"
                        @click="saveResults()"
                    >
                        submit
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
import InvestigationResults from '@evaluation/libs/investigation_results/InvestigationResults';

export default {
    props: [
        'investigation',
        'showDialog'
    ],

    data () {
        return {
            dialog: false,
            result: null,
            investigationResultObj: new InvestigationResults()
        }
    },

    watch: {
        showDialog  (val) {
            if(val) {
                this.dialog = true;
            } else {
                this.dialog = false;
            }
        },

        investigation (val) {
            this.result = val.default_result;
        }
    },

    methods: {
        async saveResults () {
            let inv = this.investigation;
            inv.investigation_id = inv.id;
            inv.comments = null;
            inv.result = this.result;
            let response = await this.investigationResultObj.saveResult(inv);

            if(response) {
                this.dialog = false;
                window.location.reload();
            }
        }
    },

    mounted () {
       if(this.showDialog) {
           this.dialog = true;
       }

       if(this.investigation) {
           this.result = this.investigation.default_result;
       }
    }
}
</script>
