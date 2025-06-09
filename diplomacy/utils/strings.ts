// Placeholder for string constants used in the game engine,
// particularly for logging, phase summaries, and potentially order results text.

export const RESOLVE_HOLDS = 'Resolving Holds';
export const RESOLVE_CONVOYS = 'Resolving Convoys';
export const RESOLVE_MOVES = 'Resolving Moves';
export const RESOLVE_RETREATS = 'Resolving Retreats';
export const RESOLVE_ADJUSTMENTS = 'Resolving Adjustments';

export const CONVOY_FAILED_NO_PATH = 'Convoy failed: No valid path.';
export const CONVOY_FAILED_DISRUPTED = 'Convoy failed: Path disrupted.';

export const MOVE_FAILED_NO_PATH = 'Move failed: No path or unit dislodged.'; // Generic, can be more specific
export const MOVE_FAILED_BOUNCED = 'Move failed: Bounced.';
export const MOVE_FAILED_ILLEGAL = 'Move failed: Illegal move.';

export const SUPPORT_FAILED_CUT = 'Support failed: Support cut.';
export const SUPPORT_FAILED_DISLODGED = 'Support failed: Supporting unit dislodged.';
export const SUPPORT_FAILED_NO_ORDER = 'Support failed: Target unit did not perform the supported action or does not exist.';
export const SUPPORT_FAILED_NO_PATH = 'Support failed: No path for supported action.'; // e.g. supported unit cannot reach target
export const SUPPORT_FAILED_INVALID_ORDER = 'Support failed: Supported order is invalid.';
export const SUPPORT_FAILED_BOUNCED = 'Support failed: Supported move bounced.';
export const SUPPORT_FAILED_ILLEGAL = 'Support failed: Illegal support.';
export const SUPPORT_FAILED_TARGET_DISLODGED = 'Support failed: Target unit was dislodged.';
export const SUPPORT_FAILED_TARGET_ORDER_FAILED = 'Support failed: Target unit\'s order failed.';


export const RETREAT_FAILED_NO_PATH = 'Retreat failed: No valid path.';
export const RETREAT_FAILED_BOUNCED = 'Retreat failed: Bounced (multiple retreats to same location).';
export const RETREAT_FAILED_ILLEGAL = 'Retreat failed: Illegal retreat location.';

export const BUILD_FAILED_NO_BUILD_SITES = 'Build failed: No available build sites.';
export const BUILD_FAILED_NO_SUCH_HOME = 'Build failed: Not a home center or not owned.';
export const BUILD_FAILED_OCCUPIED_HOME = 'Build failed: Home center is occupied.';
export const BUILD_FAILED_ILLEGAL_BLD = 'Build failed: Illegal build order.'; // Generic
export const BUILD_FAILED_ILLEGAL_WAIVE = 'Build failed: Cannot waive mandatory disbands.';

export const REMOVE_FAILED_ILLEGAL = 'Remove failed: Illegal remove order.';

// Add more strings as needed by translating from the Python source
// (typically from diplomacy.utils.strings or similar utility modules)
