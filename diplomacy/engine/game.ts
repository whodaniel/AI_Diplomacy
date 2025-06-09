// ==============================================================================
// Copyright (C) 2019 - Philip Paquette
//
//  This program is free software: you can redistribute it and/or modify it under
//  the terms of the GNU Affero General Public License as published by the Free
//  Software Foundation, either version 3 of the License, or (at your option) any
//  later version.
//
//  This program is distributed in the hope that it will be useful, but WITHOUT
//  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
//  FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
//  details.
//
//  You should have received a copy of the GNU Affero General Public License along
//  with this program.  If not, see <https://www.gnu.org/licenses/>.
// ==============================================================================
// -*- coding: utf-8 -*-

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { DiplomacyMap } from './map';
import { DiplomacyPower } from './power';
import { DiplomacyMessage, GLOBAL } from './message';

import { OrderResult, PhaseTypeShort, GameStatus, Role, Rule, ErrorCode, UNDETERMINED, POWER, UNIT, LOCATION, COAST, ORDER, MOVE_SEP, OTHER, MOVEMENT_PHASES, RETREAT_PHASES, ADJUSTMENT_PHASES, ALL_PHASES, KEYWORDS, ALIASES, ORDER_TYPE_TO_PHASE_TYPE } from '../utils/constants';
import type { GamePhaseData, MessagesType, UnitPositions, CenterOwnership, DislodgedUnits as DislodgedUnitsType, Retreats as RetreatsType, Adjustments as AdjustmentsType, OrderResults as OrderResultsType } from '../utils/game_phase_data';
import { PriorityQueue } from '../utils/priority_queue';
import { SortedDict } from '../utils/sorted_dict';

import * as common from '../utils/common';
import * as errorUtils from '../utils/errors';
import * as stringUtils from '../utils/strings';
import { settings } from '../settings';

const LOGGER = {
    info: console.log,
    error: console.error,
    warn: console.warn,
    debug: settings.LOG_LEVEL === 'DEBUG' ? console.debug : () => {},
    exception: console.error,
};

type ZobristTable = { [key: string]: BigInt[] };

// Define a type for parsed orders for clarity during adjudication
interface ParsedOrder {
    unit: string; // e.g., "A PAR"
    unitType: string; // "A" or "F"
    unitLocation: string; // "PAR" (without coast for initial parsing)
    fullUnitLocation: string; // "PAR" or "STP/SC" (actual location of the unit)
    verb: string; // H, M, S, C, R, B, D, WAIVE
    target?: string; // For M, R: target location (e.g., "BUR")
    targetCoast?: string | null; // Specific coast of target for moves
    first_target_unit_type?: string | null; // For S, C: type of unit at first_target_loc ("A" or "F")
    first_target_loc?: string | null; // For S, C: location of supported/convoyed unit (e.g., "MAR")
    first_target_coast?: string | null; // Specific coast of first_target_loc
    second_target_loc?: string | null; // For S M, C M: destination of supported/convoyed unit (e.g., "PIC")
    second_target_coast?: string | null; // Specific coast of second_target_loc
    raw: string; // The original order string
    power: DiplomacyPower;
    result?: OrderResult;
    result_reason?: string;
    isConvoy?: boolean; // True if an army's move is via convoy
}


export class DiplomacyGame {
    static zobrist_tables: { [mapName: string]: ZobristTable } = {};
    static rule_cache: any = null;

    game_id: string;
    map_name: string;
    map: DiplomacyMap;

    powers: { [powerName: string]: DiplomacyPower };

    phase: string;
    year: number;
    season: string;
    phase_type: PhaseTypeShort;

    rules: Set<Rule>;
    error: string[];
    note: string;

    timestamp_created: number;
    timestamp_last_played: number;
    timestamp_last_saved: number;

    zobrist_hash: string;

    orders: { [powerName: string]: string[] }; // Raw orders submitted by powers
    parsed_orders: { [unitName: string]: ParsedOrder }; // Parsed orders for current phase adjudication

