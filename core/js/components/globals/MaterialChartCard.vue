<template>
    <base-material-card
            class="v-card--material-chart"
            v-bind="$attrs"
            style="padding: 0"
            v-on="$listeners"
    >
        <template v-slot:heading>
            <chartist
                    v-if="data"
                    :data="data"
                    :event-handlers="eventHandlers"
                    :options="options"
                    :ratio="ratio"
                    :responsive-options="responsiveOptions"
                    :type="type"
                    style="max-height: 200px; padding: 0"
            />
        </template>

        <slot
                slot="reveal-actions"
                name="reveal-actions"
        />

        <slot />

        <slot
                slot="actions"
                name="actions"
        />
    </base-material-card>
</template>

<script>
import BaseMaterialCard from "./MaterialCard";

export default {
    name: "MaterialChartCard",

    inheritAttrs: false,

    components: {
        BaseMaterialCard,
    },

    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
        eventHandlers: {
            type: Array,
            default: () => ([]),
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        ratio: {
            type: String,
            default: undefined,
        },
        height: {
            type: String,
            default: "300px",
        },

        responsiveOptions: {
            type: Array,
            default: () => ([]),
        },
        type: {
            type: String,
            required: true,
            validator: (v) => ["Bar", "Line", "Pie"].includes(v),
        },
    },
};
</script>

<style lang="sass">
    .v-card--material-chart
        p
            color: #999

        .v-card--material__heading
            max-height: 225px

            .ct-chart-bar .ct-label.ct-horizontal.ct-end
                display: block
                overflow: hidden
                text-overflow: ellipsis
                white-space: nowrap
                transform: rotate(-30deg)
                transform-origin: 100% 0


            .ct-label
                color: inherit
                opacity: .8
                font-size: 0.675rem
                font-weight: 100

            .ct-grid
                stroke: rgba(255, 255, 255, 0.2)

            .ct-series-a .ct-point,
            .ct-series-a .ct-line,
            .ct-series-a .ct-bar,
            .ct-series-a .ct-slice-donut
                stroke: rgba(255,255,255,.8)

            .ct-series-a .ct-slice-pie,
            .ct-series-a .ct-area
                fill: rgba(255,255,255,.4)
</style>
