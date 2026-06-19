<template>
    <v-card flat>
        <v-card-title class="subheading grey-text text-darken-2">
            <h2 class="body-2 ma-0 pa-0">
                Create a new appointment
            </h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <div class="body-2 ma-0 pa-0 mb-4" style="font-style: italic" v-if="msetting('reception.appointments_per_hour')">
                <span class="px-2">
                    Please note that you can only have a total of
                    {{ msetting('reception.appointments_per_hour') }}
                    appointments per every hour
                </span> <br/>
            </div>

            <create-appointment-form></create-appointment-form>
        </v-card-text>
    </v-card>
</template>
<script>
import CreateAppointmentForm from './partials/CreateAppointmentForm';

export default {
    components: {
        CreateAppointmentForm,
    },
};
</script>
