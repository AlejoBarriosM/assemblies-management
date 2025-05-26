"use client"

import { useState } from "react"
import { DynamicMenubar } from "@/components/dynamic-menubar"

export default function Home() {
    const [message, setMessage] = useState<string | null>(null)

    // Define action handlers
    const actionHandlers = {
        showAlert: () => setMessage("You clicked 'New File'"),
        showSaveAlert: () => setMessage("You clicked 'Save'"),
        showAboutAlert: () => setMessage("You clicked 'About'"),
        clearMessage: () => setMessage(null),
    }

    // Example menu configuration
    const menuConfig = {
        items: [
            {
                label: "File",
                items: [
                    {
                        label: "New File",
                        icon: "FileIcon",
                        shortcut: "⌘N",
                        type: "function",
                        handler: "showAlert",
                    },
                    {
                        label: "Save",
                        icon: "SaveIcon",
                        shortcut: "⌘S",
                        type: "function",
                        handler: "showSaveAlert",
                    },
                    {
                        label: "Save As...",
                        shortcut: "⇧⌘S",
                        disabled: true,
                    },
                    {
                        label: "Recent Files",
                        items: [
                            {
                                label: "document.txt",
                                icon: "FileTextIcon",
                                type: "link",
                                href: "#document",
                            },
                            {
                                label: "image.png",
                                icon: "ImageIcon",
                                type: "link",
                                href: "#image",
                            },
                        ],
                    },
                ],
            },
            {
                label: "Edit",
                items: [
                    {
                        label: "Undo",
                        icon: "UndoIcon",
                        shortcut: "⌘Z",
                        disabled: true,
                    },
                    {
                        label: "Redo",
                        icon: "RedoIcon",
                        shortcut: "⇧⌘Z",
                        disabled: true,
                    },
                    {
                        label: "Cut",
                        icon: "ScissorsIcon",
                        shortcut: "⌘X",
                    },
                    {
                        label: "Copy",
                        icon: "CopyIcon",
                        shortcut: "⌘C",
                    },
                    {
                        label: "Paste",
                        icon: "ClipboardIcon",
                        shortcut: "⌘V",
                    },
                ],
            },
            {
                label: "Help",
                items: [
                    {
                        label: "Documentation",
                        icon: "BookOpenIcon",
                        type: "link",
                        href: "https://nextjs.org/docs",
                    },
                    {
                        label: "About",
                        icon: "InfoIcon",
                        type: "function",
                        handler: "showAboutAlert",
                    },
                ],
            },
        ],
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-8">
            <div className="w-full max-w-5xl">
                <h1 className="text-2xl font-bold mb-6">Asambleas</h1>

                <DynamicMenubar config={menuConfig} actionHandlers={actionHandlers} />

                {message && (
                    <div className="mt-8 p-4 bg-muted rounded-md flex justify-between items-center">
                        <p>{message}</p>
                        <button
                            onClick={actionHandlers.clearMessage}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <div className="mt-8 p-6 border rounded-md">

                </div>
            </div>
        </main>
    )
}
