export interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  subMenuItems?: SubMenuItem[];
  to?: string;
  activePaths: string[];
  category: string;
  isView?: boolean;
  roles?: string[];
}

interface SubMenuItem {
  key: string;
  label: string;
  icon: string;
  to?: string;
  activePaths: string[];
  roles?: string[];
}

export interface ActiveMenu {
  parentKey: string | null;
  subItemKey: string | null;
}
