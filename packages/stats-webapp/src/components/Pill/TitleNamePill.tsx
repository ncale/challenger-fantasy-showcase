import { Pill } from "./Pill";

// This component is used to display the result of a fight in a pill format
//
// ex. Winner: Adesanya • R3 Decision

interface TitleNamePillProps {
  titleName: string;
}

export function TitleNamePill({ titleName }: TitleNamePillProps) {
  return (
    <div className="mt-2 text-center">
      <Pill color="champion-gold" size="sm" variant="regular">
        {titleName}
      </Pill>
    </div>
  );
}
