// Placeholder for GamePhaseData and related types

// Assuming DiplomacyMessage structure, replace with actual if available
interface DiplomacyMessage {
    sender: string; // Power name or 'GLOBAL'
    recipient: string | null; // Power name or null for all
    phase: string;
    message: string;
    timestamp: number;
}

export type MessagesType = DiplomacyMessage[];

export interface UnitPositions {
    [powerName: string]: string[]; // e.g., ENGLAND: ["A LVP", "F LON"]
}

export interface CenterOwnership {
    [powerName: string]: string[]; // e.g., FRANCE: ["PAR", "MAR", "BRE"]
}

export interface DislodgedUnits {
    [unit: string]: string; // e.g., "A PAR": "PIC" (Unit A PAR dislodged by unit from PIC)
}

export interface Retreats {
    [unit: string]: string[]; // e.g., "A PAR": ["BUR", "GAS"] (Possible retreat locations for A PAR)
}

export interface Adjustments {
    [powerName: string]: {
        builds: number; // Positive for builds, negative for disbands
        // Potentially other info like list of home SCs, current SC count vs unit count
    };
}

export interface OrderResults {
    [key: string]: any; // This will be more specific based on phase type (moves, supports, retreats etc.)
                        // e.g. MOVES: { "A PAR": ["SUCCESS", "PIC"] }
}


/**
 * Represents all data relevant to a single phase of a game.
 * This structure is likely used for history, saving/loading, and communication.
 */
export interface GamePhaseData {
    phase: string; // e.g., "SPRING 1901 MOVEMENT"
    units: UnitPositions;
    centers: CenterOwnership;
    orders: { [powerName: string]: string[] };
    results: OrderResults;
    dislodged_units?: DislodgedUnits; // Optional, as not all phases have dislodgements
    retreats?: Retreats; // Optional, only for retreat phases
    adjustments?: Adjustments; // Optional, only for adjustment phases
    messages?: MessagesType;
    // Add any other per-phase data that needs to be tracked or serialized
}

// Example function that might use this (placeholder)
export function get_phase_data_from_game(game: any /* Replace 'any' with DiplomacyGame type */): GamePhaseData {
    // This function would extract data from a DiplomacyGame instance
    // and structure it according to GamePhaseData.
    return {
        phase: game.phase,
        units: game.get_units(),
        centers: game.get_centers(),
        orders: game.get_orders(),
        results: game.results, // Assuming game.results is already in the correct structure
        dislodged_units: game.dislodged_units,
        retreats: game.retreats,
        // adjustments: game.builds, // Or however adjustments are stored
        // messages: game.messages,
    };
}
