<template>
    <div>
        <v-card flat>
            <v-card-text>
               <div>
                   <v-row>
                       <v-col cols="4" >
                           <v-text-field v-model="fridge.name" label="Label"></v-text-field>
                       </v-col>
                   </v-row>
                   <v-row>
                       <v-col cols="4">
                           <v-text-field v-model="fridge.cabinet_name"
                                         label="Cabinets"
                                         @keyup.enter="fridge.saveCabinet()"
                                         hint="Type the cabinet and press enter"></v-text-field>
                       </v-col>
                       <v-col cols="6">
                           <v-chip close
                                   small
                                   :key="cabinet"
                                   v-for="cabinet in fridge.cabinets"
                                   @click:close="fridge.removeCabinet(cabinet)">
                               {{ cabinet }}
                           </v-chip>
                       </v-col>
                   </v-row>
                   <div>
                       <v-col cols="4">
                           <v-btn small color="success" @click="save()">save</v-btn>
                       </v-col>
                   </div>
               </div>

                <v-divider/>

                <v-row v-if="getFridgesCabinets">
                    <v-data-table :headers="headers"
                                  :items="getFridgesCabinets">
                        <template v-slot:item.actions="{ item }">
                            <v-btn small color="primary" @click="fridge.edit(item)">edit</v-btn>
                        </template>
                    </v-data-table>
                </v-row>

            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Fridges from "@morgue/libs/Fridges/Fridges";

export default {
    data () {
        return {
            fridge: new Fridges(),
            headers: [
                { text: 'Fridge name', value: 'name'},
                { text: 'Cabinets', value: 'cabinets'},
                { text: 'Actions', value: 'actions'},
            ]
        }
    },

    computed: {
        ...mapGetters([
            'getFridgesCabinets'
        ])
    },

    methods: {
        ...mapActions([
            'setFridgesCabinets'
        ]),

        async save () {
            const response = await this.fridge.save();

            if(response) {
                this.setFridgesCabinets();
            }
        }
    },


    mounted ()  {
        this.setFridgesCabinets();
    }
}
</script>
