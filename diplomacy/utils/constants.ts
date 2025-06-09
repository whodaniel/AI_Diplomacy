// Placeholder for constants

export enum OrderResult {
    SUCCESS = '0',
    NO_PATH = '1',
    CUT = '2',
    DISLODGED = '3',
    BOUNCED = '4',
    NO_CONVOY = '5',
    DISRUPTED = '6',
    NO_HOLD = '7',
    NO_RETREAT = '8',
    INVALID = '9',
    DISBANDED = 'A',
    // Add other results as needed
}

export enum PhaseTypeShort {
    MOVEMENT = 'M',
    RETREATS = 'R',
    ADJUSTMENTS = 'A',
    // Add other phase types if any (e.g. VOTING)
}

export enum GameStatus {
    FORMING = 'FORMING',
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    ENDED = 'ENDED',
    // Add other statuses
}

export enum Role {
    PLAYER = 'PLAYER',
    ADMIN = 'ADMIN',
    OBSERVER = 'OBSERVER',
    // Add other roles
}

export enum Rule {
    // Core Rules (examples, actual rules might vary)
    STANDARD_VICTORY_CONDITIONS = 'STANDARD_VICTORY_CONDITIONS',
    FOG_OF_WAR_FULL = 'FOG_OF_WAR_FULL',
    CIVIL_DISORDER_AUTO_DISBAND = 'CIVIL_DISORDER_AUTO_DISBAND',
    // Variants
    VARIANT_STANDARD = 'VARIANT_STANDARD',
    VARIANT_FLEET_ROME = 'VARIANT_FLEET_ROME',
    VARIANT_NO_NMR = 'VARIANT_NO_NMR',
    // Add other rules as defined in the Python version or documentation
}

export enum ErrorCode {
    // Generic
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',

    // Map related
    MAP_FILE_NOT_FOUND = 'MAP_FILE_NOT_FOUND',
    MAP_INVALID_SYNTAX = 'MAP_INVALID_SYNTAX',

    // Game related
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    GAME_INVALID_STATE = 'GAME_INVALID_STATE',
    GAME_NOT_ENOUGH_POWERS = 'GAME_NOT_ENOUGH_POWERS',

    // Order related
    ORDER_INVALID = 'ORDER_INVALID',
    ORDER_NOT_PARSED = 'ORDER_NOT_PARSED',
    ORDER_POWER_NOT_IN_GAME = 'ORDER_POWER_NOT_IN_GAME',
    ORDER_UNIT_DOES_NOT_EXIST = 'ORDER_UNIT_DOES_NOT_EXIST',
    // ... add many more specific order error codes from err.py
}

// General game constants (mirroring Python's diplomacy.utils.CONSTANTS)
export const UNDETERMINED = 0;
export const POWER = 1;
export const UNIT = 2;
export const LOCATION = 3;
export const COAST = 4;
export const ORDER = 5;
export const MOVE_SEP = 6;
export const OTHER = 7;

export const MOVEMENT_PHASES = ['MOVEMENT'];
export const RETREAT_PHASES = ['RETREATS'];
export const ADJUSTMENT_PHASES = ['ADJUSTMENTS'];
export const ALL_PHASES = ['MOVEMENT', 'RETREATS', 'ADJUSTMENTS'];

// Keywords and Aliases (can be expanded from map.py or a dedicated constants file)
export const KEYWORDS: { [key: string]: string } = {
    'HOLDS': 'H', 'HOLD': 'H', 'H': 'H',
    'MOVES': 'M', 'MOVE': 'M', 'M': 'M', '-': 'M',
    'SUPPORTS': 'S', 'SUPPORT': 'S', 'S': 'S',
    'CONVOYS': 'C', 'CONVOY': 'C', 'C': 'C',
    'RETREATS': 'R', 'RETREAT': 'R',
    'DISBANDS': 'D', 'DISBAND': 'D',
    'BUILDS': 'B', 'BUILD': 'B',
    'WAIVES': 'W', 'WAIVE': 'W',
    // ... and many more from the Python version
};

export const ALIASES: { [key: string]: string } = {
    // province name aliases, power name aliases, etc.
    // e.g. 'ENG': 'ENGLAND'
};

export const ORDER_TYPE_TO_PHASE_TYPE: { [key: string]: PhaseTypeShort[] } = {
    'H': [PhaseTypeShort.MOVEMENT],
    'M': [PhaseTypeShort.MOVEMENT],
    'S': [PhaseTypeShort.MOVEMENT],
    'C': [PhaseTypeShort.MOVEMENT],
    'R': [PhaseTypeShort.RETREATS],
    'D': [PhaseTypeShort.RETREATS, PhaseTypeShort.ADJUSTMENTS], // Disband can happen in retreats or adjustments
    'B': [PhaseTypeShort.ADJUSTMENTS],
    'W': [PhaseTypeShort.ADJUSTMENTS] // Waive
};

// Add other constants as they are identified from the Python codebase.
// This is just a starting point.
