<template>
    <v-card flat>
        <transition name="slide">
            <div v-if="supplier">
                <v-toolbar flat height="100" color="white">
                    <v-avatar size="60px">
                        <img v-if="supplier.image" :src="supplier.image" alt="Avatar">
                        <img v-else src="/img/placeholder.png" alt="Avatar">
                    </v-avatar>

                    <p class="ml-3">
                    <span class="font-weight-bold pl-2 subheading grey--text text--darken-1">
                        {{ supplier.name }} | {{ supplier.email }}
                    </span>
                        <br>
                        <v-chip color="info" text-color="white" small v-if="supplier.mobile">
                            {{ supplier.mobile }}
                        </v-chip>
                        <v-chip class="purple darken-3" text-color="white" small v-if="supplier.mobile">
                            {{ supplier.town }} | {{ supplier.box }}
                        </v-chip>
                    </p>

                    <v-spacer></v-spacer>

                </v-toolbar>

            </div>
        </transition>
    </v-card>
</template>
<script>
export default {
    props: {
        supplier: {
            default: null,
        },
    },
};
</script>
