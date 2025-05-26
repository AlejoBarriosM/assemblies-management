"use client"

import * as React from "react"
import {
    IconChartBar,
    IconDashboard,
    IconFolder,
    IconInnerShadowTop,
    IconListDetails,
    IconSettings,
    IconUsers,
} from "@tabler/icons-react"

import {NavMain} from "@/components/nav-main"
import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarRail,
} from "@/components/ui/sidebar"

import {useCompany, useUser} from "@/context/context";
import {TeamSwitcher} from "@/components/team-switcher";
import {AudioWaveform, GalleryVerticalEnd, Command} from "lucide-react";
import {Separator} from "@radix-ui/react-menu";


const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ],
    navMain: [
        {
            title: "Inicio",
            url: "/",
            icon: IconDashboard,
            isActive: true,
            items: []
        },
        {
            title: "Empresa",
            url: "",
            icon: IconListDetails,
            items: [
                {
                    title: "Departamentos",
                    url: "/empresa/departamentos",
                },
                {
                    title: "Puestos",
                    url: "/empresa/puestos",
                },
                {
                    title: "Empleados",
                    url: "/empresa/empleados",
                },
                {
                    title: "Conceptos Nómina",
                    url: "/empresa/conceptos-nomina",
                },
                {
                    title: "Nómina",
                    url: "/empresa/nomina",
                },
            ],
        },
        {
            title: "Clientes",
            url: "",
            icon: IconUsers,
            items: [
                {
                    title: "Clientes",
                    url: "/clientes",
                },
                {
                    title: "Roles Representantes",
                    url: "/clientes/roles-representantes",
                },
                {
                    title: "Representantes",
                    url: "/clientes/representantes",
                },
                {
                    title: "Accionistas",
                    url: "/clientes/accionistas",
                },
            ],
        },
        {
            title: "Asambleas",
            url: "",
            icon: IconChartBar,
            items: [
                {
                    title: "Asambleas",
                    url: "/asambleas/",
                },
                {
                    title: "Tipos de Asambleas",
                    url: "/asambleas/tipos-asambleas",
                },
                {
                    title: "Reportes",
                    url: "/asambleas/reportes",
                },
            ],
        },
        {
            title: "Reuniones",
            url: "",
            icon: IconFolder,
            items: [
                {
                    title: "Agendas",
                    url: "/reuniones/agendas",
                },
            ],
        },
        {
            title: "Configuraciones",
            url: "/configuraciones",
            icon: IconSettings,
            items: [
                {
                    title: "Compañía",
                    url: "/configuraciones/compania",
                },
                {
                    title: "Maestros",
                    url: "/configuraciones/maestros",
                },
                {
                    title: "Ubicaciones",
                    url: "/configuraciones/maestros/ubicaciones",
                },
                {
                    title: "Roles",
                    url: "/configuraciones/roles",
                },
                {
                    title: "Permisos",
                    url: "/configuraciones/permisos",
                },
                {
                    title: "Usuarios",
                    url: "/configuraciones/usuarios",
                },
            ],
        }
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {company} = useCompany()
    const {user} = useUser()

    return (
        <Sidebar collapsible="icon" {...props}>
            <Separator className="my-2"/>
                <SidebarMenuButton
                    asChild
                    className="data-[slot=sidebar-menu-button]:!p-1.5"
                >
                    <a href="#">
                        <IconInnerShadowTop className="!size-5"/>
                        <span className="text-base font-semibold">{company?.commercialName}</span>
                    </a>
                </SidebarMenuButton>
            <Separator className="my-2"/>
            {/*<SidebarHeader>*/}
            {/*    <TeamSwitcher teams={data.teams}/>*/}
            {/*</SidebarHeader>*/}
            <SidebarContent>
                <NavMain items={data.navMain}/>
                {/*<NavProjects projects={data.projects} />*/}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
        // <Sidebar collapsible="offcanvas" {...props}>
        //     <SidebarHeader>
        //         <SidebarMenu>
        //             <SidebarMenuItem>
        //                 <SidebarMenuButton
        //                     asChild
        //                     className="data-[slot=sidebar-menu-button]:!p-1.5"
        //                 >
        //                     <a href="#">
        //                         <IconInnerShadowTop className="!size-5"/>
        //                         <span className="text-base font-semibold">{company?.commercialName}</span>
        //                     </a>
        //                 </SidebarMenuButton>
        //             </SidebarMenuItem>
        //         </SidebarMenu>
        //     </SidebarHeader>
        //     <SidebarContent>
        //         <NavMain items={data.navMain}/>
        //         {/*<NavDocuments items={data.documents}/>*/}
        //         {/*<NavSecondary items={data.navSecondary} className="mt-auto"/>*/}
        //     </SidebarContent>
        //     <SidebarFooter>
        //         <NavUser user={data.user}/>
        //     </SidebarFooter>
        // </Sidebar>
    )
}
