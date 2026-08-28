import type { Database, Prettify } from "../../../types";

// EVENTS - Hydrated adds shorthand names and parses dates

// GENERIC

type PlainEvent = { name: string };

type HydratedGenericEvent<T extends PlainEvent> = Prettify<
  T & {
    short_name: string;
  }
>;

function hydrateGenericEvent<T extends PlainEvent>(event: T): HydratedGenericEvent<T> {
  return { ...event, short_name: event.name };
}

// NON-GENERIC

type EventTableRow = Database["public"]["Tables"]["event"]["Row"];

export type HydratedEvent = HydratedGenericEvent<EventTableRow>;

export function hydrateEvent(event: EventTableRow): HydratedEvent {
  return hydrateGenericEvent(event);
}
