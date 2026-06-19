<template>
    <div>
        <machine-creation-form :machineData="machine"></machine-creation-form>

        <created-machines></created-machines>
    </div>
</template>
<script>
import MachineCreationForm from './partials/MachineForm';
import CreatedMachines from './Index';

export default {
    props: [
        'machine',
    ],

    components: {
        MachineCreationForm, CreatedMachines,
    },
};
</script>
