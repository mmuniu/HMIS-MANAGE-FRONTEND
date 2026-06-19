<template>
    <div>
        <div v-if="getPrescribeEyewear.length > 0">
            <div>
                <v-list subheader two-line>
                    <v-subheader inset>List of made eye-wear prescription</v-subheader>

                    <v-list-item
                        v-for="(eyewear, index) in getPrescribeEyewear" :key="index"
                    >
                        <v-list-item-avatar>
                            <v-avatar
                                color="primary"
                                size="30"
                            >
                                        <span class="white--text headline">
                                            {{ index + 1 }}
                                        </span>
                            </v-avatar>
                        </v-list-item-avatar>

                        <v-list-item-content>
                            <v-list-item-subtitle>
                                        <span>
                                            <span class="p-4" style="font-style: italic">Right:</span>
                                            <span class="font-weight-bold">Lens type: </span> <span class="pr-10">{{ eyewear.right.lens_type }}</span>
                                            <span class="font-weight-bold">Type of bifocal: </span> <span class="pr-10">{{ eyewear.right.bifocal_type }}</span>
                                            <span class="font-weight-bold">Segment height: </span> <span class="pr-10">{{ eyewear.right.segment_height }}</span>
                                            <span class="font-weight-bold">Pupillary distance: </span> <span class="pr-10">{{ eyewear.right.pupillary_distance }}</span>
                                            <span class="font-weight-bold">Tint: </span> <span class="pr-10">{{ eyewear.right.tint }}</span>
                                        </span>
                            </v-list-item-subtitle>
                            <v-list-item-subtitle>
                                        <span>
                                            <span class="p-4" style="font-style: italic">Left:</span>
                                            <span class="font-weight-bold">Lens type: </span> <span class="pr-10">{{ eyewear.left.lens_type }}</span>
                                            <span class="font-weight-bold">Type of bifocal: </span> <span class="pr-10"> {{ eyewear.left.bifocal_type }}</span>
                                            <span class="font-weight-bold">Segment height: </span> <span class="pr-10">{{ eyewear.left.segment_height }}</span>
                                            <span class="font-weight-bold">Pupillary distance: </span> <span class="pr-10">{{ eyewear.left.pupillary_distance }}</span>
                                            <span class="font-weight-bold">Tint: </span> <span class="pr-10">{{ eyewear.right.tint }}</span>
                                        </span>
                            </v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                            <v-btn icon>
                                <v-icon color="grey lighten-1">mdi-information</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: [
        'getPrescribeEyewear'
    ]
}
</script>
