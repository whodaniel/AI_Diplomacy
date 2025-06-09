// Placeholder for DiplomacyPower class
// This will be expanded when power.py is translated.

import type { DiplomacyGame } from "./game";
import type { PhaseTypeShort } from "../utils/constants"; // Assuming PhaseTypeShort is in constants

export class DiplomacyPower {
    name: string;
    game: DiplomacyGame; // Reference to the game instance
    orders: string[];    // List of orders for the current phase (movement/holds/supports/convoys)
    retreats: { [unitLoc: string]: string }; // Stores retreat orders, e.g. {"PAR": "A PAR R BUR"} or {"LON": "F LON D"}
    adjustments: string[]; // Stores build/disband/waive orders, e.g. ["A PAR B", "WAIVE"]

    // These might be redundant if game.current_state.units[powerName] is the source of truth
    // units: string[];     // List of units owned by this power (e.g., "A PAR", "F LON")
    // centers: string[];   // List of supply centers owned by this power (e.g., "PAR", "MAR")

    influence: string[]; // List of locations influenced
    civil_disorder: number; // Number of builds (positive) or disbands (negative)
    home_centers: string[]; // List of home supply centers
    order_is_set: boolean; // True if orders have been submitted for the current phase.

    constructor(name: string, game: DiplomacyGame) {
        this.name = name;
        this.game = game;
        this.orders = [];
        this.retreats = {};
        this.adjustments = [];
        // this.units = []; // Units are primarily managed in game.current_state.units
        // this.centers = [];// Centers are primarily managed in game.current_state.centers
        this.influence = [];
        this.civil_disorder = 0;
        this.home_centers = game.map?.homes[name] ? [...game.map.homes[name]] : [];
        this.order_is_set = false;
    }

    /**
     * Sets the orders for the power for the current phase type.
     * Note: This method is usually called by the Game class, which is the primary handler for order submission.
     * The Game class will update its central order store (game.orders) and then might call this
     * for the power instance to have its own reference or perform power-specific logic.
     */
    set_orders(orders: string[], phaseType: PhaseTypeShort | string): void {
        if (phaseType === 'MOVEMENT' || phaseType === 'M') { // Check against actual enum/string values
            this.orders = [...orders];
            this.retreats = {}; // Clear other phase orders
            this.adjustments = [];
        } else if (phaseType === 'RETREATS' || phaseType === 'R') {
            // Retreats are typically specific, "A PAR R BUR" or "A LON D"
            // The Game's _add_retreat_orders will process these into this.retreats on the Power instance.
            // So, this method might just be a simple assignment if called from Game,
            // or it might parse them if orders are raw strings.
            // For now, let's assume Game does the parsing and populates `power.retreats` directly.
            this.orders = [];
            this.adjustments = [];
            // this.retreats = {}; // This would be populated by _add_retreat_orders
        } else if (phaseType === 'ADJUSTMENTS' || phaseType === 'A') {
            this.orders = [];
            this.retreats = {};
            this.adjustments = [...orders]; // Store build/disband/waive orders
        }
        this.order_is_set = true;
    }

    get_orders(): string[] { // Gets movement phase orders
        return [...this.orders];
    }

    get_retreat_order(unitLoc: string): string | undefined {
        // unitLoc should be the location of the dislodged unit, e.g., "PAR"
        return this.retreats[unitLoc.toUpperCase()];
    }

    get_adjustments(): string[] {
        return [...this.adjustments];
    }

    get_units(): string[] {
        return this.game.get_units(this.name) as string[];
    }

    get_centers(): string[] {
        return this.game.get_centers(this.name) as string[];
    }

    to_json_object(): any {
        return {
            name: this.name,
            orders: [...this.orders],
            retreats: {...this.retreats},
            adjustments: [...this.adjustments],
            civil_disorder: this.civil_disorder,
            order_is_set: this.order_is_set,
            // home_centers are usually static from map, units/centers from game state
        };
    }

    from_json_object(data: any, game: DiplomacyGame): void { // Pass game if needed for context
        this.name = data.name || this.name;
        this.orders = data.orders ? [...data.orders] : [];
        this.retreats = data.retreats ? {...data.retreats} : {};
        this.adjustments = data.adjustments ? [...data.adjustments] : [];
        this.civil_disorder = data.civil_disorder || 0;
        this.order_is_set = data.order_is_set || false;
        this.game = game; // Re-link game instance
        this.home_centers = game.map?.homes[this.name] ? [...game.map.homes[this.name]] : [];
    }
}
