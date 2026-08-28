import { DEFAULT_APP_CONFIG } from "../data";
import type { DraftConfig, Drafter, DraftState, FighterPick } from "../schemas";
import { isNullish } from "../data/utils";

// Fisher-Yates shuffle for random order
function shuffleArray<T>(array: T[]): T[] {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // biome-ignore lint/style/noNonNullAssertion: a[i] and a[j] are guaranteed to be defined
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

type ConstructorParams =
  | { kind: "init"; draftConfig: DraftConfig; allFighterIds: string[] }
  | { kind: "resume"; state: DraftState; allFighterIds: string[] };

export class DraftLobby {
  #state: DraftState;
  #allFighterIds: string[];

  constructor(params: ConstructorParams) {
    this.#allFighterIds = params.allFighterIds;

    if (params.kind === "init") {
      this.#state = {
        users: new Set<Drafter>(),
        draftConfig: params.draftConfig,
        status: "pending",
        nextPickAt: undefined,
      };
    } else if (params.kind === "resume") {
      this.#state = params.state;
    } else throw new Error("Invalid constructor params.");
  }

  public syncUsers(sessions: Iterable<Drafter>): DraftState {
    if (this.#state.status !== "pending") {
      return this.#state;
    }

    const uniqueUsers = new Map<string, Drafter>();
    for (const s of sessions) {
      if (!uniqueUsers.has(s.userId)) {
        uniqueUsers.set(s.userId, s);
      }
    }

    // Preserve insertion order (first come first serve) and cap at draft size
    const potentialUsers = Array.from(uniqueUsers.values());
    const allowedUsers = potentialUsers.slice(0, this.#state.draftConfig.draftSize);

    this.#state.users = new Set(allowedUsers);

    if (this.#state.users.size === this.#state.draftConfig.draftSize) {
      // TODO: fetch & pass the draft init time seconds
      this.initializeDraft();
    }

    return this.#state;
  }

  // TODO: make this idempotent
  // Lock users, shuffle order, start 5s countdown
  private initializeDraft({
    initializingSeconds = DEFAULT_APP_CONFIG.draftInitializingTimeSeconds,
  }: {
    initializingSeconds?: number;
  } = {}): void {
    const usersArray = Array.from(this.#state.users);
    const shuffledUsers = shuffleArray(usersArray);
    const pickOrder = shuffledUsers.map((u) => u.userId);

    this.#state = {
      ...this.#state,
      status: "initializing",
      pickOrder,
      nextPickAt: new Date(Date.now() + initializingSeconds * 1000),
    };
  }

  // Start the draft (move to in-progress)
  public startDraft(): void {
    if (this.#state.status !== "initializing") return;

    const firstPickerId = this.#state.pickOrder[0];
    if (!firstPickerId) throw new Error("First picker ID not found");

    this.#state = {
      ...this.#state,
      status: "in-progress",
      currentRound: 1,
      currentPickerId: firstPickerId,
      nextPickAt: new Date(Date.now() + this.#state.draftConfig.pickClockSeconds * 1000),
    };
  }

  public handlePick(userId: string, payload: FighterPick): DraftState {
    if (this.#state.status !== "in-progress") throw new Error("Draft not in progress");

    if (userId !== this.#state.currentPickerId) {
      // Not their turn
      return this.#state;
    }

    // Validate fighter availability
    if (!this.isFighterAvailable(payload.fighterId)) {
      throw new Error("Fighter not available");
    }

    this.recordPick(userId, payload.fighterId);
    this.advanceTurn();

    return this.#state;
  }

  public autoPick(): DraftState {
    if (this.#state.status !== "in-progress") return this.#state;

    const available = this.getAvailableFighterIds();
    if (available.length === 0) {
      // Should not happen if config is correct
      console.error("No fighters available for auto-pick");
      this.advanceTurn();
      return this.#state;
    }

    const randomFighterId = available[Math.floor(Math.random() * available.length)];
    if (isNullish(randomFighterId)) throw new Error("Random fighter ID not found");

    this.recordPick(this.#state.currentPickerId, randomFighterId);
    this.advanceTurn();

    return this.#state;
  }

  private recordPick(userId: string, fighterId: string) {
    const user = Array.from(this.#state.users).find((u) => u.userId === userId);
    if (!user) throw new Error("User not found");

    user.picks.push({
      fighterId,
      pickedAt: new Date(),
    });
  }

  private advanceTurn() {
    if (this.#state.status !== "in-progress") return;

    const totalPicks = Array.from(this.#state.users).reduce((sum, u) => sum + u.picks.length, 0);
    const totalSlots = this.#state.draftConfig.numRounds * this.#state.draftConfig.draftSize;

    if (totalPicks >= totalSlots) {
      this.completeDraft();
      return;
    }

    // Calculate next picker
    // 0-indexed total pick number
    const nextPickIndex = totalPicks;
    const roundIndex = Math.floor(nextPickIndex / this.#state.draftConfig.draftSize); // 0-based round
    const positionInRound = nextPickIndex % this.#state.draftConfig.draftSize;

    const currentRound = roundIndex + 1;

    // Snake draft logic
    let pickerIndex: number;
    if (roundIndex % 2 === 0) {
      // Even rounds (0, 2... -> Rounds 1, 3...): forward
      pickerIndex = positionInRound;
    } else {
      // Odd rounds (1, 3... -> Rounds 2, 4...): backward
      pickerIndex = this.#state.draftConfig.draftSize - 1 - positionInRound;
    }

    const nextPickerId = this.#state.pickOrder[pickerIndex];
    if (isNullish(nextPickerId)) throw new Error("Next picker ID not found");

    this.#state = {
      ...this.#state,
      currentRound,
      currentPickerId: nextPickerId,
      nextPickAt: new Date(Date.now() + this.#state.draftConfig.pickClockSeconds * 1000),
    };
  }

  private completeDraft() {
    if (this.#state.status !== "in-progress") return;

    this.#state = {
      ...this.#state,
      status: "completed",
      nextPickAt: undefined,
    };
  }

  private isFighterAvailable(fighterId: string): boolean {
    // Check if any user has picked this fighter
    for (const user of this.#state.users) {
      if (user.picks.some((p) => p.fighterId === fighterId)) return false;
    }
    // Also check if valid fighter ID
    return this.#allFighterIds.includes(fighterId);
  }

  private getAvailableFighterIds(): string[] {
    const picked = new Set<string>();
    for (const user of this.#state.users) {
      for (const pick of user.picks) {
        picked.add(pick.fighterId);
      }
    }
    return this.#allFighterIds.filter((id) => !picked.has(id));
  }

  public getState(): DraftState {
    return this.#state;
  }
}
