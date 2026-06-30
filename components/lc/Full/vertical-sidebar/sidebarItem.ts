export interface menu {
    header?: string;
    title?: string;
    icon?: any;
    id?: number;
    to?: string;
    chip?: string;
    BgColor?: string;
    chipBgColor?: string;
    chipColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: menu[];
    disabled?: boolean;
    type?: string;
    subCaption?: string;
    // Account types allowed to see this item. Omit = visible to everyone.
    // Values: 'developer' | 'tester' | 'hospital_admin'
    roles?: string[];
}

// HMIS Tenant Management Platform navigation.
// Items are filtered by the signed-in account type (see vertical-sidebar/index.vue).
const sidebarItem: menu[] = [
    {
        header: 'Platform',
        id: 1,
        children: [
            {
                title: 'Dashboard',
                icon: 'widget-add-line-duotone',
                to: '/dashboard',
                // everyone
            },
            {
                title: 'Hospitals',
                icon: 'hospital-line-duotone',
                to: '/hospitals',
                // Developers see every tenant; hospital admins manage their own.
                roles: ['developer', 'hospital_admin'],
            },
            {
                title: 'Test Cases',
                icon: 'clipboard-check-line-duotone',
                to: '/test-cases',
                // Testers run test cases; developers oversee them.
                roles: ['tester', 'developer'],
            },
            {
                title: 'Bugs & Features',
                icon: 'bug-line-duotone',
                to: '/work',
                // Developers get assigned bugs/features.
                roles: ['developer'],
            },
        ],
    },
];

export default sidebarItem;
