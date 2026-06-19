<template>
    <div>
        <machine-creation-form></machine-creation-form>

        <created-machines></created-machines>
    </div>
</template>
<script>
import MachineCreationForm from './partials/MachineForm';
import CreatedMachines from './Index';

export default {
    components: {
        MachineCreationForm, CreatedMachines,
    },
};
</script>
