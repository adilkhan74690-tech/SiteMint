import * as Icons from "lucide-react";
import React from "react";

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export default function LucideIcon({ name, className = "", size, style }: LucideIconProps) {
  // Safe lookup of the icon name on the Icons object
  const IconComponent = (Icons as any)[name];

  if (!IconComponent) {
    // Return a default icon (e.g. HelpCircle) if the specified icon does not exist
    return <Icons.HelpCircle className={className} size={size} style={style} />;
  }

  return <IconComponent className={className} size={size} style={style} />;
}
