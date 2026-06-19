<script setup lang="ts">
import Logoiconimg from '/images/logos/logo-icon.svg';
</script>
<template>
    <div class="logo">
        <NuxtLink to="/">
            <img :src="Logoiconimg" alt="home" />
        </NuxtLink>
    </div>
</template>