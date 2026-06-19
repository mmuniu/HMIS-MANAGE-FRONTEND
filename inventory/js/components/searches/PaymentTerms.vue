<template>
    <v-autocomplete label="Select a payment term"
                    :items="getPaymentTerms"
                    item-text="terms"
                    item-value="id" required
                    @change="termSelected()"
                    v-model="selected"
                    return-object
                    :placeholder="placeholder"
                    outline>
    </v-autocomplete>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        placeholder: {
            type: String,
            default: '',
        },
    },

    data: () => ({
        selected: null,
    }),

    computed: {
        ...mapGetters([
            'getPaymentTerms',
        ]),
    },

    methods: {
        ...mapActions([
            'setPaymentTerms',
        ]),

        termSelected() {
            this.$emit('results', this.selected);
        },
    },

    mounted() {
        this.setPaymentTerms();
    },
};
</script>
