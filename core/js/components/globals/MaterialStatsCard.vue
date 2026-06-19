<template>
  <base-material-card
      :icon="icon"
      class="v-card--material-stats"
      v-bind="$attrs"
      v-on="$listeners"
  >
    <template v-slot:after-heading>
      <div class="ml-auto text-right">
        <div
            class="caption grey--text font-weight-light"
        > &nbsp; </div>

        <h5 class="title font-weight-bold text--primary" style="font-size:12px!important">
          {{ value }} <small>{{ smallValue }}</small>
        </h5>
      </div>
    </template>

    <v-col cols="12" class="px-0">
      <v-divider />
    </v-col>

    <div v-text="title" class="mr-5 text-wrap font-weight-bold" style="word-wrap: break-word; font-size: 12px;"/>
  </base-material-card>
</template>

<script>
import BaseMaterialCard from "./MaterialCard";
import Card from "./Card";

export default {
  name: "MaterialStatsCard",

  inheritAttrs: false,

  components: {
    BaseMaterialCard,
  },

  props: {
    ...Card.props,
    icon: {
      type: String,
      required: true,
    },
    subIcon: {
      type: String,
      default: undefined,
    },
    subIconColor: {
      type: String,
      default: undefined,
    },
    subTextColor: {
      type: String,
      default: undefined,
    },
    subText: {
      type: String,
      default: undefined,
    },
    title: {
      type: String,
      default: undefined,
    },
    value: {
      type: String,
      default: undefined,
    },
    smallValue: {
      type: String,
      default: undefined,
    },
  },
};
</script>

<style lang="sass">
.v-card--material-stats
  display: flex
  flex-wrap: wrap
  position: relative

  > div:first-child
    justify-content: space-between

  .v-card
    border-radius: 4px
    flex: 0 1 auto

  .v-card__text
    display: inline-block
    flex: 1 0 calc(100% - 120px)
    position: absolute
    top: 0
    right: 0
    width: 100%

  .v-card__actions
    flex: 1 0 100%
</style>
