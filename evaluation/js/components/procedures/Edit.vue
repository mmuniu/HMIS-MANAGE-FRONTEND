/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-09
* Time: 14:40
* Project: platform
*/

<template>
    <div>
        <procedure-form
                :procedureId="parseInt(procedureId)"
                :facilities="facilities">
        </procedure-form>
    </div>
</template>

<script>
import ProcedureForm from './partials/ProcedureForm';
export default {
    name: 'evaluation-procedures-edit',

    props: {
        procedureId: {
            required: true,
        },

        facilities: {
            required: true,
        },
    },

    components: {
        'procedure-form': ProcedureForm,
    },

    data() {
        return {
            //
        };
    },

    computed: {

    },

    watch: {
        //
    },

    methods: {

    },

    mounted() {
        console.log('hu', this.procedureId);
    },
};
</script>

<style scoped lang="scss">

</style>
