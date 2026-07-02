<script setup lang="ts">
import { computed } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import { useAuthStore } from '@/stores/auth';
import sidebarItems from './sidebarItem';
import type { menu } from './sidebarItem';
import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/index.vue';
import Logo from '../logo/Logo.vue';

const customizer = useCustomizerStore();
const auth = useAuthStore();

// The current account's role key for menu gating.
const currentRole = computed<string>(() => auth.platformRole ?? 'hospital_admin');

// System admin is a superuser — every menu item is visible.
const canSee = (item: menu): boolean =>
  auth.isSystemAdmin || !item.roles || item.roles.includes(currentRole.value);

// Filter children by role, then drop any group/header left with no children.
const sidebarMenu = computed<menu[]>(() =>
  sidebarItems
    .map((group) => ({
      ...group,
      children: (group.children ?? []).filter(canSee),
    }))
    .filter((group) => !group.header || group.children.length > 0),
);
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
