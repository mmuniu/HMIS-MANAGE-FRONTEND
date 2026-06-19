<template>
    <v-card>

        <div class="ma-4">

            <refraction-base></refraction-base>

            <hr/>

            <refraction-form></refraction-form>
        </div>
    </v-card>
</template>
<script>
import RefractionBase from "@evaluation/components/evaluation/actions/partials/RefractionBase";
import RefractionForm from "@evaluation/components/evaluation/actions/partials/RefractionForm"

export default {
    components: {
        RefractionBase,
        RefractionForm
    }
}
</script>
