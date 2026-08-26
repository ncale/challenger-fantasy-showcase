// components/linkbox.tsx

import { Link, type LinkProps } from "@tanstack/react-router";
import type React from "react";
import { createContext, forwardRef, useContext } from "react";

/**
 * linkbox / linkoverlay for tanstack router
 *
 * - linkbox: wrapper that makes descendants pointer-events:none so a single overlay link can catch clicks
 * - linkoverlay: a tanstack <Link> absolutely positioned over the box
 *
 * inner actionable elements (a, button, input) must have:
 *   className="pointer-events-auto relative z-20"
 *
 * tailwind assumed.
 */

const LinkBoxContext = createContext(false);

export type LinkBoxProps = React.HTMLAttributes<HTMLDivElement>;

export const LinkBox = forwardRef<HTMLDivElement, LinkBoxProps>(function LinkBox(
  { children, className = "", ...rest },
  ref,
) {
  // default: relative so overlay can absolutely cover it
  // and disable pointer events for descendants so overlay receives clicks.
  const wrapper = "relative rounded-lg border p-4 shadow-sm";
  const disableInner = "[&_*]:pointer-events-none";

  return (
    <LinkBoxContext.Provider value={true}>
      <div
        ref={ref}
        className={[wrapper, disableInner, className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </div>
    </LinkBoxContext.Provider>
  );
});

LinkBox.displayName = "LinkBox";

export type LinkOverlayProps = LinkProps & {
  children?: React.ReactNode;
  className?: string;
};

export const LinkOverlay = forwardRef<HTMLAnchorElement, LinkOverlayProps>(function LinkOverlay(
  { to, children, className = "", ...rest },
  ref,
) {
  const inside = useContext(LinkBoxContext);
  if (!inside && process.env.NODE_ENV !== "production") {
    // tiny dev warning
    // eslint-disable-next-line no-console
    console.warn("<LinkOverlay> should be inside a <LinkBox> for expected behavior");
  }

  // covers entire box, is the only anchor that normally receives clicks
  const overlayBase = "absolute inset-0 z-10 inline-block !pointer-events-auto rounded-lg";

  return (
    <Link
      to={to}
      ref={ref}
      className={[overlayBase, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {/* keep a span to host visible overlay text if needed */}
      {children && <span className="relative z-10">{children}</span>}
    </Link>
  );
});

LinkOverlay.displayName = "LinkOverlay";

export type InnerLinkProps = LinkProps & { className?: string };

export function InnerLink({ className = "", ...props }: InnerLinkProps) {
  const base = "!pointer-events-auto relative z-20";
  return <Link className={[base, className].join(" ")} {...props} />;
}