    results: OrderResultsType;
    result_history: SortedDict<OrderResultsType>;

    current_state: {
        units: UnitPositions;
        centers: CenterOwnership;
        dislodged_units: DislodgedUnitsType;
        retreats: RetreatsType;
    };
    state_history: SortedDict<{ units: UnitPositions, centers: CenterOwnership, dislodged_units: DislodgedUnitsType, retreats: RetreatsType }>;

    messages: MessagesType;

    _adj_supports: { [supportingUnit: string]: { order: string, targetUnit: string, targetDest: string | null, valid: boolean, reason: string | null, cut_by: string | null } };
    _adj_combat: any; // Will be structured as: { loc: { unit: "A PAR", hold_strength: 2, attacks: { "PIC": { unit: "A PIC", strength: 3, supports: [] }}}}
    _adj_dislodged: { [unitFullName: string]: string }; // unit_string: attacker_from_loc
    _adj_retreats: any; // Temporary storage during retreat calculation
    _adj_convoy_paths: { [armyUnit: string]: { [destination: string]: string[][] } }; // army: { dest: [ [fleet1, fleet2], [fleet3] ] }

    _unit_owner_cache: { [unit_loc: string]: string | null };
    _builds: AdjustmentsType; // Using AdjustmentsType for consistency
    _captures: { [powerName: string]: string[] };


