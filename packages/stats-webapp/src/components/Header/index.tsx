import { PrimaryHeader } from "./PrimaryHeader";
import { SecondaryHeader } from "./SecondaryHeader";

interface HeaderProps {
  showSecondary?: boolean;
  title?: string;
}

export const Header = ({ showSecondary, title }: HeaderProps) => {
  return (
    <header className="shadow-sm sticky top-0 z-50">
      <PrimaryHeader />
      {showSecondary && <SecondaryHeader title={title} />}
    </header>
  );
};

export { Breadcrumb } from "./Breadcrumb";
export { PrimaryHeader } from "./PrimaryHeader";
export { SecondaryHeader } from "./SecondaryHeader";
