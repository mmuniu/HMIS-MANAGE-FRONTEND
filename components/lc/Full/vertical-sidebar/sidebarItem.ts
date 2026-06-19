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
}

// HMIS Tenant Management Platform navigation.
// Only items backed by real backend functionality are listed.
const sidebarItem: menu[] = [
    {
        header: 'Platform',
        id: 1,
        children: [
            {
                title: 'Dashboard',
                icon: 'widget-add-line-duotone',
                to: '/dashboard',
            },
        ],
    },
];

export default sidebarItem;
