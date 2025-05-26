"use client"
import Link from "next/link"
import * as LucideIcons from "lucide-react"
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@/components/ui/menubar"

// Type definitions for our menu structure
type MenuItemAction = {
    type: "function"
    handler: string // Name of the function to call
}

type MenuItemLink = {
    type: "link"
    href: string
}

type MenuItemBase = {
    label: string
    icon?: keyof typeof LucideIcons
    shortcut?: string
    disabled?: boolean
}

type MenuItem = MenuItemBase &
    (
        | MenuItemAction
        | MenuItemLink
        | {
        type?: undefined
        items?: MenuItem[]
    }
        )

type MenuConfig = {
    items: MenuItem[]
}

interface DynamicMenubarProps {
    config: MenuConfig
    actionHandlers?: Record<string, () => void>
    className?: string
}

export function DynamicMenubar({ config, actionHandlers = {}, className = "" }: DynamicMenubarProps) {
    // Function to render the icon
    const renderIcon = (iconName?: keyof typeof LucideIcons) => {
        if (!iconName) return null

        const Icon = LucideIcons[iconName]
        return Icon ? <Icon className="mr-2 h-4 w-4" /> : null
    }

    // Function to render menu items recursively
    const renderMenuItem = (item: MenuItem) => {
        // If the item has sub-items, render a sub-menu
        if (item.items && item.items.length > 0) {
            return (
                <MenubarSub key={item.label}>
                    <MenubarSubTrigger disabled={item.disabled}>
                        {renderIcon(item.icon)}
                        {item.label}
                    </MenubarSubTrigger>
                    <MenubarSubContent>{item.items.map((subItem) => renderMenuItem(subItem))}</MenubarSubContent>
                </MenubarSub>
            )
        }

        // Render shortcut if provided
        const shortcut = item.shortcut ? <MenubarShortcut>{item.shortcut}</MenubarShortcut> : null

        // Handle different item types
        if (item.type === "link") {
            return (
                <Link href={item.href} key={item.label} passHref>
                    <MenubarItem disabled={item.disabled}>
                        {renderIcon(item.icon)}
                        {item.label}
                        {shortcut}
                    </MenubarItem>
                </Link>
            )
        }

        if (item.type === "function") {
            const handler = actionHandlers[item.handler]
            return (
                <MenubarItem key={item.label} onClick={handler} disabled={item.disabled || !handler}>
                    {renderIcon(item.icon)}
                    {item.label}
                    {shortcut}
                </MenubarItem>
            )
        }

        // Default item with no action
        return (
            <MenubarItem key={item.label} disabled={item.disabled}>
                {renderIcon(item.icon)}
                {item.label}
                {shortcut}
            </MenubarItem>
        )
    }

    return (
        <Menubar className={className}>
            {config.items.map((menuItem) => (
                <MenubarMenu key={menuItem.label}>
                    <MenubarTrigger disabled={menuItem.disabled}>{menuItem.label}</MenubarTrigger>
                    <MenubarContent>{menuItem.items?.map((item) => renderMenuItem(item))}</MenubarContent>
                </MenubarMenu>
            ))}
        </Menubar>
    )
}
