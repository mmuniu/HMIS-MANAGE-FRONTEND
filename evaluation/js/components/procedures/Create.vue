<template>
    <div>
        <procedure-form
                :procedureId="null"
                :facilities="facilities">
        </procedure-form>
    </div>
</template>

<script>
import ProcedureForm from './partials/ProcedureForm';
export default {
    name: 'evaluation-procedures-create',

    props: [
        'facilities',
    ],

    components: {
        'procedure-form': ProcedureForm,
    },
};
</script>
