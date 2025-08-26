import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'DJJS Event Management',
        isTitle: true
    },
    {
        id: 2,
        label: 'MENUITEMS.DASHBOARDS.TEXT',
        icon: 'bx-home-circle',
        link: '/dashboard',
    },
    {
        id: 3,
        label: 'Events',
        icon: 'bx-calendar-event',
        link: '/events',
    },
    {
        id: 4,
        label: 'Areas',
        icon: 'bx-map',
        link: '/areas',
    },
    {
        id: 5,
        label: 'Districts',
        icon: 'bx bxs-inbox',
        link: '/districts',
    },
    {
        id: 6,
        label: 'MENUITEMS.BRANCH.TEXT',
        icon: 'bx bx-git-pull-request',
        link: '/branch'
    },
    {
        id: 7,
        label: 'Users',
        icon: 'bx-user',
        link: '/branch/branchAssistance',
    },

    
];

