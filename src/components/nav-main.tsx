"use client"

import {ChevronRight, type LucideIcon} from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
                            items,
                        }: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Módulos</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={item.isActive}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={item.title}>
                                    {item.icon && <item.icon/>}
                                    <span>{item.title}</span>
                                    <ChevronRight
                                        className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.items?.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild>
                                                <a href={subItem.url}>
                                                    <span>{subItem.title}</span>
                                                </a>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}


// "use client"
//
// import {IconCirclePlusFilled, IconMail, type Icon} from "@tabler/icons-react"
//
// import {Button} from "@/components/ui/button"
// import {
//     SidebarGroup,
//     SidebarGroupContent,
//     SidebarMenu,
//     SidebarMenuButton,
//     SidebarMenuItem,
// } from "@/components/ui/sidebar"
// import {Separator} from "@radix-ui/react-menu";
//
// export function NavMain({
//                             items,
//                         }: {
//     items: {
//         title: string
//         url: string
//         icon?: Icon
//     }[]
// }) {
//     return (
//         <SidebarGroup>
//             <SidebarGroupContent className="flex flex-col gap-2">
//                 {/*<SidebarMenu>*/}
//                 {/*  <SidebarMenuItem className="flex items-center gap-2">*/}
//                 {/*    <SidebarMenuButton*/}
//                 {/*      tooltip="Quick Create"*/}
//                 {/*      className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"*/}
//                 {/*    >*/}
//                 {/*      <IconCirclePlusFilled />*/}
//                 {/*      <span>Quick Create</span>*/}
//                 {/*    </SidebarMenuButton>*/}
//                 {/*    <Button*/}
//                 {/*      size="icon"*/}
//                 {/*      className="size-8 group-data-[collapsible=icon]:opacity-0"*/}
//                 {/*      variant="outline"*/}
//                 {/*    >*/}
//                 {/*      <IconMail />*/}
//                 {/*      <span className="sr-only">Inbox</span>*/}
//                 {/*    </Button>*/}
//                 {/*  </SidebarMenuItem>*/}
//                 {/*</SidebarMenu>*/}
//                 <Separator className="my-2"/>
//                 <SidebarMenu>
//                     {items.map((item) => (
//                         <SidebarMenuItem key={item.title}>
//                             <SidebarMenuButton tooltip={item.title}>
//                                 {item.url && (
//                                     <a href={item.url} className="flex items-center gap-1">
//                                         {item.icon && <item.icon/>}
//                                         <span>{item.title}</span>
//                                     </a>
//                                 )}
//                                 {/*<span>{item.title}</span>*/}
//                             </SidebarMenuButton>
//                         </SidebarMenuItem>
//                     ))}
//                 </SidebarMenu>
//             </SidebarGroupContent>
//         </SidebarGroup>
//     )
// }
