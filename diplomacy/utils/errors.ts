// Placeholder for error constants/messages
// These would typically be more structured, perhaps mirroring Python's error codes.

export const GAME_ORDER_NOT_PARSED = 'GAME_ORDER_NOT_PARSED: Order string "%s" could not be parsed.';
export const GAME_ORDER_POWER_NOT_IN_GAME = 'GAME_ORDER_POWER_NOT_IN_GAME: Power "%s" is not part of this game.';
export const GAME_ORDER_UNIT_DOES_NOT_EXIST = 'GAME_ORDER_UNIT_DOES_NOT_EXIST: Unit "%s" does not exist.';
export const GAME_ORDER_UNIT_NOT_OF_POWER = 'GAME_ORDER_UNIT_NOT_OF_POWER: Unit "%s" does not belong to power "%s".';
export const GAME_ORDER_INVALID_ORDER_TYPE = 'GAME_ORDER_INVALID_ORDER_TYPE: Order type "%s" is invalid for the current phase.';
// Add more error messages as identified from the Python codebase (err.py)

// Example structure if using error codes from constants.ts
import { ErrorCode } from './constants';

export const ERRORS: { [key in ErrorCode]?: string } = {
    [ErrorCode.GAME_NOT_ENOUGH_POWERS]: "Not enough powers to start the game.",
    // ... populate with more messages corresponding to ErrorCode enum
};

// Generic error formatting function (optional)
export function formatError(errorCode: ErrorCode | string, ...args: string[]): string {
    let message = ERRORS[errorCode as ErrorCode] || errorCode;
    args.forEach((arg, index) => {
        message = message.replace(`%${index + 1}`, arg).replace('%s', arg); // Support %1 or %s
    });
    return message;
}
