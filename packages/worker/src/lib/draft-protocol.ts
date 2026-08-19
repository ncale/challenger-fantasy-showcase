import { base64Decode, base64Encode } from "@challenger-fantasy/core";
import type { DraftStateStatus } from "@challenger-fantasy/schemas";

export const ROUTES = {
  join: "/join",
  assign: "/assign",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

const HEADER_KEYS = {
  gameId: "x-encoded-game-id",
  userId: "x-encoded-user-id",
  username: "x-encoded-username",
  isDemo: "x-encoded-is-demo",
  draftGroupId: "x-encoded-draft-group-id",
  draftStatus: "x-encoded-draft-status",
} as const;

// The "Clean" type you actually want to use in your code
export interface DraftMetadata {
  gameId?: string;
  userId?: string;
  username?: string;
  isDemo?: boolean; // Boolean!
  draftGroupId?: string;
  draftStatus?: DraftStateStatus; // Typed Enum!
}

export const DraftProtocol = {
  /**
   * Encodes a clean object into a Request with base64 headers
   */
  pack: (req: Request, data: DraftMetadata): Request => {
    const newHeaders = new Headers(req.headers);

    (Object.keys(HEADER_KEYS) as Array<keyof DraftMetadata>).forEach((key) => {
      const value = data[key];
      const headerName = HEADER_KEYS[key];

      if (value !== undefined && value !== null) {
        // Convert everything to string for the header
        const stringValue = typeof value === "boolean" ? String(value) : value;
        newHeaders.set(headerName, base64Encode(stringValue));
      }
    });

    return new Request(req, { headers: newHeaders });
  },

  /**
   * Decodes headers back into a clean, typed object
   */
  unpack: (reqOrHeaders: Request | Headers): DraftMetadata => {
    const headers = reqOrHeaders instanceof Headers ? reqOrHeaders : reqOrHeaders.headers;

    const get = (key: keyof typeof HEADER_KEYS) => {
      const val = headers.get(HEADER_KEYS[key]);
      return val ? base64Decode(val) : undefined;
    };

    return {
      gameId: get("gameId"),
      userId: get("userId"),
      username: get("username"),
      isDemo: get("isDemo") === "true", // Cast back to boolean
      draftGroupId: get("draftGroupId"),
      draftStatus: get("draftStatus") as DraftStateStatus, // Cast to Enum
    };
  },

  /**
   * Packs metadata into headers and dispatches to a DO stub.
   */
  fetch: (
    stub: DurableObjectStub,
    route: Route,
    req: Request,
    data: DraftMetadata,
  ): Promise<Response> => {
    const packed = DraftProtocol.pack(req, data);
    return stub.fetch(`https://do${route}`, packed);
  },

  /**
   * Validates the incoming pathname inside a DO fetch handler.
   * Returns a 400 Response if the path doesn't match, null if valid.
   */
  guardRoute: (req: Request, expected: Route): Response | null => {
    const { pathname } = new URL(req.url);
    if (pathname !== expected) {
      return new Response(
        JSON.stringify({ message: `Invalid route: expected ${expected}, got ${pathname}` }),
        { status: 400 },
      );
    }
    return null;
  },

  /**
   * RESPONSE: Standardized 101 Upgrade for Draft Servers
   */
  upgrade: (clientSocket: WebSocket, status: DraftStateStatus) => {
    return new Response(null, {
      status: 101,
      webSocket: clientSocket,
      headers: {
        "Upgrade": "websocket",
        "Connection": "Upgrade",
        [HEADER_KEYS.draftStatus]: base64Encode(status),
      },
    });
  },

  /**
   * RESPONSE: Standardized way for Managers to read the status from a 101 response
   */
  parseResponseStatus: (res: Response): DraftStateStatus | null => {
    const val = res.headers.get(HEADER_KEYS.draftStatus);
    return val ? (base64Decode(val) as DraftStateStatus) : null;
  },
};
