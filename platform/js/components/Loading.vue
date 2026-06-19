<!--
Loaders:
spinner
heart
alternating-balls
circle-red
dna
dna2
dna3
doctor
doctor-patient
girl
gymn
jumping-balls

// epic loaders https://epic-spinners.epicmax.co/#/
epic-semipolar
epic-flower
epic-fulfilling-bouncing-circle
epic-trinity-rings
epic-hollow-dots
epic-looping-rhombuses
epic-breeding-rhombus
epic-half-circle
epic-swapping-squares

CAUTION:
Some loaders are just meant to be ... large!
So avoid compromising page load-speed with a large fancy animation
-->
<template>
    <div class="text-center loading" :class="classes" :style="styling">
        <h3 class="title font-weight-thin" v-if="displayText">
            <slot>
                {{ text }}
            </slot>
        </h3>

        <v-progress-circular v-if="type === 'spinner'"
                             indeterminate color="blue" :size="size" :width="5"
        ></v-progress-circular>

        <img v-else-if="type === 'acelords'"
             src="/img/loaders/loading-acelords.png"
             alt="loading"
             class="loading-rotator-y-axis"
        >

        <div v-else-if="startsWith('epic')" class="epic-loader-container">
            <semipolar-spinner
                    v-if="type === 'epic-semipolar'"
                    :size="size"
                    :animation-duration="2000"
                    :color="color"
            />

            <flower-spinner
                    v-if="type === 'epic-flower'"
                    :animation-duration="2500"
                    :size="size"
                    :color="color"
            />

            <fulfilling-bouncing-circle-spinner
                    v-if="type === 'epic-fulfilling-bouncing-circle'"
                    :animation-duration="4000"
                    :size="size"
                    :color="color"
            />

            <trinity-rings-spinner
                    v-if="type === 'epic-trinity-rings'"
                    :animation-duration="1500"
                    :size="size"
                    :color="color"
            />

            <hollow-dots-spinner
                    v-if="type === 'epic-hollow-dots'"
                    :animation-duration="1000"
                    :dot-size="15"
                    :dots-num="3"
                    :color="color"
            />

            <looping-rhombuses-spinner
                    v-if="type === 'epic-looping-rhombuses'"
                    :animation-duration="2500"
                    :rhombus-size="15"
                    :color="color"
            />

            <breeding-rhombus-spinner
                    v-if="type === 'epic-breeding-rhombus'"
                    :animation-duration="2000"
                    :size="size"
                    :color="color"
            />

            <half-circle-spinner
                    v-if="type === 'epic-half-circle'"
                    :animation-duration="1000"
                    :size="size"
                    :color="color"
            />

            <swapping-squares-spinner
                    v-if="type === 'epic-swapping-squares'"
                    :animation-duration="1000"
                    :size="size"
                    :color="color"
            />
        </div>

        <span v-else>
            <v-progress-circular indeterminate color="blue" :size="60" :width="5"></v-progress-circular>
        </span>
    </div>
</template>

<script>
import {
    SemipolarSpinner, FlowerSpinner,
    FulfillingBouncingCircleSpinner,
    TrinityRingsSpinner, HollowDotsSpinner,
    LoopingRhombusesSpinner, BreedingRhombusSpinner,
    HalfCircleSpinner, SwappingSquaresSpinner,
} from 'epic-spinners';

export default {
    props: {
        type: {
            default: 'spinner',
            type: String,
        },

        text: {
            type: String,
            default: 'System is Loading ...',
        },

        displayText: {
            default: true,
            type: Boolean,
        },

        size: {
            type: Number,
            default: 60, // for epic-spinners
        },

        color: {
            type: String,
            default: '#1c6aff', // for epic spinners
        },

        classes: {
            type: String,
            default: '',
        },

        styling: {
            type: String,
            default: '',
        },
    },

    components: {
        SemipolarSpinner, FlowerSpinner,
        FulfillingBouncingCircleSpinner,
        TrinityRingsSpinner, HollowDotsSpinner,
        LoopingRhombusesSpinner, BreedingRhombusSpinner,
        HalfCircleSpinner, SwappingSquaresSpinner,
    },

    data() {
        return {
            list: [
                'spinner',
                'spinner-1',
                'water-fill',
                'epic-semipolar',
                'epic-flower',
                'epic-fulfilling-bouncing-circle',
                'epic-trinity-rings',
                'epic-hollow-dots',
                'epic-looping-rhombuses',
                'epic-breeding-rhombus',
                'epic-half-circle',
            ],
        };
    },

    methods: {
        startsWith(str) {
            return this.type.startsWith(str);
        },
    },
};
</script>

<style lang="scss">
    .loading{
        margin-top: 5%;
        margin-bottom: 5%;

        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        img {
            max-height: 180px;
        }
    }

    .loading-rotator-y-axis {
        height: 150px;
        width: 203px;
        margin: auto;
        -webkit-animation: rotateY 1.7s infinite linear;
        animation: rotateY 1.7s infinite linear;
    }

    @-webkit-keyframes rotateY {
        to {
            -webkit-transform: rotateY(360deg);
        }
    }

    @keyframes rotateY {
        to {
            transform: rotateY(360deg);
        }
    }
</style>
