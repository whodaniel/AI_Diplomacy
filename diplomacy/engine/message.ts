// Placeholder for DiplomacyMessage class/interface and related constants

export const GLOBAL = 'GLOBAL'; // Special recipient for messages to all powers

export interface DiplomacyMessage {
    id?: string; // Optional message ID
    game_id: string;
    sender: string; // Power name, or special values like 'GAME' or 'SYSTEM'
    recipient: string | typeof GLOBAL | null; // Power name, GLOBAL, or null (often implies GLOBAL)
    phase: string; // Game phase when the message was sent/generated
    message: string; // The content of the message
    type?: string; // Optional message type, e.g., 'CHAT', 'GAME_EVENT', 'ERROR'
    timestamp: number; // Unix timestamp (milliseconds or seconds)

    // Other potential fields:
    // order_id?: string; // If message relates to a specific order
    // is_read?: boolean;
}

// Example of a function that might create messages (can be part of a MessageHandler class later)
export function createMessage(
    gameId: string,
    phase: string,
    sender: string,
    recipient: string | typeof GLOBAL | null,
    messageText: string,
    type?: string
): DiplomacyMessage {
    return {
        game_id: gameId,
        phase: phase,
        sender: sender,
        recipient: recipient,
        message: messageText,
        type: type || 'INFO', // Default type
        timestamp: Date.now(),
    };
}

// This file would also contain any logic for message storage, retrieval,
// filtering, or processing if not handled by the Game class directly.
// For now, it primarily defines the structure.
