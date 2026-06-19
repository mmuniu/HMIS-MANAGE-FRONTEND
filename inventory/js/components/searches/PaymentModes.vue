<template>
    <v-autocomplete label="Select a payment mode"
                    :items="getPaymentModes"
                    item-text="name"
                    item-value="id" required
                    @change="modeSelected()"
                    v-model="selected"
                    :placeholder="placeholder"
                    return-object
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
            'getPaymentModes',
        ]),
    },

    methods: {
        ...mapActions([
            'setPaymentModes',
        ]),

        modeSelected() {
            this.$emit('results', this.selected);
        },
    },

    mounted() {
        this.setPaymentModes();
    },
};
</script>
