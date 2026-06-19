<template>
    <v-row  v-if="content">
        <v-col cols="12">
            <v-text-field label="Pre dialysis weight" outline
                          v-model="evaluator.notes.pre_dialysis_weight"></v-text-field>
        </v-col>

        <v-col cols="12">
            <v-text-field label="Target weight" outline v-model="evaluator.notes.target_weight" :value="content.target_weight"></v-text-field>
        </v-col>

        <v-col cols="12">
            <v-text-field label="Post dialysis weight" outline  v-model="isHowheavy"></v-text-field>
        </v-col>

        <v-col cols="12">
            <v-text-field label="Fluid lost" outline   v-model="lostFluid"></v-text-field>
        </v-col>

        <v-col cols="12">
            <v-textarea label="Post dialysis notes" outline v-model="evaluator.notes.remarks" rows="2"></v-textarea>
        </v-col>

      
        <v-col cols="12" md="10">
            <users-search  outlined
                @results="userSelected"
                :roles-like="getCheckinToRoles"
                label="Select nurse">
            </users-search>
         </v-col>
         <v-row v-if="selected_staff">
            <v-col class="hidden-sm-and-down" md="10">
                <label class="mid-center font-weight-regular subheading mt-2">
                    Selected staff  
                </label>
            </v-col>

            <v-col cols="12" md="8">
                <v-chip v-model="evaluator.notes.user" class="mx-1" 
                close @click:close="selected_staff = null">
                    {{selected_staff.name}}
                </v-chip>
            </v-col>
        </v-row>


        <v-col cols="12">
            <collabmed-date-time-picker
           v-model="evaluator.notes.completed_at"
                timeOnly
                :datetime="timeOnly"
                label="Dialysis end time">
            </collabmed-date-time-picker>
        </v-col>

        <!--<v-flex xs3>-->
            <!--<label class="mid-center font-weight-regular subheading mt-2">Notes</label>-->
        <!--</v-flex>-->
        <!--<v-flex xs9>-->
            <!--<v-textarea label="Post dialysis notes" outline v-model="evaluator.notes.details"></v-textarea>-->
        <!--</v-flex>-->

        <v-col cols="12">
            <v-btn large block type="submit" class="blue lighten-1" color="blue"
                   :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader" @click="saveNotes()">
                Save details & finalise
            </v-btn>
        </v-col>
    </v-row>
</template>

<script>
import Evaluator from "@dialysis/libs/evaluation/Evaluator";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            evaluator: new Evaluator(),
            end: false,
            saveLoader: false,
            visitId: null,
            isHowheavy: 0,
            selected_staff: null,
            date: new Date().toISOString().substr(0, 10),
        };
    },

    computed: {
        ...mapGetters([
            "getUsers",
        ]),

        content() {
            return this.evaluator.content;
        },

        lostFluid() {
            return this.content.pre_dialysis_weight - this.isHowheavy;
        },

    },

    methods: {
        ...mapActions([
            "setUsers",
        ]),

        getCheckinToRoles() {
            if (this.msetting('reception.checkin_to_roles')) {
                const reg = RegExp('[a-z]+', 'gi');

                const data = this.msetting('reception.checkin_to_roles');

                return data.match(reg);
            } else {
                return [];
            }
        },
        
        saveNotes() {
            this.evaluator.save(this.visitId, "post-dialysis-notes");
        },
        userSelected(user) {

        this.evaluator.notes.user = user.id;
        const nurse = {
            name: user.full_name,
            id: user.id,
        };
        //based on the selectd nurse store them in a variable that we will later display in a v-chip
        this.selected_staff = nurse;


        },
    },

    mounted() {
        this.visitId = this.$route.params.visitId;

        this.evaluator.fetch(this.visitId, "post-dialysis-notes");

        this.setUsers();
    },
    
};
</script>
