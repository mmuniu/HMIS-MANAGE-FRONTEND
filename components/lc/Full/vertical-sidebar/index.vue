<script setup lang="ts">
import { shallowRef } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import sidebarItems from './sidebarItem';
import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/index.vue';
import Logo from '../logo/Logo.vue';

const customizer = useCustomizerStore();
const sidebarMenu = shallowRef(sidebarItems);
</script>

<template>




    <!-- LeftSidebar Items -->
    <v-navigation-drawer
        v-model="customizer.Sidebar_drawer"
        elevation="0"
        app
        top="0"
        class="leftSidebar"
        width="240"
    >
        <!---Logo part -->
        <div class="pa-4 pb-0">
            <Logo />
        </div>

        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <perfect-scrollbar class="scrollnavbar">
            <div class="px-4 py-0 sidebar-menus">
                <v-list class="py-1">
                    <template v-for="(item, i) in sidebarMenu" :key="i">
                        <!---Item Sub Header -->
                        <NavGroup :item="item" v-if="item.header" />
                        <!---If Has Child -->
                        <template v-for="(sItem, j) in item.children" :key="j">
                            <NavCollapse class="leftPadding" :item="sItem" :level="0" v-if="sItem.children" />
                            <NavItem :item="sItem" class="leftPadding" v-else />
                        </template>
                    </template>
                </v-list>
            </div>
        </perfect-scrollbar>
    </v-navigation-drawer>
</template>
