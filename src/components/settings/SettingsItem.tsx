import React from "react";

interface SettingsItemProps {
  label: string;
  children: React.ReactNode;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ label, children }) => (
  <div className="flex items-end justify-between hover:bg-hover transition-colors gap-xs">
    <span>{label}</span>
    <span className="dot-leaders flex-1 leading-none" />
    <div className="flex gap-sm">{children}</div>
  </div>
);
