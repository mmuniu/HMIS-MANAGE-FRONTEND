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
    // Values: 'developer' | 'tester' | 'qa' | 'provisioning_admin' | 'hospital_admin'
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
                // Provisioning admins register new hospitals here.
                roles: ['system_admin', 'hospital_admin', 'provisioning_admin'],
            },
            {
                title: 'Deployments',
                icon: 'checklist-minimalistic-line-duotone',
                to: '/deployments',
                // Platform staff track each hospital's implementation lifecycle.
                roles: ['system_admin'],
            },
            {
                title: 'Integrations',
                icon: 'plug-circle-line-duotone',
                to: '/integrations',
                roles: ['system_admin', 'hospital_admin', 'provisioning_admin'],
            },
            {
                title: 'Users',
                icon: 'users-group-rounded-line-duotone',
                to: '/users',
                // System admin manages every account on the platform.
                roles: ['system_admin'],
            },
            {
                title: 'Test Cases',
                icon: 'clipboard-check-line-duotone',
                to: '/test-cases',
                // Testers + QA run test cases; developers oversee them.
                roles: ['tester', 'developer', 'qa', 'provisioning_admin'],
            },
            {
                title: 'My Test Cases',
                icon: 'document-add-line-duotone',
                to: '/my-test-cases',
                // Authors (tester + developer + provisioning admin) track approval.
                roles: ['tester', 'developer', 'provisioning_admin'],
            },
            {
                title: 'Test Approvals',
                icon: 'shield-check-line-duotone',
                to: '/test-approvals',
                // Developers + system admin approve new test cases before they go live.
                roles: ['developer', 'system_admin'],
            },
            {
                title: 'Systems',
                icon: 'layers-minimalistic-line-duotone',
                to: '/systems',
                // System admin registers/configures data partitions.
                roles: ['system_admin'],
            },
            {
                title: 'Tester Activity',
                icon: 'chart-2-line-duotone',
                to: '/tester-activity',
                // System admin tracks testers' create/pass/fail journey.
                roles: ['system_admin'],
            },
            {
                title: 'Run History',
                icon: 'history-line-duotone',
                to: '/run-history',
                // Everyone sees their own run history; admin sees all.
                roles: ['tester', 'qa', 'developer', 'system_admin', 'provisioning_admin'],
            },
            {
                title: 'Report a Bug',
                icon: 'danger-triangle-line-duotone',
                to: '/feedback',
                // Everyone can report a bug / suggest a feature.
            },
            {
                title: 'Feedback Admin',
                icon: 'inbox-line-line-duotone',
                to: '/feedback-admin',
                // System admin triages all reports and assigns them to devs.
                roles: ['system_admin'],
            },
            {
                title: 'Assigned Bugs',
                icon: 'bug-line-duotone',
                to: '/work',
                // Developers see their own assigned work; system admin sees all.
                roles: ['developer', 'system_admin'],
            },
        ],
    },
];

export default sidebarItem;
