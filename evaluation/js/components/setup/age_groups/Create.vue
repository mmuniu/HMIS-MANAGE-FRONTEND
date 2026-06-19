<template>
  <age-group-create-form :age-group-data="ageGroupData"></age-group-create-form>
</template>
<script>
import AgeGroupCreateForm from './partials/AgeGroupCreateForm';

export default {
  props: [
    'ageGroupData',
  ],
  components: {
    AgeGroupCreateForm,
  },
};
</script>
