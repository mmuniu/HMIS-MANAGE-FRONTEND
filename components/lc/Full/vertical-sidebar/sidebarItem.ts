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
                // Testers + QA run test cases; developers oversee them.
                roles: ['tester', 'developer', 'qa'],
            },
            {
                title: 'Test Approvals',
                icon: 'shield-check-line-duotone',
                to: '/test-approvals',
                // System admin approves new test cases before they go live.
                roles: ['system_admin'],
            },
            {
                title: 'Tester Activity',
                icon: 'chart-2-line-duotone',
                to: '/tester-activity',
                // Developers track testers' create/pass/fail journey.
                roles: ['developer'],
            },
            {
                title: 'Send Feedback',
                icon: 'chat-round-like-line-duotone',
                to: '/feedback',
                // Everyone can report bugs / suggest features.
            },
            {
                title: 'Feedback Admin',
                icon: 'inbox-line-line-duotone',
                to: '/feedback-admin',
                // Developers triage all reports.
                roles: ['developer'],
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
