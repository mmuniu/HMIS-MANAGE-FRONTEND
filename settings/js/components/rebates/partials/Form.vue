/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-16
* Time: 00:22
*/

<template>
    <div v-if="facilities && facilities.length > 0">
        <v-autocomplete label="Select a facility"
                        :items="facilities"
                        item-text="name"
                        item-value="id"
                        v-model="obj.facility_id"
                        :error="errors.has('facility_id')" outline
                        :hint="errors.get('facility_id')" persistent-hint
                        @change="errors.clear('facility_id')"
        ></v-autocomplete>

        <v-autocomplete label="Select an Insurance Scheme"
                        :items="schemesFiltered"
                        item-text="name"
                        item-value="id"
                        v-model="obj.scheme_id"
                        :error="errors.has('scheme_id')" outline
                        :hint="errors.get('scheme_id')" persistent-hint
                        @change="errors.clear('scheme_id')"
        ></v-autocomplete>


        <v-text-field
                      label="Amount"
                      v-model="obj.amount"
                      class=""
                      min="0"
                      type="number"
                      :error="errors.has('amount')" outline
                      :hint="errors.get('amount')" persistent-hint
        >
        </v-text-field>

        <v-textarea
                      label="Notes"
                      v-model="obj.notes"
                      class=""
                      :error="errors.has('notes')" outline
                      :hint="errors.get('notes')" persistent-hint
        >
        </v-textarea>
    </div>
</template>

<script>

export default {
    props: {
        facilities: {
            required: true,
        },

        schemes: {
            required: true,
        },

        obj: {
            required: true,
            type: Object,
        },
    },

    data() {
        return {
            saveLoader: false,
        };
    },

    computed: {
        errors() {
            return this.obj.form.errors;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        schemesFiltered() {
            return _.map(this.schemes, (item) => {
                let name = item.full_name;
                if (item.company) {
                    name += " (" + item.company.name + ")";
                }

                return {
                    id: item.id,
                    name: name,
                };
            });
        },
    },
};
</script>

<style scoped lang="scss">

</style>
