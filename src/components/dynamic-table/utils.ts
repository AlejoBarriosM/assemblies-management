// src/components/dynamic-table/utils.ts
import * as LucideIcons from "lucide-react";

export const getLucideIcon = (iconName?: string): React.ElementType | null => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || null;
};