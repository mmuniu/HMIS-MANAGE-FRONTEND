<template>
    <v-row >
        <!--<v-flex xs12 sm12 md7>-->
            <!--<v-card class="tallish mx-3">-->
                <!--<v-card-title class="subheading">-->
                    <!--Visit Details-->
                <!--</v-card-title>-->

                <!--<v-divider class="my-0"></v-divider>-->

                <!--<v-card-text>-->
                    <!--Put visit details here-->
                <!--</v-card-text>-->
            <!--</v-card>-->
        <!--</v-flex>-->

        <v-col cols="12" sm="12" md="5">
            <v-card class="tallish mx-3">
                <v-card-title class="subheading">
                    Record post dialysis notes and finalise session
                </v-card-title>

                <v-divider class="my-0"></v-divider>

                <v-card-text>
                    <dialysis-notes-form></dialysis-notes-form>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>

import NotesForm from "./NotesForm.vue";
export default {
    components: {
        "dialysis-notes-form": NotesForm,
    },
};
</script>
