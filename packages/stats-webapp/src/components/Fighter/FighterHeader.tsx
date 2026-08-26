import { DefaultAvatar } from "../Avatars/DefaultAvatar";

interface FighterHeaderProps {
  name: string;
  nickname?: string;
  rightActions?: React.ReactNode;
}

export function FighterHeader({ name, nickname, rightActions }: FighterHeaderProps) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <DefaultAvatar text={name} />
          <div>
            <h1 className="text-xl font-bold text-foreground mb-0.5">{name}</h1>
            {nickname && <p className="text-sm text-muted-foreground">"{nickname}"</p>}
          </div>
        </div>
        {rightActions ? <div className="shrink-0">{rightActions}</div> : null}
      </div>
    </div>
  );
}