    constructor(game_id?: string, initial_state: Partial<DiplomacyGame> = {}) {
        this.game_id = game_id || `GAME_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        this.timestamp_created = Date.now();
        this.timestamp_last_played = this.timestamp_created;
        this.timestamp_last_saved = 0;

        this.map_name = initial_state.map_name || 'standard';
        this.map = initial_state.map || new DiplomacyMap(this.map_name);

        this.rules = new Set(initial_state.rules || []);
        this.error = [];
        this.note = initial_state.note || '';

        this.powers = {};
        this.orders = {};
        this.parsed_orders = {};
        this.results = {};
        this.current_state = { units: {}, centers: {}, dislodged_units: {}, retreats: {} };

        this.order_history = new SortedDict();
        this.result_history = new SortedDict();
        this.state_history = new SortedDict();

        this.messages = [];

        this._adj_supports = {};
        this._adj_combat = {};
        this._adj_dislodged = {};
        this._adj_retreats = {};
        this._adj_convoy_paths = {};
        this._unit_owner_cache = {};
        this._builds = {};
        this._captures = {};

        this.phase = '';
        this.year = 0;
        this.season = '';
        this.phase_type = PhaseTypeShort.MOVEMENT;
        this.zobrist_hash = '';


        if (initial_state && Object.keys(initial_state).length > 0 && initial_state.phase) { // Check if initial_state is meaningful
            this.set_state(initial_state, true);
        } else {
            this.load_map(true);
            this._build_hash_table();
            this._move_to_start_phase();

            for (const powerName of this.map.powers) {
                this.powers[powerName] = new DiplomacyPower(powerName, this);
            }
            this.current_state.units = JSON.parse(JSON.stringify(this.map.units));
            this.current_state.centers = JSON.parse(JSON.stringify(this.map.centers));
            this.current_state.dislodged_units = {};
            this.current_state.retreats = {};
            this.rebuild_hash();
            this.extend_phase_history();
        }

        this._validate_status(false);
        if (this.get_status() === GameStatus.FORMING) {
            this._begin();
        }
    }

    load_map(reinit_powers = true): void {
        if (!this.map || !(this.map instanceof DiplomacyMap) || this.map.name !== this.map_name) {
            this.map = new DiplomacyMap(this.map_name || 'standard');
        }
        if (this.map.error.length > 0) {
            this.error.push(...this.map.error.map(e => `MapError: ${e}`));
        }
        if (reinit_powers) {
            this.powers = {};
            for (const powerName of this.map.powers) {
                this.powers[powerName] = new DiplomacyPower(powerName, this);
            }
        }
    }

    _build_hash_table(): void {
        if (DiplomacyGame.zobrist_tables[this.map.name]) {
            return;
        }
        LOGGER.info(`Game: Building Zobrist hash table for map ${this.map.name}`);
        const table: ZobristTable = {
            'TERRITORY': [], 'UNIT_TYPE': [], 'COAST': [], 'PHASE': []
        };
        const max_terr = this.map.locs.length;
        const max_powers = this.map.powers.length + 1;
        const max_unit_types = Object.keys(this.map.unit_names).length;
        const max_coasts = this.map.locs.length;
        const max_phases = this.map.seq.length;

        const generate_random_bigint = () => BigInt('0x' + crypto.randomBytes(8).toString('hex'));

        for (let i = 0; i < max_terr * max_powers; i++) table['TERRITORY'].push(generate_random_bigint());
        for (let i = 0; i < max_terr * max_unit_types * max_powers; i++) table['UNIT_TYPE'].push(generate_random_bigint());
        for (let i = 0; i < max_coasts * max_powers; i++) table['COAST'].push(generate_random_bigint());
        for (let i = 0; i < max_phases; i++) table['PHASE'].push(generate_random_bigint());

        DiplomacyGame.zobrist_tables[this.map.name] = table;
    }

    rebuild_hash(): string {
        let new_hash = BigInt(0);
        const table = DiplomacyGame.zobrist_tables[this.map.name];
        if (!table) {
            this._build_hash_table();
        }

        const phase_ix = this.map.seq.indexOf(`${this.season} ${this.phase_type}`);
        if (phase_ix !== -1 && table['PHASE'] && table['PHASE'][phase_ix]) {
            new_hash ^= table['PHASE'][phase_ix];
        }

        const power_indices: {[key:string]: number} = {};
        this.map.powers.forEach((p, idx) => power_indices[p] = idx);
        const unowned_idx = this.map.powers.length;
        const num_unit_types = Object.keys(this.map.unit_names).length;
        const num_powers = this.map.powers.length +1;


        for (const powerName in this.current_state.units) {
            const power_ix = power_indices[powerName] ?? unowned_idx;
            for (const unitStr of this.current_state.units[powerName]) {
                const unitType = unitStr[0];
                const locWithCoast = unitStr.substring(2);
                const loc_ix = this.map.locs.findIndex(l => l.toUpperCase() === locWithCoast.toUpperCase());
                const type_ix = Object.keys(this.map.unit_names).indexOf(unitType);
                if (loc_ix !== -1 && type_ix !== -1) {
                    const unit_hash_idx = (loc_ix * num_unit_types + type_ix) * num_powers + power_ix;
                    if(table['UNIT_TYPE'] && table['UNIT_TYPE'][unit_hash_idx]) new_hash ^= table['UNIT_TYPE'][unit_hash_idx];

                    if (locWithCoast.includes('/')) {
                         const coast_hash_idx = loc_ix * num_powers + power_ix;
                         if(table['COAST'] && table['COAST'][coast_hash_idx]) new_hash ^= table['COAST'][coast_hash_idx];
                    }
                }
            }
        }
        for (const powerName in this.current_state.centers) {
            const power_ix = power_indices[powerName] ?? unowned_idx;
            for (const sc_loc of this.current_state.centers[powerName]) {
                const loc_ix = this.map.locs.findIndex(l => l.toUpperCase().startsWith(sc_loc.toUpperCase()));
                if (loc_ix !== -1) {
                     const territory_hash_idx = loc_ix * num_powers + power_ix;
                     if(table['TERRITORY'] && table['TERRITORY'][territory_hash_idx]) new_hash ^= table['TERRITORY'][territory_hash_idx];
                }
            }
        }
        this.zobrist_hash = new_hash.toString(16).padStart(16, '0');
        return this.zobrist_hash;
    }

    get_hash(): string {
        return this.zobrist_hash;
    }

    update_hash(powerName: string, details: { unit_type?: string, loc?: string, is_dislodged?: boolean, is_center?: boolean, is_home?: boolean }): void {
        this.rebuild_hash();
    }

    _validate_status(reinit_powers = true): void {
        this.error = [];
        if (this.map.error.length > 0) {
            this.error.push(...this.map.error.map(e => `MapError: ${e}`));
        }
        if (reinit_powers && Object.keys(this.powers).length < 2 && this.map.powers.length >= 2) {
            this.error.push(errorUtils.GAME_NOT_ENOUGH_POWERS);
        }
    }

    _begin(): void {
        LOGGER.info(`Game ${this.game_id} is beginning.`);
        this.timestamp_last_played = Date.now();
    }

    _move_to_start_phase(): void {
        this.phase = this.map.phase || 'SPRING 1901 MOVEMENT';
        this.set_current_phase(this.phase);
    }

    _phase_abbr(phase?: string): string {
        return DiplomacyMap.get_phase_id(phase || this.phase, true);
    }

    get_current_phase(): string {
        return this.phase;
    }

    set_current_phase(new_phase: string): void {
        this.phase = new_phase.toUpperCase();
        const parts = this.phase.split(' ');
        if (parts.length === 3) {
            this.season = parts[0];
            this.year = parseInt(parts[1], 10);
            this.phase_type = parts[2] as PhaseTypeShort;
        } else {
            LOGGER.error(`Invalid phase format set: ${new_phase}`);
        }
    }

    add_rule(rule: Rule, active: boolean = true): void {
        if (active) {
            this.rules.add(rule);
        } else {
            this.rules.delete(rule);
        }
    }

    get_power(powerName: string): DiplomacyPower | undefined {
        return this.powers[powerName];
    }

    has_power(powerName: string): boolean {
        return powerName in this.powers;
    }

    get_units(powerName?: string): string[] | UnitPositions {
        const unitsSource = this.current_state.units;
        if (powerName) {
            return unitsSource[powerName] ? [...unitsSource[powerName]] : [];
        }
        return JSON.parse(JSON.stringify(unitsSource));
    }

    set_units(powerName: string, units: string[], reset = false): void {
        if (reset || !this.current_state.units[powerName]) {
            this.current_state.units[powerName] = [];
        }
        this.current_state.units[powerName] = [...new Set(units)];
        this._build_unit_owner_cache();
        this.rebuild_hash();
    }

    clear_units(powerName?: string): void {
        if (powerName) {
            delete this.current_state.units[powerName];
        } else {
            this.current_state.units = {};
        }
        this._build_unit_owner_cache();
        this.rebuild_hash();
    }

    get_centers(powerName?: string): string[] | CenterOwnership {
        const centersSource = this.current_state.centers;
        if (powerName) {
            return centersSource[powerName] ? [...centersSource[powerName]] : [];
        }
        return JSON.parse(JSON.stringify(centersSource));
    }

    set_centers(powerName: string, centers: string[], reset = false): void {
         if (reset || !this.current_state.centers[powerName]) {
            this.current_state.centers[powerName] = [];
        }
        this.current_state.centers[powerName] = [...new Set(centers)];
        this.rebuild_hash();
    }

    clear_centers(powerName?: string): void {
        if (powerName) {
            delete this.current_state.centers[powerName];
        } else {
            this.current_state.centers = {};
        }
        this.rebuild_hash();
    }

    clear_orders(powerName?: string): void {
        if (powerName) {
            if (this.orders[powerName]) delete this.orders[powerName];
            if (this.powers[powerName]) {
                this.powers[powerName].orders = [];
                this.powers[powerName].retreats = {};
                this.powers[powerName].adjustments = [];
            }
        } else {
            this.orders = {};
            for (const p in this.powers) {
                this.powers[p].orders = [];
                this.powers[p].retreats = {};
                this.powers[p].adjustments = [];
            }
        }
        this.parsed_orders = {}; // Clear parsed orders too
    }

    clear_cache(): void {
        this._unit_owner_cache = {};
    }

    _build_unit_owner_cache(): void {
        this._unit_owner_cache = {};
        for (const powerN in this.current_state.units) {
            for (const unitStr of this.current_state.units[powerN]) {
                const loc = unitStr.substring(2).toUpperCase();
                this._unit_owner_cache[loc] = powerN;
            }
        }
    }

    _unit_owner(unitLoc: string, coast_required = true): DiplomacyPower | null {
        const upperUnitLoc = unitLoc.toUpperCase();
        const cachedOwnerName = this._unit_owner_cache[upperUnitLoc];
        if (cachedOwnerName) return this.powers[cachedOwnerName] || null;

        for (const powerName in this.current_state.units) {
            for (const uStr of this.current_state.units[powerName]) {
                const locPart = uStr.substring(2).toUpperCase();
                if (coast_required) {
                    if (locPart === upperUnitLoc) return this.powers[powerName] || null;
                } else {
                    if (locPart.startsWith(upperUnitLoc.substring(0,3))) return this.powers[powerName] || null;
                }
            }
        }
        return null;
    }

    _occupant(site: string, any_coast = false): string | null {
        const upperSite = site.toUpperCase();
        for (const powerName in this.current_state.units) {
            for (const unitStr of this.current_state.units[powerName]) {
                const unitLoc = unitStr.substring(2).toUpperCase();
                if (any_coast && unitLoc.substring(0,3) === upperSite.substring(0,3)) {
                    return unitStr;
                }
                if (unitLoc === upperSite) {
                    return unitStr;
                }
            }
        }
        return null;
    }

    get_state(): any {
        return {
            game_id: this.game_id,
            map_name: this.map.name,
            phase: this.phase,
            rules: Array.from(this.rules),
            powers: Object.values(this.powers).map(p => p.to_json_object()),
            current_state: JSON.parse(JSON.stringify(this.current_state)),
            order_history: this.order_history.toJSON ? this.order_history.toJSON() : Object.fromEntries(this.order_history),
            result_history: this.result_history.toJSON ? this.result_history.toJSON() : Object.fromEntries(this.result_history),
            state_history: this.state_history.toJSON ? this.state_history.toJSON() : Object.fromEntries(this.state_history),
            // dislodged_history: this.dislodged_history.toJSON ? this.dislodged_history.toJSON() : Object.fromEntries(this.dislodged_history), // Assuming dislodged_history is SortedDict
            zobrist_hash: this.zobrist_hash,
            error: [...this.error],
            note: this.note,
            timestamp_created: this.timestamp_created,
            timestamp_last_played: this.timestamp_last_played,
            timestamp_last_saved: this.timestamp_last_saved,
        };
    }

    set_state(state: any, clear_history = true): void {
        this.game_id = state.game_id || this.game_id;
        if (state.map_name && this.map.name !== state.map_name) {
            this.map_name = state.map_name;
            this.map = new DiplomacyMap(this.map_name);
            DiplomacyGame.zobrist_tables[this.map.name] = {};
            this._build_hash_table();
        }
        this.phase = state.phase || this.map.phase;
        this.set_current_phase(this.phase);
        this.rules = new Set(state.rules || []);

        this.powers = {};
        if (state.powers && typeof state.powers === 'object') {
            for (const powerName in state.powers) { // If state.powers is an object from JSON
                 const power = new DiplomacyPower(powerName, this);
                 if (power.from_json_object && typeof state.powers[powerName] === 'object') {
                    power.from_json_object(state.powers[powerName], this);
                 }
                 this.powers[powerName] = power;
            }
        } else {
            for (const powerName of this.map.powers) {
                this.powers[powerName] = new DiplomacyPower(powerName, this);
            }
        }

        this.current_state = state.current_state ? JSON.parse(JSON.stringify(state.current_state))
                                               : { units: JSON.parse(JSON.stringify(this.map.units)), centers: JSON.parse(JSON.stringify(this.map.centers)), dislodged_units: {}, retreats: {} };

        if (clear_history) {
            this.order_history = new SortedDict();
            this.result_history = new SortedDict();
            this.state_history = new SortedDict();
            // this.dislodged_history = new SortedDict(); // dislodged_history was not on Game class in python
            this.extend_phase_history();
        } else {
            this.order_history = new SortedDict(state.order_history instanceof Map ? state.order_history : Object.entries(state.order_history || {}));
            this.result_history = new SortedDict(state.result_history instanceof Map ? state.result_history : Object.entries(state.result_history || {}));
            this.state_history = new SortedDict(state.state_history instanceof Map ? state.state_history : Object.entries(state.state_history || {}));
            // this.dislodged_history = new SortedDict(state.dislodged_history instanceof Map ? state.dislodged_history : Object.entries(state.dislodged_history || {}));
        }

        this.orders = {};
        this.results = {};
        this._adj_dislodged = {};
        this._captures = {};
        this._builds = {};

        this.zobrist_hash = state.zobrist_hash || this.rebuild_hash();
        this.error = state.error || [];
        this.note = state.note || '';
        this.timestamp_created = state.timestamp_created || this.timestamp_created;
        this.timestamp_last_played = state.timestamp_last_played || this.timestamp_created;
        this.timestamp_last_saved = state.timestamp_last_saved || 0;

        this.clear_cache();
        this.build_caches();
        this._validate_status(false);
    }

    extend_phase_history(): void {
        const phase_id = DiplomacyGame.get_phase_id(this.phase);
        if (!this.state_history.has(phase_id)) { // Avoid overwriting if set_state loaded history
            this.state_history.set(phase_id, JSON.parse(JSON.stringify(this.current_state)));
        }
        if (!this.order_history.has(phase_id)) {
             this.order_history.set(phase_id, JSON.parse(JSON.stringify(this.orders)));
        }
        if (!this.result_history.has(phase_id)) {
            this.result_history.set(phase_id, JSON.parse(JSON.stringify(this.results)));
        }
        // dislodged_history was not a direct Game property in Python, but part of phase data.
        // For now, let's assume it's managed if needed within current_state or results for the phase.
    }

    // --- Placeholder for complex methods ---
    process(): GamePhaseData | null { LOGGER.warn("_process not implemented"); return null; }

    // --- Adjudication Helper Stubs ---
    _strengths(): void { LOGGER.warn("_strengths not implemented"); this.combat = {}; }
    _bounce(loc: string): void { LOGGER.warn(`_bounce for ${loc} not implemented`); }
    _boing(loc: string): void {
        LOGGER.debug(`Game [BOING]: Iterative BOING resolution for ${loc}.`);
    }
    _unbounce(loc: string): void {
        LOGGER.debug(`Game [UNBOUNCE]: Iterative UNBOUNCE resolution for ${loc}.`);
    }
    _no_effect(loc: string): void {
        LOGGER.debug(`Game [NO_EFFECT]: Iterative NO_EFFECT resolution for ${loc}.`);
    }
    _cut_support(): void { LOGGER.warn("_cut_support not implemented"); this._adj_supports = {}; }
    _detect_paradox(): boolean {
        LOGGER.warn("_detect_paradox not fully implemented for resolution, only detection.");
        return false;
    }
    _check_disruptions(): void { LOGGER.warn("_check_disruptions not implemented"); this._adj_convoy_paths = {}; }
    _post_move_update(): void { LOGGER.warn("_post_move_update not implemented"); }
    _capture_centers(): void { LOGGER.warn("_capture_centers not implemented");}
    _transfer_center(sc_loc: string, new_owner_name: string | null): void { LOGGER.warn("_transfer_center not implemented");}


    // --- Retreat & Adjustment Phase Adjudication ---
    _other_results(): void {
        LOGGER.warn("_other_results not fully implemented");
        if (ADJUSTMENT_PHASES.includes(this.phase_type)) {
            this._determine_win({});
        }
    }


    // --- Phase Advancement & Win Conditions ---
    _advance_phase(): void {
        const next_phase_str = this._find_next_phase();
        if (next_phase_str) {
            this.set_current_phase(next_phase_str);
            this.clear_orders();
            this.results = {};
            this.current_state.dislodged_units = {};
            this.current_state.retreats = {};
            this._adj_dislodged = {};
            this._captures = {};
            this._builds = {};
        } else {
            LOGGER.error("Failed to advance phase, next phase undefined.");
            this.phase = GameStatus.ENDED;
        }
    }
    _check_phase(): boolean {
        const parts = this.phase.split(' ');
        return parts.length === 3 && !isNaN(parseInt(parts[1])) && ['SPRING', 'SUMMER', 'FALL', 'AUTUMN', 'WINTER'].includes(parts[0].toUpperCase()) && ALL_PHASES.map(p => p.toUpperCase()).includes(parts[2].toUpperCase());
    }
    _find_next_phase(): string { return this.map.find_next_phase(this.phase); }
    _find_previous_phase(): string { return this.map.find_previous_phase(this.phase); }

    _calculate_victory_score(): { [power_name: string]: number } {
        const scores: { [power_name: string]: number } = {};
        for (const power_name of this.map.powers) {
            scores[power_name] = (this.current_state.centers[power_name] || []).length;
        }
        return scores;
    }
    _determine_win(last_year_scores?: { [power: string]: number }): void {
        const scores = this._calculate_victory_score();
        const total_scs = this.map.scs.length;
        const solo_threshold = (this.map.victory && this.map.victory[0]) ? this.map.victory[0] : Math.floor(total_scs / 2) + 1;

        for (const power_name of this.map.powers) {
            if (scores[power_name] >= solo_threshold) {
                this._finish(power_name, scores);
                return;
            }
        }
    }
    _finish(winner: string | null, scores: { [key: string]: number }): void {
        this.phase = winner ? `${winner} WINS` : GameStatus.ENDED;
        if(!winner) this.note = "Game ended in a draw.";
        LOGGER.info(`Game: Finished. Winner: ${winner || 'Draw'}. Scores: ${JSON.stringify(scores)}`);
        this.results = { final_scores: scores, winner: winner, status: this.phase };
    }
    draw(scores: { [key: string]: number }): void {
        this._finish(null, scores);
    }

    get_status(): GameStatus {
        if (this.phase.includes("WINS") || this.phase === GameStatus.ENDED || this.phase === "HALTED") {
            return GameStatus.ENDED;
        }
        if (this.timestamp_created && Object.keys(this.powers).length === 0) {
            return GameStatus.FORMING;
        }
        return GameStatus.PLAYING;
    }
    // --- Order Management Methods (from Turn 15, to be integrated above or replace stubs) ---
    // [ ... code from Turn 15 for set_orders, _update_orders, _add_order etc. would be here ... ]
    // --- Core Order Validation (from Turn 15, to be integrated or replace stub) ---
    // [ ... code from Turn 15 for _valid_order, _default_orders would be here ... ]
    // --- Adjudication Core (from Turn 16, to be integrated or replace stubs) ---
    // [ ... code from Turn 16 for process, _determine_orders, _resolve etc. would be here ...]
    // --- Movement Phase Adjudication (from Turn 16, to be integrated or replace stubs) ---
    // [ ... code from Turn 16 for _move_results, _resolve_moves etc. would be here ...]
    // --- Convoy Helpers (from Turn 16, to be integrated or replace stubs) ---
    // [ ... _build_list_possible_convoys, etc. from Turn 16 ...]
    // --- Adjudication Helpers (from Turn 17 _strengths, _bounce, _boing) ---
    // [ ... code from Turn 17 for _strengths, _bounce, _boing (with updated _unbounce, _no_effect, _detect_paradox from Turn 21/22 attempts) ...]
    // --- Retreat & Adjustment Phase Adjudication (from Turn 16) ---
    // [ ... _other_results, _capture_centers, _transfer_center from Turn 16 ... ]

}

[end of diplomacy/engine/game.ts]
