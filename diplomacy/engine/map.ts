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
// pylint: disable=too-many-lines
/** Map
 *  - Contains the map object which represents a map where the game can be played
 */
import * as fs from 'fs';
import * as path from 'path';
// import { deepCopy } from 'deepcopy'; // Consider structuredClone or manual deep copy

// Stub/placeholder for diplomacy.settings
// In a real scenario, this would be in 'diplomacy/settings.ts'
interface DiplomacySettings {
    PACKAGE_DIR: string;
}
const settings: DiplomacySettings = {
    PACKAGE_DIR: path.resolve(__dirname, '../../'), // Adjust as needed
};

// Stub/placeholder for diplomacy.utils.KEYWORDS and ALIASES
// In a real scenario, this would be in 'diplomacy/utils/constants.ts' or similar
const KEYWORDS: { [key: string]: string } = { /* Populate with actual keywords */ };
const ALIASES: { [key: string]: string } = { /* Populate with actual aliases */ };

// Stub/placeholder for diplomacy.utils.errors
// In a real scenario, this would be in 'diplomacy/utils/errors.ts'
const err = {
    MAP_FILE_NOT_FOUND: 'MAP_FILE_NOT_FOUND: Map file "%s" not found.',
    MAP_LEAST_TWO_POWERS: 'MAP_LEAST_TWO_POWERS: Map must have at least two powers.',
    MAP_LOC_NOT_FOUND: 'MAP_LOC_NOT_FOUND: Location "%s" not found in loc_type.',
    MAP_SITE_ABUTS_TWICE: 'MAP_SITE_ABUTS_TWICE: Site "%s" abuts "%s" more than once.',
    MAP_NO_FULL_NAME: 'MAP_NO_FULL_NAME: No full name for "%s".',
    MAP_ONE_WAY_ADJ: 'MAP_ONE_WAY_ADJ: One-way adjacency for "%s" to "%s".',
    MAP_MISSING_ADJ: 'MAP_MISSING_ADJ: Missing adjacency for "%s" to "%s".',
    MAP_BAD_HOME: 'MAP_BAD_HOME: Bad home center "%s" for power "%s".',
    MAP_BAD_INITIAL_OWN_CENTER: 'MAP_BAD_INITIAL_OWN_CENTER: Bad initial own center "%s" for power "%s".',
    MAP_BAD_INITIAL_UNITS: 'MAP_BAD_INITIAL_UNITS: Bad initial unit "%s" for power "%s".',
    MAP_CENTER_MULT_OWNED: 'MAP_CENTER_MULT_OWNED: Center "%s" is owned by multiple powers.',
    MAP_BAD_PHASE: 'MAP_BAD_PHASE: Bad phase string "%s".',
    MAP_BAD_VICTORY_LINE: 'MAP_BAD_VICTORY_LINE: Bad VICTORY line.',
    MAP_BAD_ROOT_MAP_LINE: 'MAP_BAD_ROOT_MAP_LINE: Bad MAP line.',
    MAP_TWO_ROOT_MAPS: 'MAP_TWO_ROOT_MAPS: Two MAP directives found.',
    MAP_FILE_MULT_USED: 'MAP_FILE_MULT_USED: File "%s" used multiple times.',
    MAP_BAD_ALIASES_IN_FILE: 'MAP_BAD_ALIASES_IN_FILE: Bad alias in file: "%s".',
    MAP_BAD_RENAME_DIRECTIVE: 'MAP_BAD_RENAME_DIRECTIVE: Bad rename directive: "%s".',
    MAP_INVALID_LOC_ABBREV: 'MAP_INVALID_LOC_ABBREV: Invalid location abbreviation: "%s".',
    MAP_RENAME_NOT_SUPPORTED: 'MAP_RENAME_NOT_SUPPORTED: Rename directive is not supported.',
    MAP_LOC_RESERVED_KEYWORD: 'MAP_LOC_RESERVED_KEYWORD: Location name is a reserved keyword: "%s".',
    MAP_DUP_LOC_OR_POWER: 'MAP_DUP_LOC_OR_POWER: Duplicate location or power name: "%s".',
    MAP_DUP_ALIAS_OR_POWER: 'MAP_DUP_ALIAS_OR_POWER: Duplicate alias or power name: "%s".',
    MAP_OWNS_BEFORE_POWER: 'MAP_OWNS_BEFORE_POWER: "%s" directive before power definition: "%s".',
    MAP_INHABITS_BEFORE_POWER: 'MAP_INHABITS_BEFORE_POWER: INHABITS directive before power definition: "%s".',
    MAP_HOME_BEFORE_POWER: 'MAP_HOME_BEFORE_POWER: "%s" directive before power definition: "%s".',
    MAP_UNITS_BEFORE_POWER: 'MAP_UNITS_BEFORE_POWER: UNITS directive before power definition.',
    MAP_UNIT_BEFORE_POWER: 'MAP_UNIT_BEFORE_POWER: Unit definition before power definition.',
    MAP_INVALID_UNIT: 'MAP_INVALID_UNIT: Invalid unit definition: "%s".',
    MAP_DUMMY_REQ_LIST_POWERS: 'MAP_DUMMY_REQ_LIST_POWERS: DUMMIES directive requires a list of powers.',
    MAP_DUMMY_BEFORE_POWER: 'MAP_DUMMY_BEFORE_POWER: DUMMY directive before power definition.',
    MAP_NO_EXCEPT_AFTER_DUMMY_ALL: 'MAP_NO_EXCEPT_AFTER_DUMMY_ALL: No EXCEPT after DUMMY ALL in "%s".',
    MAP_NO_POWER_AFTER_DUMMY_ALL_EXCEPT: 'MAP_NO_POWER_AFTER_DUMMY_ALL_EXCEPT: No power after DUMMY ALL EXCEPT in "%s".',
    MAP_NO_DATA_TO_AMEND_FOR: 'MAP_NO_DATA_TO_AMEND_FOR: No data to amend for "%s".',
    MAP_NO_ABUTS_FOR: 'MAP_NO_ABUTS_FOR: No ABUTS for "%s".',
    MAP_UNPLAYED_BEFORE_POWER: 'MAP_UNPLAYED_BEFORE_POWER: UNPLAYED directive before power definition.',
    MAP_NO_EXCEPT_AFTER_UNPLAYED_ALL: 'MAP_NO_EXCEPT_AFTER_UNPLAYED_ALL: No EXCEPT after UNPLAYED ALL.',
    MAP_NO_POWER_AFTER_UNPLAYED_ALL_EXCEPT: 'MAP_NO_POWER_AFTER_UNPLAYED_ALL_EXCEPT: No power after UNPLAYED ALL EXCEPT.',
    MAP_NO_SUCH_POWER_TO_REMOVE: 'MAP_NO_SUCH_POWER_TO_REMOVE: No such power to remove: "%s".',
    MAP_RENAMING_UNOWNED_DIR_NOT_ALLOWED: 'MAP_RENAMING_UNOWNED_DIR_NOT_ALLOWED: Renaming UNOWNED directive not allowed.',
    MAP_RENAMING_UNDEF_POWER: 'MAP_RENAMING_UNDEF_POWER: Renaming undefined power: "%s".',
    MAP_RENAMING_POWER_NOT_SUPPORTED: 'MAP_RENAMING_POWER_NOT_SUPPORTED: Renaming power is not supported.',
    MAP_POWER_NAME_EMPTY_KEYWORD: 'MAP_POWER_NAME_EMPTY_KEYWORD: Power name is an empty keyword: "%s".',
    MAP_POWER_NAME_CAN_BE_CONFUSED: 'MAP_POWER_NAME_CAN_BE_CONFUSED: Power name can be confused: "%s".',
    MAP_ILLEGAL_POWER_ABBREV: 'MAP_ILLEGAL_POWER_ABBREV: Illegal power abbreviation.',
};

// Stub for diplomacy.utils.convoy_paths
// In a real scenario, this would be in 'diplomacy/utils/convoy_paths.ts'
interface ConvoyPathData { /* Define structure as needed */ }
interface ConvoyPathsCache {
    [mapName: string]: ConvoyPathData;
}
let CONVOYS_PATH_CACHE: ConvoyPathsCache = {}; // Initialize as empty
const get_convoy_paths_cache = (): ConvoyPathsCache => CONVOYS_PATH_CACHE;
const add_to_cache = (mapName: string): ConvoyPathData => {
    // This is a stub. In reality, it would load/calculate convoy paths.
    console.warn(`STUB: add_to_cache called for ${mapName}. No real data loaded.`);
    CONVOYS_PATH_CACHE[mapName] = {}; // Placeholder data
    return CONVOYS_PATH_CACHE[mapName];
};


// Constants
export const UNDETERMINED = 0;
export const POWER = 1;
export const UNIT = 2;
export const LOCATION = 3;
export const COAST = 4;
export const ORDER = 5;
export const MOVE_SEP = 6;
export const OTHER = 7;

const MAP_CACHE: { [key: string]: DiplomacyMap } = {};

export class DiplomacyMap {
    // Properties
    name: string;
    first_year: number;
    victory: number[] | null;
    phase: string | null;
    validated: boolean;
    flow_sign: number | null;
    root_map: string | null;
    abuts_cache: { [key: string]: number }; // Key: e.g., "A-PAR-S-MAR"
    homes: { [key: string]: string[] }; // PowerName: ['LOC1', 'LOC2']
    loc_name: { [key: string]: string }; // FullLocName: 'LOC'
    loc_type: { [key: string]: string }; // LOC: 'WATER' | 'COAST' | 'LAND' | 'PORT' | 'SHUT'
    loc_abut: { [key: string]: string[] }; // LOC: ['ADJ1', 'ADJ2']
    loc_coasts: { [key: string]: string[] }; // LOC_NO_COAST: ['LOC', 'LOC/EC', 'LOC/SC']
    own_word: { [key: string]: string }; // PowerName: 'ENGLISH'
    abbrev: { [key: string]: string }; // PowerName: 'E'
    centers: { [key: string]: string[] }; // PowerName: ['SC1', 'SC2']
    units: { [key: string]: string[] }; // PowerName: ['F BRE', 'A MAR']
    pow_name: { [key: string]: string }; // PowerNameInternal: 'PowerNameDisplay'
    rules: string[];
    files: string[];
    powers: string[]; // List of PowerNames
    scs: string[]; // List of all SCs
    owns: string[]; // List of powers with OWNS directive
    inhabits: string[]; // List of powers with INHABITS/HOME directive
    flow: string[]; // e.g., ['SPRING:MOVEMENT,RETREATS', ...]
    dummies: string[]; // List of dummy PowerNames
    locs: string[]; // List of all LOCs (with coasts)
    error: string[];
    seq: string[]; // e.g., ['NEWYEAR', 'SPRING MOVEMENT', ...]
    phase_abbrev: { [key: string]: string }; // 'M': 'MOVEMENT'
    unclear: { [key: string]: string }; // Alias: 'LOC' (for ambiguous places)
    unit_names: { [key: string]: string }; // 'A': 'ARMY'
    keywords: { [key: string]: string };
    aliases: { [key: string]: string };
    convoy_paths: ConvoyPathData;
    dest_with_coasts: { [key: string]: string[] }; // LOC: ['DEST1', 'DEST2/NC', ...]

    static getInstance(name: string = 'standard', use_cache: boolean = true): DiplomacyMap {
        if (use_cache && name in MAP_CACHE) {
            return MAP_CACHE[name];
        }
        return new DiplomacyMap(name, use_cache);
    }

    constructor(name: string = 'standard', use_cache: boolean = true) {
        if (use_cache && name in MAP_CACHE) {
            // This instance won't be used, the cached one will be returned by getInstance.
            // However, the constructor logic for a new instance needs to run if not in cache.
            // To prevent re-initialization if called directly without getInstance,
            // we check if this instance's name is already set (meaning it's being re-entered).
            if (this.name === name) return;
        }

        this.name = name;
        this.first_year = 1901;
        this.victory = null;
        this.phase = null;
        this.validated = false;
        this.flow_sign = null;
        this.root_map = null;
        this.abuts_cache = {};
        this.homes = {};
        this.loc_name = {};
        this.loc_type = {};
        this.loc_abut = {};
        this.loc_coasts = {};
        this.own_word = {};
        this.abbrev = {};
        this.centers = {};
        this.units = {};
        this.pow_name = {};
        this.rules = [];
        this.files = [];
        this.powers = [];
        this.scs = [];
        this.owns = [];
        this.inhabits = [];
        this.flow = [];
        this.dummies = [];
        this.locs = [];
        this.error = [];
        this.seq = [];
        this.phase_abbrev = {};
        this.unclear = {};
        this.dest_with_coasts = {};
        this.unit_names = { 'A': 'ARMY', 'F': 'FLEET' };
        this.keywords = { ...KEYWORDS }; // Shallow copy
        this.aliases = { ...ALIASES };   // Shallow copy

        this.load();
        // build_cache() and validate() are called at the end of the constructor
        // after all properties from load() are set.
        // However, some methods called BY load() (like norm(), norm_power()) or
        // by validate() (like abuts(), is_valid_unit()) might implicitly expect parts of the cache
        // or certain properties to be in a preliminary state.
        // The Python code calls load(), then build_cache(), then validate().
        // Let's ensure this order is reflected.
        // The current constructor calls load(), then build_cache(), then validate(). This is correct.

        if (use_cache) {
            if (!(name in CONVOYS_PATH_CACHE)) {
                add_to_cache(name);
            }
            this.convoy_paths = CONVOYS_PATH_CACHE[name] || {}; // Ensure convoy_paths is set
            MAP_CACHE[name] = this;
        } else {
            this.convoy_paths = CONVOYS_PATH_CACHE[name] || add_to_cache(name); // Ensure convoy_paths is set
        }
    }

    public deepCopy(): DiplomacyMap {
        const newMap = new DiplomacyMap(this.name, false); // Create new instance, don't use cache for the copy

        // Deep copy properties. Using JSON.parse(JSON.stringify()) for most complex objects.
        // For properties that are simple values or shallowly copied in constructor, direct assignment or spread is fine.
        newMap.first_year = this.first_year;
        newMap.victory = this.victory ? [...this.victory] : null;
        newMap.phase = this.phase;
        newMap.validated = this.validated; // This will be re-validated if necessary, but copy current state.
        newMap.flow_sign = this.flow_sign;
        newMap.root_map = this.root_map;

        newMap.abuts_cache = JSON.parse(JSON.stringify(this.abuts_cache));
        newMap.homes = JSON.parse(JSON.stringify(this.homes));
        newMap.loc_name = JSON.parse(JSON.stringify(this.loc_name));
        newMap.loc_type = JSON.parse(JSON.stringify(this.loc_type));
        newMap.loc_abut = JSON.parse(JSON.stringify(this.loc_abut));
        newMap.loc_coasts = JSON.parse(JSON.stringify(this.loc_coasts));
        newMap.own_word = JSON.parse(JSON.stringify(this.own_word));
        newMap.abbrev = JSON.parse(JSON.stringify(this.abbrev));
        newMap.centers = JSON.parse(JSON.stringify(this.centers));
        newMap.units = JSON.parse(JSON.stringify(this.units));
        newMap.pow_name = JSON.parse(JSON.stringify(this.pow_name));

        newMap.rules = [...this.rules];
        newMap.files = [...this.files];
        newMap.powers = [...this.powers];
        newMap.scs = [...this.scs];
        newMap.owns = [...this.owns];
        newMap.inhabits = [...this.inhabits];
        newMap.flow = [...this.flow];
        newMap.dummies = [...this.dummies];
        newMap.locs = [...this.locs];
        newMap.error = [...this.error]; // Errors are specific to instance, copy them.
        newMap.seq = [...this.seq];
        newMap.phase_abbrev = JSON.parse(JSON.stringify(this.phase_abbrev));
        newMap.unclear = JSON.parse(JSON.stringify(this.unclear));
        newMap.unit_names = JSON.parse(JSON.stringify(this.unit_names)); // Though typically static

        newMap.keywords = JSON.parse(JSON.stringify(this.keywords)); // Copied from global KEYWORDS initially
        newMap.aliases = JSON.parse(JSON.stringify(this.aliases));   // Copied from global ALIASES initially

        newMap.convoy_paths = JSON.parse(JSON.stringify(this.convoy_paths));
        newMap.dest_with_coasts = JSON.parse(JSON.stringify(this.dest_with_coasts));

        // After copying all data, the new map instance might need its caches rebuilt
        // if they depend on instance-specific computations not covered by simple JSON copy.
        // However, build_cache and validate are part of the constructor for newMap if `use_cache` is false.
        // The `new DiplomacyMap(this.name, false)` call would have handled this.
        // If any post-constructor modifications were made to the original that affect caches,
        // those would need explicit handling here or a re-run of cache building.
        // For this direct translation, assuming constructor handles it for the new instance.

        return newMap;
    }


    public toString(): string {
        return this.name;
    }

    get svg_path(): string | null {
        const fileNames = [this.name + '.svg', (this.root_map || '') + '.svg'];
        for (const fileName of fileNames) {
            if (!fileName.endsWith('.svg') || fileName === '.svg') continue;
            const svgPath = path.join(settings.PACKAGE_DIR, 'maps', 'svg', fileName);
            if (fs.existsSync(svgPath)) {
                return svgPath;
            }
        }
        return null;
    }


    public load(fileName?: string): void {
        let currentPower: string | null = null;
        const mapFileName = fileName || (this.name.endsWith('.map') ? this.name : `${this.name}.map`);

        let filePath: string;
        if (fs.existsSync(mapFileName)) {
            filePath = mapFileName;
        } else {
            filePath = path.join(settings.PACKAGE_DIR, 'maps', mapFileName);
        }

        if (!fs.existsSync(filePath)) {
            this.error.push(err.MAP_FILE_NOT_FOUND.replace('%s', mapFileName));
            return;
        }

        this.files.push(mapFileName);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split(/\r?\n/);


        for (const line of lines) {
            const words = line.trim().split(/\s+/).filter(w => w); // Filter out empty strings from multiple spaces
            if (!words[0] || words[0].startsWith('#')) {
                continue;
            }
            const upword = words[0].toUpperCase();

            // VICTORY
            if (upword === 'VICTORY') {
                try {
                    this.victory = words.slice(1).map(Number);
                    if (this.victory.some(isNaN)) throw new Error("Invalid number in VICTORY line");
                } catch {
                    this.error.push(err.MAP_BAD_VICTORY_LINE);
                }
            }
            // USE, USES, MAP
            else if (['USE', 'USES', 'MAP'].includes(upword)) {
                if (upword === 'MAP') {
                    if (words.length !== 2) {
                        this.error.push(err.MAP_BAD_ROOT_MAP_LINE);
                    } else if (this.root_map) {
                        this.error.push(err.MAP_TWO_ROOT_MAPS);
                    } else {
                        this.root_map = words[1].split('.')[0];
                    }
                }
                for (let new_file of words.slice(1)) {
                    if (!new_file.includes('.')) {
                        new_file = `${new_file}.map`;
                    }
                    if (!this.files.includes(new_file)) {
                        this.load(new_file);
                    } else {
                        this.error.push(err.MAP_FILE_MULT_USED.replace('%s', new_file));
                    }
                }
            }
            // BEGIN
            else if (upword === 'BEGIN') {
                this.phase = words.slice(1).join(' ').toUpperCase();
            }
            // RULE, RULES
            else if (['RULE', 'RULES'].includes(upword)) {
                this.rules.push(...line.toUpperCase().trim().split(/\s+/).slice(1));
            }
            // Aliases: [oldAbbrev ->] placeName = abbreviation alias...
            else if (line.includes('=')) {
                const lineParts = line.split('=', 2); // Split only on the first '='
                const namePart = lineParts[0].trim();
                const aliasPart = lineParts[1].trim();

                const alias_words = aliasPart.split(/\s+/).filter(w => w);
                if (!alias_words.length) { // Abbreviation must be present
                    this.error.push(err.MAP_BAD_ALIASES_IN_FILE.replace('%s', line));
                    continue;
                }

                let old_name_str: string | null = null;
                let name_str = namePart.toUpperCase(); // name (LHS of =) should be uppercased for processing

                const renameParts = namePart.split('->').map(p => p.trim());
                if (renameParts.length === 2) {
                    old_name_str = renameParts[0].toUpperCase();
                    name_str = renameParts[1].toUpperCase();
                } else if (renameParts.length > 2) {
                    this.error.push(err.MAP_BAD_RENAME_DIRECTIVE.replace('%s', namePart));
                }

                const mainAbbrev = alias_words[0].toUpperCase(); // Abbreviation should be uppercase

                // Validate abbreviation format
                if (!/^[A-Z0-9]+$/i.test(mainAbbrev) || mainAbbrev !== this.norm(mainAbbrev).replace(/ /g, '')) {
                     // The second check (mainAbbrev !== this.norm(mainAbbrev)...) might be too strict
                     // if norm() itself changes valid short abbrevs. The Python version is `word[0] != self.norm(word[0]).replace(' ', '')`
                     // For now, basic alphanumeric check.
                     if (!/^[A-Z0-9]+$/i.test(mainAbbrev)) { // Check if it's simple alphanumeric
                        this.error.push(err.MAP_INVALID_LOC_ABBREV.replace('%s', alias_words[0]));
                     }
                }


                if (old_name_str) {
                    this.error.push(err.MAP_RENAME_NOT_SUPPORTED);
                }

                const normed_name = this.norm(name_str);
                if (this.keywords[name_str.toUpperCase()]) { // Check against original case of keyword too if keywords are mixed case
                    this.error.push(err.MAP_LOC_RESERVED_KEYWORD.replace('%s', name_str));
                }
                // Use mainAbbrev for loc_name value as it's the primary abbreviation
                if (this.loc_name[name_str] || (this.aliases[normed_name] && this.aliases[normed_name] !== mainAbbrev) ) {
                    this.error.push(err.MAP_DUP_LOC_OR_POWER.replace('%s', name_str));
                }
                this.loc_name[name_str] = mainAbbrev;
                this.aliases[normed_name] = mainAbbrev;

                for (const alias of alias_words.slice(1)) {
                    if (!alias) continue;
                    const is_unclear = alias.endsWith('?');
                    let current_alias_norm_target = alias;
                    if(is_unclear) current_alias_norm_target = alias.slice(0,-1);

                    const normed_alias = is_unclear ? current_alias_norm_target.replace(/\+/g, ' ').toUpperCase() : this.norm(current_alias_norm_target);
                    if (is_unclear) {
                        this.unclear[normed_alias] = mainAbbrev;
                    } else if (this.aliases[normed_alias]) {
                        if (this.aliases[normed_alias] !== mainAbbrev) {
                            this.error.push(err.MAP_DUP_ALIAS_OR_POWER.replace('%s', alias));
                        }
                    } else {
                        this.aliases[normed_alias] = mainAbbrev;
                    }
                }
            }
            // OWNS, CENTERS
            else if (['OWNS', 'CENTERS'].includes(upword)) {
                if (!currentPower) {
                    this.error.push(err.MAP_OWNS_BEFORE_POWER.replace('%s', upword).replace('%s', words.join(' ')));
                } else {
                    if (!this.owns.includes(currentPower)) {
                        this.owns.push(currentPower);
                    }
                    const centersToAdd = line.trim().toUpperCase().split(/\s+/).slice(1).filter(w=>w);
                    if (upword === 'CENTERS' || !this.centers[currentPower]) {
                        this.centers[currentPower] = centersToAdd;
                    } else {
                        this.centers[currentPower].push(...centersToAdd.filter(c => !this.centers[currentPower].includes(c)));
                    }
                }
            }
            // INHABITS
            else if (upword === 'INHABITS') {
                if (!currentPower) {
                    this.error.push(err.MAP_INHABITS_BEFORE_POWER.replace('%s', words.join(' ')));
                } else {
                    const reinit = !this.inhabits.includes(currentPower);
                    if (reinit) {
                        // Python adds to inhabits here. If add_homes re-adds, it could be duplicated.
                        // Let's ensure it's added only once.
                         if(!this.inhabits.includes(currentPower)) this.inhabits.push(currentPower);
                    }
                    this.add_homes(currentPower, words.slice(1), reinit);
                }
            }
            // HOME, HOMES
            else if (['HOME', 'HOMES'].includes(upword)) {
                if (!currentPower) {
                    this.error.push(err.MAP_HOME_BEFORE_POWER.replace('%s', upword).replace('%s', words.join(' ')));
                } else {
                    if (!this.inhabits.includes(currentPower)) {
                        this.inhabits.push(currentPower);
                    }
                    this.add_homes(currentPower, words.slice(1), true); // True for reinit
                }
            }
            // UNITS
            else if (upword === 'UNITS') {
                if (currentPower) {
                    this.units[currentPower] = [];
                } else {
                    this.error.push(err.MAP_UNITS_BEFORE_POWER);
                }
            }
            // Unit Designation (A or F)
            else if (['A', 'F'].includes(upword)) { // words[0] is 'A' or 'F'
                const unitFullString = words.join(' ').toUpperCase();
                if (!currentPower) {
                    this.error.push(err.MAP_UNIT_BEFORE_POWER);
                } else if (words.length === 2) { // e.g. A PAR, F BRE
                    const unitLocAbbrev = words[1].toUpperCase().substring(0,3);
                    for (const powerName in this.units) { // Remove unit if it exists under another power or current
                        this.units[powerName] = this.units[powerName].filter(current_unit => current_unit.split(/\s+/)[1].substring(0,3) !== unitLocAbbrev);
                    }
                    this.units[currentPower] = this.units[currentPower] || [];
                    this.units[currentPower].push(unitFullString);
                } else {
                    this.error.push(err.MAP_INVALID_UNIT.replace('%s', unitFullString));
                }
            }
            // DUMMY, DUMMIES
            else if (['DUMMY', 'DUMMIES'].includes(upword)) {
                const dummyAllIndex = words.map(w => w.toUpperCase()).indexOf('ALL');
                if (dummyAllIndex > 0) { // Contains ALL
                    currentPower = null; // DUMMY ALL affects global list, not current power context
                    const exceptIndex = words.map(w => w.toUpperCase()).indexOf('EXCEPT');
                    if (exceptIndex > 0 && exceptIndex < dummyAllIndex) { // EXCEPT must be after ALL
                         this.error.push(err.MAP_NO_EXCEPT_AFTER_DUMMY_ALL.replace('%s', upword));
                    } else if (exceptIndex > 0) { // DUMMY ALL EXCEPT ...
                        if (words.length === exceptIndex + 1) { // No powers after EXCEPT
                            this.error.push(err.MAP_NO_POWER_AFTER_DUMMY_ALL_EXCEPT.replace('%s', upword));
                        } else {
                            const exceptPowers = words.slice(exceptIndex + 1).map(ep => this.norm_power(ep));
                            this.dummies = Object.keys(this.homes).filter(p => p !== 'UNOWNED' && !exceptPowers.includes(p));
                        }
                    } else { // DUMMY ALL (no EXCEPT)
                         this.dummies = Object.keys(this.homes).filter(p => p !== 'UNOWNED');
                    }
                } else if (words.length > 1) { // DUMMY powerName powerName... OR DUMMIES powerName...
                     const dummiesToAdd = words.slice(1).map(p => this.norm_power(p));
                     this.dummies.push(...dummiesToAdd.filter(d => !this.dummies.includes(d) && d !== 'UNOWNED'));
                     if (upword === 'DUMMIES' || (upword === 'DUMMY' && words.length > 1)) currentPower = null;
                } else if (upword === 'DUMMY') { // DUMMY (applies to currentPower)
                    if (!currentPower || currentPower === 'UNOWNED') { // Cannot make UNOWNED a dummy, or DUMMY before power
                        this.error.push(err.MAP_DUMMY_BEFORE_POWER);
                    } else if (!this.dummies.includes(currentPower)) {
                        this.dummies.push(currentPower);
                    }
                } else { // DUMMIES (with no arguments)
                     this.error.push(err.MAP_DUMMY_REQ_LIST_POWERS);
                }
            }
            // DROP
            else if (upword === 'DROP') {
                for (const place of words.slice(1).map(loc => loc.toUpperCase())) {
                    this.drop(place);
                }
            }
            // Terrain type and adjacencies
            else if (words.length > 1 && ['AMEND', 'WATER', 'LAND', 'COAST', 'PORT', 'SHUT'].includes(upword)) {
                const place = words[1]; // Mixed case from file
                const placeUpper = place.toUpperCase();
                const placeLower = place.toLowerCase();

                // If amending, and place is 'spa', but map has 'SPA' and 'SPA/NC', this needs care.
                // Python: `other = word[1].swapcase()`. If `place` is `spa`, `other` is `SPA`.
                // This logic seems to handle changing the case of a province, e.g. from spa (army) to SPA (sea).
                // For now, we assume `place` is the definitive key to work with.
                const otherCasePlace = place === placeUpper ? placeLower : placeUpper;

                if (this.locs.includes(otherCasePlace)) {
                    this.locs = this.locs.filter(l => l !== otherCasePlace);
                    if (upword === 'AMEND') {
                        if(this.loc_type[otherCasePlace]) this.loc_type[place] = this.loc_type[otherCasePlace];
                        if(this.loc_abut[otherCasePlace]) this.loc_abut[place] = [...this.loc_abut[otherCasePlace]];
                    }
                    delete this.loc_type[otherCasePlace];
                    delete this.loc_abut[otherCasePlace];
                    // If original was SPA (uppercase) and we are redefining it (e.g. as spa), drop all SPA/* coasts
                    if (place === placeLower && otherCasePlace === placeUpper) {
                         Object.keys(this.loc_type).filter(k => k.startsWith(placeUpper + "/")).forEach(k => this.drop(k));
                    }
                }
                this.locs = this.locs.filter(l => l !== place);

                this.locs.push(place);
                if (upword !== 'AMEND') {
                    this.loc_type[place] = upword;
                    this.loc_abut[place] = this.loc_abut[place] || []; // Ensure abut list exists if we are defining terrain
                } else if (!this.loc_type[place]) { // AMENDing a place not yet defined
                     this.error.push(err.MAP_NO_DATA_TO_AMEND_FOR.replace('%s', place));
                }

                if (words.length > 2 && words[2].toUpperCase() !== 'ABUTS') {
                    this.error.push(err.MAP_NO_ABUTS_FOR.replace('%s', place));
                }

                if (words.length > 3 && words[2].toUpperCase() === 'ABUTS') {
                    this.loc_abut[place] = this.loc_abut[place] || [];
                    for (const dest of words.slice(3)) {
                        if (dest.startsWith('-')) {
                            const destToRemove = dest.substring(1).toUpperCase();
                            this.loc_abut[place] = this.loc_abut[place].filter(site => !site.toUpperCase().startsWith(destToRemove));
                        } else {
                            if (!this.loc_abut[place].includes(dest)) { // Add if not already present
                                this.loc_abut[place].push(dest);
                            }
                        }
                    }
                }
            }
            // UNPLAYED
            else if (upword === 'UNPLAYED') {
                let goners: string[] = [];
                const unplayedAllIndex = words.map(w => w.toUpperCase()).indexOf('ALL');

                if (unplayedAllIndex > 0) { // UNPLAYED ... ALL ...
                     currentPower = null; // Global effect
                     const exceptIndex = words.map(w => w.toUpperCase()).indexOf('EXCEPT');
                     if (exceptIndex > 0 && exceptIndex < unplayedAllIndex) {
                         this.error.push(err.MAP_NO_EXCEPT_AFTER_UNPLAYED_ALL);
                     } else if (exceptIndex > 0) { // UNPLAYED ALL EXCEPT ...
                         if (words.length === exceptIndex + 1) {
                             this.error.push(err.MAP_NO_POWER_AFTER_UNPLAYED_ALL_EXCEPT);
                         } else {
                             const exceptPowers = words.slice(exceptIndex + 1).map(ep => this.norm_power(ep));
                             goners = Object.keys(this.homes).filter(p => p !== 'UNOWNED' && !exceptPowers.includes(p));
                         }
                     } else { // UNPLAYED ALL
                          goners = Object.keys(this.homes).filter(p => p !== 'UNOWNED');
                     }
                } else if (words.length > 1) { // UNPLAYED powerName powerName...
                    goners = words.slice(1).map(p => this.norm_power(p));
                    currentPower = null;
                } else { // UNPLAYED (applies to currentPower context)
                    if (!currentPower || currentPower === "UNOWNED") {
                        this.error.push(err.MAP_UNPLAYED_BEFORE_POWER);
                    } else {
                        goners = [currentPower];
                    }
                }

                for (const goner of goners) {
                    if (goner === "UNOWNED") continue; // Cannot make UNOWNED unplayed
                    if (!this.pow_name[goner] && !Object.values(this.pow_name).map(v=>v.toUpperCase()).includes(goner)) {
                        this.error.push(err.MAP_NO_SUCH_POWER_TO_REMOVE.replace('%s', goner));
                        continue;
                    }
                    // Find the canonical power name if 'goner' is an alias or different casing
                    const canonicalGoner = Object.keys(this.pow_name).find(pn => pn.toUpperCase() === goner) || goner;

                    delete this.pow_name[canonicalGoner];
                    delete this.own_word[canonicalGoner];
                    delete this.homes[canonicalGoner];
                    this.dummies = this.dummies.filter(d => d !== canonicalGoner);
                    this.inhabits = this.inhabits.filter(i => i !== canonicalGoner);
                    delete this.centers[canonicalGoner];
                    this.owns = this.owns.filter(o => o !== canonicalGoner);
                    delete this.abbrev[canonicalGoner];
                    delete this.units[canonicalGoner];
                    this.powers = this.powers.filter(p => p !== canonicalGoner);
                }
                 if (goners.length > 0) currentPower = null;
            }
            // Power definition or Unowned/Neutral
            else {
                let powerNameFromFile = words[0]; // Original case from file
                let effectiveCurrentPower: string; // Normalized version for internal use

                if (upword === 'NEUTRAL' || upword === 'CENTERS') {
                    effectiveCurrentPower = 'UNOWNED';
                    powerNameFromFile = 'UNOWNED'; // Standardize for displayPowerName later
                } else {
                    effectiveCurrentPower = this.norm_power(upword);
                }
                currentPower = effectiveCurrentPower; // Set current power context

                if (words.length > 2 && words[1] === '->') { // Power renaming
                    this.error.push(err.MAP_RENAMING_POWER_NOT_SUPPORTED);
                    // Skip robustly: treat as if the part before "->" was the power.
                    // Or adjust words array and re-evaluate powerNameFromFile & effectiveCurrentPower
                    // For now, largely ignoring rename as per error.
                    powerNameFromFile = words[2];
                    effectiveCurrentPower = this.norm_power(words[2].toUpperCase());
                    currentPower = effectiveCurrentPower;
                    words = [words[0], ...words.slice(2)];
                }

                const displayPowerName = (effectiveCurrentPower === 'UNOWNED') ? 'UNOWNED' : powerNameFromFile;

                if (effectiveCurrentPower !== 'UNOWNED' && !this.pow_name[effectiveCurrentPower]) {
                    this.pow_name[effectiveCurrentPower] = powerNameFromFile; // Store original casing
                    const normedForAlias = this.norm(effectiveCurrentPower);
                    if (!normedForAlias) {
                        this.error.push(err.MAP_POWER_NAME_EMPTY_KEYWORD.replace('%s', effectiveCurrentPower));
                    } else {
                        if (!this.aliases[normedForAlias] || this.aliases[normedForAlias] === effectiveCurrentPower) {
                            // Potential for MAP_POWER_NAME_CAN_BE_CONFUSED, simplified for now
                            this.aliases[normedForAlias] = effectiveCurrentPower;
                        } else if (this.aliases[normedForAlias] !== effectiveCurrentPower) {
                            this.error.push(err.MAP_DUP_LOC_OR_POWER.replace('%s', normedForAlias));
                        }
                    }
                }

                this.own_word[displayPowerName] = this.own_word[displayPowerName] || displayPowerName; // Default own_word

                if (words.length > 1 && words[1].startsWith('(')) {
                    let ownWordPart = words[1].substring(1, words[1].length - 1);
                    let abbrevPart: string | undefined = undefined;

                    if (ownWordPart.includes(':')) {
                        [ownWordPart, abbrevPart] = ownWordPart.split(':', 2);
                    }

                    this.own_word[displayPowerName] = ownWordPart || displayPowerName;
                    const normedOwnWord = this.norm(this.own_word[displayPowerName]);

                    if (normedOwnWord !== displayPowerName && normedOwnWord !== effectiveCurrentPower.toUpperCase()) {
                        if (!this.aliases[normedOwnWord]) {
                            this.aliases[normedOwnWord] = effectiveCurrentPower; // Alias points to normed power
                        } else if (this.aliases[normedOwnWord] !== effectiveCurrentPower) {
                            this.error.push(err.MAP_DUP_LOC_OR_POWER.replace('%s', normedOwnWord));
                        }
                    }

                    if (abbrevPart !== undefined && effectiveCurrentPower !== 'UNOWNED') {
                        this.abbrev[effectiveCurrentPower] = abbrevPart.substring(0, 1).toUpperCase();
                        if (!abbrevPart || ['M', '?'].includes(this.abbrev[effectiveCurrentPower])) {
                            this.error.push(err.MAP_ILLEGAL_POWER_ABBREV);
                        }
                    }
                    words.splice(1, 1);
                }

                // Add homes
                if (currentPower) { // currentPower is already effectiveCurrentPower
                    // Python: reinit = upword in self.inhabits; if reinit: self.inhabits.remove(upword)
                    // This seems to mean if it's already in inhabits, it's a re-initialization of homes.
                    // However, the 'HOME'/'HOMES' directive *always* reinitializes.
                    // The 'INHABITS' directive adds to existing homes unless it's the first time.
                    // Power definition lines (this 'else' block) also define homes.
                    // Let's assume for a power definition line, it's an initial definition, so reinit=true.
                    // If currentPower was 'UNOWNED', displayPowerName is 'UNOWNED'.
                    let isFirstTimeDefiningHomesForPower = !this.inhabits.includes(displayPowerName);
                    if (isFirstTimeDefiningHomesForPower && displayPowerName !== 'UNOWNED') {
                         this.inhabits.push(displayPowerName);
                    }
                    // For power definition lines, it's treated as a full definition, so reinit is true.
                    this.add_homes(displayPowerName, words.slice(1), true);
                }
            }
        }
    }

    public validate(force: boolean = false): void {
        if (!force && this.validated) {
            return;
        }
        this.validated = true;

        // Root map
        this.root_map = this.root_map || this.name;

        // Validating powers (those with homes, excluding UNOWNED)
        this.powers = Object.keys(this.homes).filter(power_name => power_name !== 'UNOWNED' && (this.pow_name[power_name] || Object.values(this.pow_name).includes(power_name)));
        this.powers.sort();
        if (this.powers.length < 2) {
            this.error.push(err.MAP_LEAST_TWO_POWERS);
        }

        // Validating area type for all loc_name values (abbreviations)
        for (const place_abbrev of Object.values(this.loc_name)) {
            const isPowerAbbrev = Object.values(this.pow_name).some(p => this.norm(p) === place_abbrev) || this.powers.includes(place_abbrev);
            if (isPowerAbbrev) continue;
            if (!this.area_type(place_abbrev)) { // area_type uses loc_type which uses map-defined casings
                this.error.push(err.MAP_LOC_NOT_FOUND.replace('%s', place_abbrev));
            }
        }


        // Validating adjacencies
        for (const placeEntry of Object.entries(this.loc_abut)) {
            const place = placeEntry[0]; // This is the key from loc_abut, e.g. "spa", "SPA/NC"
            const abuts = placeEntry[1];
            const up_abuts = abuts.map(loc => loc.toUpperCase());

            for (const abut of abuts) {
                const up_abut = abut.toUpperCase();
                if (up_abuts.filter(ua => ua === up_abut).length > 1) {
                    this.error.push(err.MAP_SITE_ABUTS_TWICE.replace('%s', place.toUpperCase()).replace('%s', up_abut));
                }
            }

            // Check if 'place' (from loc_abut key) corresponds to a defined location in loc_name
            // loc_name keys are full names, values are abbrevs. loc_abut keys are abbrevs/map-keys.
            const placeIsDefined = Object.values(this.loc_name).includes(place) || // direct abbrev match
                                 Object.values(this.loc_name).includes(place.toUpperCase()) || // case variation
                                 this.loc_type[place]; // or has a type definition directly
            if (!placeIsDefined) {
                 this.error.push(err.MAP_NO_FULL_NAME.replace('%s', place));
            }


            // Checking one-way adjacency (defer if abuts_cache not built, as abuts() relies on it)
            if (Object.keys(this.abuts_cache).length > 0) { // Only run if cache is available
                for (const loc of abuts) { // loc is an adjacent area, could be mixed case
                    if (this.area_type(place) !== 'SHUT' &&
                        this.area_type(loc) !== 'SHUT' &&
                        !this.abuts('A', loc, '-', place) &&
                        !this.abuts('F', loc, '-', place) &&
                        !(place === place.toLowerCase() && this.area_type(loc) === 'WATER')) { // lower case place (e.g. 'spa') to WATER is ok one-way
                        this.error.push(err.MAP_ONE_WAY_ADJ.replace('%s', place).replace('%s', loc));
                    }
                }
            }

            // Loc without coasts (e.g. 'spa' on the standard map)
            if (place !== place.toLowerCase() || place.includes('/')) {
                continue;
            }

            const adj_water_locs = new Set<string>();
            // find_coasts expects uppercase base, e.g. SPA. 'place' here is like 'spa'.
            for (const coast_loc of this.find_coasts(place.toUpperCase())) {
                if (coast_loc.toUpperCase() === place.toUpperCase()) {
                    continue;
                }
                if (this.loc_abut[coast_loc]) { // coast_loc is e.g. SPA/NC
                    this.loc_abut[coast_loc].forEach(adj => { // adj is an area adjacent to SPA/NC
                        if (this.area_type(adj) === 'WATER') {
                            adj_water_locs.add(adj.toUpperCase());
                        }
                    });
                }
            }
            // up_abuts are from place ('spa'). Check if they include all water locs adjacent to its specific coasts.
            const missing_water_locs = [...adj_water_locs].filter(water_loc => !up_abuts.includes(water_loc.toUpperCase()));
            for (const water_loc of missing_water_locs) {
                this.error.push(err.MAP_MISSING_ADJ.replace('%s', place).replace('%s', water_loc));
            }
        }

        // Validating home centers
        for (const power_name_key in this.homes) { // Iterate over keys of homes (normed power names)
            if (power_name_key === 'UNOWNED') continue;
             // Find original casing for error messages if possible, else use key
            const displayPowerName = Object.keys(this.pow_name).find(k => this.norm_power(k) === power_name_key) || power_name_key;
            for (const site of this.homes[power_name_key]) { // site is an SC abbrev
                if (!this.scs.includes(site.toUpperCase())) { // SCs list should be uppercase
                    this.scs.push(site.toUpperCase());
                }
                if (!this.area_type(site)) {
                    this.error.push(err.MAP_BAD_HOME.replace('%s', displayPowerName).replace('%s', site));
                }
                if (this.homes['UNOWNED'] && this.homes['UNOWNED'].map(s=>s.toUpperCase()).includes(site.toUpperCase())) {
                    this.homes['UNOWNED'] = this.homes['UNOWNED'].filter(s => s.toUpperCase() !== site.toUpperCase());
                }
            }
        }

        // Valid supply centers from 'centers' directive
        for (const power_name_key in this.centers) {
            if (power_name_key === 'UNOWNED') continue;
            const displayPowerName = Object.keys(this.pow_name).find(k => this.norm_power(k) === power_name_key) || power_name_key;
            for (const center of this.centers[power_name_key]) { // center is an SC abbrev
                if (!this.scs.includes(center.toUpperCase())) {
                    this.scs.push(center.toUpperCase());
                }
                if (!this.area_type(center)) { // area_type checks loc_type
                     this.error.push(err.MAP_BAD_INITIAL_OWN_CENTER.replace('%s', displayPowerName).replace('%s', center));
                }
            }
        }
        this.scs = [...new Set(this.scs.map(s => s.toUpperCase()))];


        // Validating initial units and default centers if no OWNS
        for (const power_name of this.powers) { // this.powers contains normed names
            const displayPowerName = Object.keys(this.pow_name).find(k => this.norm_power(k) === power_name) || power_name;
            if (!this.owns.includes(power_name)) { // Check if normed power name is in owns
                this.centers[power_name] = [...(this.homes[power_name] || [])];
                (this.homes[power_name] || []).forEach(homeSC => {
                    if (!this.scs.includes(homeSC.toUpperCase())) this.scs.push(homeSC.toUpperCase());
                });
            }
            (this.units[power_name] || []).forEach(unit_string => { // unit_string is "A PAR"
                if (!this.is_valid_unit(unit_string)) { // is_valid_unit expects "A PAR"
                    this.error.push(err.MAP_BAD_INITIAL_UNITS.replace('%s', displayPowerName).replace('%s', unit_string));
                }
            });
        }
        this.scs = [...new Set(this.scs.map(s => s.toUpperCase()))];


        // Checking for multiple owners of centers
        const centerOwnership: { [center: string]: string[] } = {};
        for (const power_name_key in this.centers) { // normed power names
            if (power_name_key === 'UNOWNED') continue;
            const displayPowerName = Object.keys(this.pow_name).find(k => this.norm_power(k) === power_name_key) || power_name_key;
            for (const site of this.centers[power_name_key]) { // site is SC abbrev
                const siteUpper = site.toUpperCase();
                centerOwnership[siteUpper] = centerOwnership[siteUpper] || [];
                if(!centerOwnership[siteUpper].includes(displayPowerName)) {
                    centerOwnership[siteUpper].push(displayPowerName);
                }
            }
        }
        for(const site in centerOwnership){
            if(centerOwnership[site].length > 1){
                this.error.push(err.MAP_CENTER_MULT_OWNED.replace('%s', site) + ` (Owned by: ${centerOwnership[site].join(', ')})`);
            }
        }

        if (this.homes['UNOWNED']) {
            this.homes['UNOWNED'] = this.homes['UNOWNED'].filter(unownedSiteUpper => {
                return !this.powers.some(pwrKey => (this.homes[pwrKey] || []).map(s=>s.toUpperCase()).includes(unownedSiteUpper.toUpperCase()));
            });
            if (this.homes['UNOWNED'].length === 0) {
                delete this.homes['UNOWNED'];
            }
        }


        // Default flow, sequence, phase_abbrev (Python code always sets these in validate)
        this.flow = ['SPRING:MOVEMENT,RETREATS', 'FALL:MOVEMENT,RETREATS', 'WINTER:ADJUSTMENTS'];
        this.flow_sign = 1;
        this.seq = ['NEWYEAR', 'SPRING MOVEMENT', 'SPRING RETREATS', 'FALL MOVEMENT', 'FALL RETREATS', 'WINTER ADJUSTMENTS'];
        this.phase_abbrev = { 'M': 'MOVEMENT', 'R': 'RETREATS', 'A': 'ADJUSTMENTS' };

        // Validating initial game phase (this.phase is set by load() or default)
        this.phase = this.phase || 'SPRING 1901 MOVEMENT';
        const phaseParts = this.phase.split(/\s+/);
        if (phaseParts.length !== 3) {
            this.error.push(err.MAP_BAD_PHASE.replace('%s', this.phase));
        } else {
            const year = parseInt(phaseParts[1], 10);
            if (isNaN(year) || String(year).length > 4) { // Basic year format check
                this.error.push(err.MAP_BAD_PHASE.replace('%s', this.phase) + ` (Invalid year: ${phaseParts[1]})`);
            } else {
                this.first_year = year;
                 // Check season and type from seq
                const phaseKey = `${phaseParts[0].toUpperCase()} ${phaseParts[2].toUpperCase()}`;
                if (!this.seq.includes(phaseKey) && phaseKey !== "NEWYEAR YEAR") { // NEWYEAR YEAR is not a typical start
                    this.error.push(err.MAP_BAD_PHASE.replace('%s', this.phase) + ` (Unknown season/type: ${phaseKey})`);
                }
            }
        }
    }

    public build_cache(): void {
        // Adding all coasts to loc_coasts
        const allLocsFromMapFile = [...new Set(this.locs.map(l => l.toUpperCase()))]; // Unique uppercase locs from file
        const allPossibleLocAbbrs = [...new Set(Object.values(this.loc_name).map(v => v.toUpperCase()))]; // Unique abbrevs from loc_name
        const combinedLocList = [...new Set([...allLocsFromMapFile, ...allPossibleLocAbbrs])];


        for (const loc of combinedLocList) {
            const baseLoc = loc.substring(0, 3);
            // Populate loc_coasts: value should be all map-defined locs (from this.locs) that start with baseLoc
            this.loc_coasts[baseLoc] = this.locs.filter(map_loc_original_case => map_loc_original_case.toUpperCase().startsWith(baseLoc));
            // Ensure the baseLoc itself is in if it's a defined loc_type (e.g. Paris 'PAR' for 'PAR')
            if (this.loc_type[baseLoc] && !this.loc_coasts[baseLoc].includes(baseLoc)) {
                 // This needs to be careful not to add 'SPA' if only 'SPA/NC' and 'SPA/SC' are actual locs in this.locs.
                 // The python version: self.loc_coasts[loc.upper()] = [map_loc.upper() for map_loc in self.locs if loc.upper()[:3] == map_loc.upper()[:3]]
                 // This implies key is full loc (e.g. SPA/NC), value is list like [SPA/NC, SPA/SC].
                 // Let's stick to: key is base (SPA), value is [SPA, SPA/NC, SPA/SC] if all exist in this.locs.
            }
        }
        // Re-do loc_coasts based on python's simpler model:
        // For each loc L (e.g. 'BUL', 'BUL/EC', 'BUL/SC') in this.locs,
        // the key in loc_coasts is L.upper(), and the value is a list of all M in this.locs
        // where M.upper() starts with L.upper()[:3].
        // This means loc_coasts['BUL/EC'] = ['BUL','BUL/EC','BUL/SC'] (if they exist and are distinct in this.locs)
        // And loc_coasts['BUL'] = ['BUL','BUL/EC','BUL/SC']
        // This seems more aligned with the Python version.
        this.loc_coasts = {}; // Reset
        const uniqueLocsUpper = [...new Set(this.locs.map(l => l.toUpperCase()))];
        for (const loc_key_upper of uniqueLocsUpper) {
            const baseKey = loc_key_upper.substring(0,3);
            this.loc_coasts[loc_key_upper] = uniqueLocsUpper.filter(map_loc => map_loc.startsWith(baseKey));
        }
        // And for any lowercase locs like 'spa'
        for (const loc_raw of this.locs) { // Iterate raw locs to preserve casing for keys if needed by other logic
            if (loc_raw === loc_raw.toLowerCase() && loc_raw.length === 3) { // e.g. 'spa'
                const baseKey = loc_raw.toUpperCase(); // 'SPA'
                 if (this.loc_coasts[baseKey] && !this.loc_coasts[loc_raw]) { // If SPA has coasts, spa should point to them too
                    this.loc_coasts[loc_raw] = this.loc_coasts[baseKey];
                }
            }
        }


        // Building abuts cache
        const allMapLocsForAbutsCache = [...new Set(this.locs.map(l => l.toUpperCase()))];

        for (const unit_type of ['A', 'F']) {
            for (const unit_loc of allMapLocsForAbutsCache) {
                for (const other_loc of allMapLocsForAbutsCache) {
                    for (const order_type of ['-', 'S', 'C']) {
                        const queryTupleKey = `${unit_type}-${unit_loc}-${order_type}-${other_loc}`;
                        this.abuts_cache[queryTupleKey] = this._abuts(unit_type, unit_loc, order_type, other_loc);
                    }
                }
            }
        }

        // Building dest_with_coasts
        for (const loc_upper of allMapLocsForAbutsCache) {
            const dest_1_hops_mixed_case = this.abut_list(loc_upper, true); // abut_list input can be upper
            let destinations_with_their_coasts: string[] = [];
            for (const dest_hop_mixed_case of dest_1_hops_mixed_case) {
                // find_coasts expects an uppercase location (base or with coast)
                // and returns all its variants (e.g. 'SPA', 'SPA/NC', 'SPA/SC') from this.loc_coasts
                destinations_with_their_coasts.push(...this.find_coasts(dest_hop_mixed_case.toUpperCase()));
            }
            this.dest_with_coasts[loc_upper] = [...new Set(destinations_with_their_coasts)];
        }
    }

    public add_homes(power: string, homesToAdd: string[], reinit: boolean): void {
        // power is displayPowerName (original casing from map file, or 'UNOWNED')
        // homesToAdd are original casing from map file.
        const powerKey = (power === 'UNOWNED') ? 'UNOWNED' : this.norm_power(power); // Use normed for internal keys

        this.homes[powerKey] = this.homes[powerKey] || [];
        this.homes['UNOWNED'] = this.homes['UNOWNED'] || [];

        if (reinit) {
            if (powerKey !== 'UNOWNED' && this.homes[powerKey]) {
                 this.homes[powerKey].forEach(h => { // h is original casing from map file
                    if (!this.homes['UNOWNED'].map(uo => uo.toUpperCase()).includes(h.toUpperCase())) {
                         this.homes['UNOWNED'].push(h);
                    }
                 });
            }
            this.homes[powerKey] = [];
        }

        const currentHomesProcessed = homesToAdd.join(' ').split(/\s+/).filter(w=>w);

        for (let home_map_case of currentHomesProcessed) {
            if (!home_map_case) continue;
            let remove = false;
            while (home_map_case.startsWith('-')) {
                remove = true;
                home_map_case = home_map_case.substring(1);
            }
            if (!home_map_case) continue;
            const homeUpper = home_map_case.toUpperCase(); // Compare and store SCs consistently (uppercase)

            // Remove from the current powerKey's homes if it exists (case-insensitive check)
            this.homes[powerKey] = this.homes[powerKey].filter(h => h.toUpperCase() !== homeUpper);

            if (powerKey !== 'UNOWNED') {
                this.homes['UNOWNED'] = this.homes['UNOWNED'].filter(h => h.toUpperCase() !== homeUpper);
            }

            if (!remove) {
                if (!this.homes[powerKey].map(h=>h.toUpperCase()).includes(homeUpper)) {
                    this.homes[powerKey].push(home_map_case); // Store with original casing from map
                }
            } else { // remove flag is true
                if (powerKey !== 'UNOWNED' && !this.homes['UNOWNED'].map(h=>h.toUpperCase()).includes(homeUpper)) {
                   let stillOwnedByOther = false;
                   for(const p_key in this.homes) {
                       if (p_key !== powerKey && p_key !== 'UNOWNED' && this.homes[p_key].map(h=>h.toUpperCase()).includes(homeUpper)) {
                           stillOwnedByOther = true;
                           break;
                       }
                   }
                   if(!stillOwnedByOther) this.homes['UNOWNED'].push(home_map_case); // Store with original casing
                }
            }
        }
    }

    public drop(place: string): void { // place is uppercase
        const upperPlace = place.toUpperCase();

        this.locs = this.locs.filter(loc => !loc.toUpperCase().startsWith(upperPlace));

        for (const fullName in this.loc_name) {
            if (this.loc_name[fullName].toUpperCase().startsWith(upperPlace)) {
                delete this.loc_name[fullName];
            }
        }

        for (const alias in this.aliases) {
            if (this.aliases[alias].toUpperCase().startsWith(upperPlace)) {
                delete this.aliases[alias];
            }
        }

        for (const powerNameKey in this.homes) { // powerNameKey is normed
            this.homes[powerNameKey] = this.homes[powerNameKey].filter(home => !home.toUpperCase().startsWith(upperPlace));
        }

        for (const powerNameKey in this.units) { // powerNameKey is normed
            this.units[powerNameKey] = this.units[powerNameKey].filter(unit_string => {
                const unitLoc = unit_string.split(/\s+/)[1];
                return !unitLoc.toUpperCase().startsWith(upperPlace);
            });
        }

        this.scs = this.scs.filter(sc => !sc.toUpperCase().startsWith(upperPlace)); // scs are stored upper

        for (const powerNameKey in this.centers) { // powerNameKey is normed
            this.centers[powerNameKey] = this.centers[powerNameKey].filter(center => !center.toUpperCase().startsWith(upperPlace));
        }

        for (const siteNameKey in this.loc_abut) { // siteNameKey is map-casing
            this.loc_abut[siteNameKey] = this.loc_abut[siteNameKey].filter(abut => !abut.toUpperCase().startsWith(upperPlace));
            if (siteNameKey.toUpperCase().startsWith(upperPlace)) {
                delete this.loc_abut[siteNameKey];
            }
        }
        // Second pass for keys that might have been missed if their casing was different but started with place
        Object.keys(this.loc_abut).filter(k => k.toUpperCase().startsWith(upperPlace)).forEach(k => delete this.loc_abut[k]);


        for (const locKey in this.loc_type) { // locKey is map-casing
            if (locKey.toUpperCase().startsWith(upperPlace)) {
                delete this.loc_type[locKey];
            }
        }
         Object.keys(this.loc_type).filter(k => k.toUpperCase().startsWith(upperPlace)).forEach(k => delete this.loc_type[k]);
    }

    public norm_power(power: string): string {
        return this.norm(power).replace(/ /g, '');
    }

    public norm(phrase: string): string {
        let normalizedPhrase = phrase.toUpperCase();
        normalizedPhrase = normalizedPhrase.replace(/\//g, ' /'); // Add space around /
        normalizedPhrase = normalizedPhrase.replace(/ \/ /g, '/'); // Remove space if it's ' / '

        // Replace specific punctuation with space
        for (const token of '.:-+,') {
            normalizedPhrase = normalizedPhrase.replace(new RegExp(`\\${token}`, 'g'), ' ');
        }
        // Add spaces around other special tokens
        for (const token of '|*?!~()[]=_^') {
            normalizedPhrase = normalizedPhrase.replace(new RegExp(`\\${token}`, 'g'), ` ${token} `);
        }

        // Replace keywords and collapse multiple spaces
        return normalizedPhrase.trim().split(/\s+/).map(keyword => this.keywords[keyword] || keyword).join(' ');
    }

    public compact(phrase: string): string[] {
        let processedPhrase = phrase;
        if (phrase.includes(':')) {
            const indexColon = phrase.indexOf(':');
            const firstPart = phrase.substring(0, indexColon);
            // Try to vet the first part as a power. If it is, remove it.
            const vettedFirstPart = this.vet(this.compact(firstPart)); // compact first to get single words
            if (vettedFirstPart.length === 1 && vettedFirstPart[0][1] === POWER) {
                processedPhrase = phrase.substring(indexColon + 1);
            }
        }

        const normedWords = this.norm(processedPhrase).split(/\s+/).filter(w => w);
        const result: string[] = [];
        let i = 0;
        while (i < normedWords.length) {
            const [aliasFound, consumedCount] = this.alias(normedWords.slice(i));
            if (aliasFound) {
                result.push(...aliasFound.split(/\s+/).filter(w => w)); // Alias might be multi-word itself
            }
            i += consumedCount;
        }
        return result;
    }

    public alias(words: string[]): [string | null, number] {
        // Process content inside square or round brackets first
        if (words.length > 0 && (words[0] === '(' || words[0] === '[')) {
            const openBracket = words[0];
            const closeBracket = openBracket === '(' ? ')' : ']';
            let bracketEndIndex = -1;
            for (let j = 1; j < words.length; j++) {
                if (words[j] === closeBracket) {
                    bracketEndIndex = j;
                    break;
                }
            }

            if (bracketEndIndex === -1) return [words[0], 1]; // Unclosed bracket, consume only bracket
            if (bracketEndIndex === 1) return ['', 2]; // Empty brackets like () or []

            const contentWords = words.slice(1, bracketEndIndex);
            // Python: `if word[1] + word[j - 1] == '**': word2 = word[2:j - 1]`
            // This seems to handle a specific "**" case not directly obvious. Assuming it's for specific map syntax.
            // For now, process content as is.

            // Check if the content is an alias ending with '\' (DAIDE notation for exact phrase)
            const contentKeyWithSlash = contentWords.join(' ') + ' \\';
            if (this.aliases[contentKeyWithSlash]) {
                 return [this.aliases[contentKeyWithSlash].slice(0,-2), bracketEndIndex + 1];
            }

            // Recursively compact content within brackets
            const compactedContent: string[] = [];
            let k = 0;
            while (k < contentWords.length) {
                const [aliasFound, consumedCount] = this.alias(contentWords.slice(k));
                if (aliasFound) compactedContent.push(...aliasFound.split(/\s+/).filter(w=>w));
                k += consumedCount;
            }
            return [compactedContent.join(' '), bracketEndIndex + 1];
        }

        // Try to match the longest possible sequence of words against aliases
        for (let i = words.length; i > 0; i--) {
            const key = words.slice(0, i).join(' ');
            if (this.aliases[key]) {
                let alias = this.aliases[key];
                // Handle coast concatenation: if alias is loc and next part is /COAST
                if (i < words.length) {
                    const nextWord = words[i];
                    if (nextWord.startsWith('/') && alias[0] !== '/' && !alias.includes(' ')) {
                        // Potential coast: alias is LOC, nextWord is /SC
                        const combinedKey = alias + ' ' + nextWord; // e.g. "BUL /SC"
                        if (this.aliases[combinedKey]) {
                            return [this.aliases[combinedKey], i + 1];
                        }
                        // If not combined, just return the alias + coast
                        return [this._resolve_unclear(alias) + nextWord, i + 1];
                    }
                }
                 // Handle `LOC \` followed by `/COAST` from DAIDE
                if (alias.endsWith(' \\') && i < words.length && words[i].startsWith('/')) {
                     // alias is `LOC \`, words[i] is `/COAST`
                     // This should not happen if `LOC /COAST` is an alias itself.
                     // This case seems to be: `LOC \` is an alias, and it's followed by a separate /COAST token.
                     // The python code: `alias, alias2 = alias2, alias[:-2]` which swaps them.
                     // This implies `alias2` was `words[i]` (the /COAST part).
                     // This is confusing. Let's assume `LOC /COAST` is preferred if it exists.
                }

                return [this._resolve_unclear(alias), i];
            }
        }

        // No alias found for the first word, consume one word
        // Concatenate if current is LOC and next is /COAST and not handled above
        if (words.length > 1 && words[0][0] !== '/' && !words[0].includes(' ') && words[1].startsWith('/')) {
             const combined = words[0] + words[1];
             // Check if this combined form is an alias itself
             if (this.aliases[combined]) return [this.aliases[combined], 2];
             return [this._resolve_unclear(words[0]) + words[1], 2];
        }

        return [this._resolve_unclear(words[0]), 1];
    }

    private _resolve_unclear(alias: string): string {
        // Check if alias is a power name that's also an unclear location
        // this.powers contains normed power names. this.unclear keys are usually full names.
        // Need to check against this.pow_name values (display names) or this.norm(power_key)
        const normedAlias = this.norm(alias);
        if (this.unclear[normedAlias] && (this.powers.includes(normedAlias) || Object.values(this.pow_name).includes(alias))) {
             return this.unclear[normedAlias];
        }
        return alias;
    }

    public vet(word_list: string[], strict: boolean = false): [string, number][] {
        const result: [string, number][] = [];
        for (const thing of word_list) {
            let data_type: number;
            if (thing.includes(' ')) { // Should not happen if compact() and alias() did their job
                data_type = UNDETERMINED;
            } else if (thing.length === 1) {
                if (this.unit_names[thing.toUpperCase()]) data_type = UNIT;
                else if (/[A-Z0-9]/i.test(thing)) data_type = ORDER; // More robustly, check against known orders
                else if ('-=_^'.includes(thing)) data_type = MOVE_SEP;
                else data_type = OTHER;
            } else if (thing.includes('/')) {
                // If it's like 'SPA/NC' (3 chars before /), it's a COAST.
                // Otherwise, it could be a power like 'AUSTRIA/HUNGARY' (normed to AUSTRIA / HUNGARY)
                if (thing.indexOf('/') === 3 && thing.length > 3) data_type = COAST;
                else data_type = POWER; // Or UNDETERMINED if not a known power pattern
            } else if (thing === 'VIA') { // 'VIA' is an ORDER token
                data_type = ORDER;
            } else if (thing.length === 3 && /^[A-Z]{3}$/i.test(thing)) { // Standard 3-letter location
                data_type = LOCATION;
            } else { // Longer than 3, no slash, not VIA -> likely a POWER name
                data_type = POWER;
            }

            if (strict) {
                // Check if 'thing' is a known alias value (abbrev) or keyword value
                const isKnownValue = Object.values(this.aliases).includes(thing) ||
                                     Object.values(this.keywords).includes(thing) ||
                                     Object.values(this.loc_name).includes(thing); // Check against map abbreviations
                if (!isKnownValue) {
                     // Also check if it's a power name (normed or display)
                    const isPower = this.powers.includes(this.norm(thing)) || Object.values(this.pow_name).includes(thing);
                    if(!isPower) data_type = -data_type; // Mark as unrecognized by negating
                }
            }
            result.push([thing, data_type]);
        }
        return result;
    }

    public rearrange(vetted_words_input: [string, number][]): string[] {
        // Add dummy tokens at start and end
        const result: [string, number][] = [['|', OTHER], ...vetted_words_input, ['|', OTHER]];

        // Remove result tokens (OTHER type) at start and end, but keep the '|'
        if (result.length > 2) result[0] = ['|', UNDETERMINED]; // Mark as undetermined for now
        while (result.length > 2 && result[result.length - 2][1] === OTHER) {
            result.splice(result.length - 2, 1);
        }
        if (result.length === 2) return []; // Only [UNDET, OTHER] left

        result[0] = ['|', OTHER]; // Restore first pipe to OTHER
        while (result.length > 1 && result[1][1] === OTHER) { // Remove OTHERs at beginning (after first pipe)
            result.splice(1, 1);
        }
        if (result.length <= 2) return [];


        // Process '?' (with unit and location)
        let foundWith = false;
        for (let i = 0; i < result.length; i++) {
            if (result[i][0] === '?' && result[i][1] === OTHER) {
                result.splice(i, 1); // Remove '?'
                if (foundWith) { i--; continue; } // Only process first '?' block

                let endOfWithBlock = i;
                for (let j = i; j < result.length; j++) {
                    if (result[j][1] === POWER || result[j][1] === UNIT) continue;
                    if (result[j][1] === LOCATION || result[j][1] === COAST) {
                        endOfWithBlock = j + 1; continue;
                    }
                    endOfWithBlock = j; // Found something else
                    break;
                }

                if (endOfWithBlock > i) { // Found unit/loc after '?'
                    foundWith = true;
                    const withBlock = result.splice(i, endOfWithBlock - i);
                    // Find insertion point (after initial power/unit, before first loc/order)
                    let k = 1;
                    for (; k < i; k++) {
                        if (result[k][1] !== POWER && result[k][1] !== UNIT) break;
                    }
                    result.splice(k, 0, ...withBlock);
                    i = k + withBlock.length -1; // Adjust current index
                } else {
                    i--; // Adjust index as '?' was removed
                }
            }
        }

        // Process '\' (from location)
        for (let i = 0; i < result.length; i++) {
            if (result[i][0] === '\\' && result[i][1] === OTHER) {
                result.splice(i, 1); // Remove '\'
                if (i >= result.length || (result[i][1] !== LOCATION && result[i][1] !== COAST)) { i--; continue; }

                const fromLocToken = result.splice(i, 1)[0];
                let j = i - 1;
                for (; j >= 0; j--) {
                    if (result[j][1] !== LOCATION && result[j][1] !== COAST && result[j][0] !== '~') break;
                }
                result.splice(j + 1, 0, fromLocToken);
                // No i adjustment needed as splice shifts, loop will re-evaluate next
            }
        }

        // Process '~' (via locations)
        for (let i = 0; i < result.length; i++) {
            if (result[i][0] === '~' && result[i][1] === OTHER) {
                result.splice(i, 1); // Remove '~'
                if (i >= result.length || (result[i][1] !== LOCATION && result[i][1] !== COAST) ||
                    i < 2 || (result[i-1][1] !== LOCATION && result[i-1][1] !== COAST) ||
                             (result[i-2][1] !== LOCATION && result[i-2][1] !== COAST)) {
                     i--; continue; // Not enough locations for via, or malformed
                }

                // Find end of via block
                let endOfViaBlock = i + 1;
                for (let j = i + 1; j < result.length; j++) {
                    if (result[j][1] !== LOCATION && result[j][1] !== COAST) {
                        endOfViaBlock = j;
                        break;
                    }
                    endOfViaBlock = j + 1;
                }
                const viaLocs = result.splice(i, endOfViaBlock - i);
                // Insert viaLocs between the two preceding locations. Original python: result[j:j] = result[i-1:i]
                // This seems to move the location *before* the via block after the via block.
                // Example: A PAR ~ MAR BUR - LYON  => A PAR - MAR BUR - LYON (if MAR BUR are via)
                // Python: result[j:j] = result[i-1:i]; del result[i-1]
                // This means: Take LOC_BEFORE_TILDE. Splice it AT END_OF_VIA_LOCS. Delete LOC_BEFORE_TILDE from original spot.
                // If A B C ~ D E F, where C is loc before ~, D E F are via.
                // New block: A B D E F C
                if (viaLocs.length > 0 && i > 0) { // i is now start of viaLocs original position
                    const locBeforeVia = result.splice(i-1, 1)[0]; // remove C
                    result.splice(i -1 + viaLocs.length, 0, locBeforeVia); // insert C after viaLocs
                    i = i -1 + viaLocs.length + 1 -1; // Adjust index
                } else {
                     i--; // Adjust index
                }
            }
        }

        // Move order token beyond first location block
        let orderTokenIndex = -1;
        for (let j = 1; j < result.length; j++) { // Start after initial '|'
            if (result[j][1] === LOCATION || result[j][1] === COAST) {
                if (orderTokenIndex !== -1) {
                    const orderToken = result.splice(orderTokenIndex, 1)[0];
                    result.splice(j + (j > orderTokenIndex ? 0 : 1), 0, orderToken); // Insert after current loc block
                }
                break; // Done after first loc block
            } else if (result[j][1] === ORDER) {
                orderTokenIndex = j;
            } else if (result[j][0] === '|') { // End of interpretable sequence
                break;
            }
        }

        // Power before unit, or resolve ambiguity if power is also an unclear location
        let unitEncountered = false;
        let orderEncounteredAfterUnit = false;
        for (let i = 1; i < result.length -1; i++) { // Iterate within '|' delimiters
            if (result[i][1] === ORDER) orderEncounteredAfterUnit = unitEncountered;

            if (result[i][1] === POWER) {
                if (unitEncountered && !orderEncounteredAfterUnit && this.unclear[result[i][0]]) {
                    result[i] = [this.unclear[result[i][0]], LOCATION]; // Resolve to location
                } else if (unitEncountered && !orderEncounteredAfterUnit && i > 1 && result[i-1][1] === UNIT) {
                     // Swap Power and Unit: [Unit, Power] -> [Power, Unit]
                    const temp = result[i-1];
                    result[i-1] = result[i];
                    result[i] = temp;
                }
                unitEncountered = false; // Reset after power, or if power resolved to loc
                if(result[i][1] === POWER) orderEncounteredAfterUnit = false;

            } else if (result[i][1] === UNIT) {
                unitEncountered = true;
                orderEncounteredAfterUnit = false;
            }
        }


        // Insert hyphens between subsequent locations
        for (let i = result.length - 2; i > 1; i--) { // Work backwards, stop before first two items
            if ((result[i][1] === LOCATION || result[i][1] === COAST) &&
                (result[i-1][1] === LOCATION || result[i-1][1] === COAST)) {
                result.splice(i, 0, ['-', MOVE_SEP]);
            }
        }

        // Remove '|' delimiters and return only the string part of tuples
        return result.slice(1, -1).map(item => item[0]);
    }

    public area_type(loc: string): string | undefined {
        // loc can be mixed case from map file, or already normalized.
        // loc_type keys are typically as defined in map (can be mixed).
        return this.loc_type[loc] || this.loc_type[loc.toUpperCase()] || this.loc_type[loc.toLowerCase()];
    }

    public default_coast(word: string[]): string[] {
        // word: ['F', 'GRE', '-', 'BUL']
        if (word.length === 4 && word[0].toUpperCase() === 'F' && word[2] === '-' && !word[3].includes('/')) {
            const unit_loc_upper = word[1].toUpperCase();
            const new_loc_upper = word[3].toUpperCase();
            let single_coast_candidate: string | null = null;

            // Iterate over coasts/adjacencies of unit_loc
            for (const place_abut_mixed of this.abut_list(unit_loc_upper)) { // abut_list input can be upper
                const place_abut_upper = place_abut_mixed.toUpperCase(); // e.g. BUL or BUL/SC

                if (new_loc_upper === place_abut_upper) { // Target is BUL, found BUL (no coast specified in abutment)
                    return word; // Original query is correct, no specific coast needed or determinable
                }
                if (place_abut_upper.startsWith(new_loc_upper + "/")) { // Found a specific coast like BUL/SC
                    if (single_coast_candidate) { // Already found one, now it's ambiguous
                        return word; // Cannot decide, return original
                    }
                    single_coast_candidate = place_abut_mixed; // Store the mixed-case specific coast
                }
            }
            if (single_coast_candidate) {
                return [word[0], word[1], word[2], single_coast_candidate];
            }
        }
        return word;
    }

    public find_coasts(loc: string): string[] {
        // Assumes loc_coasts is populated by build_cache()
        // loc is expected to be an uppercase 3-char base, e.g., "SPA"
        return this.loc_coasts[loc.toUpperCase().substring(0,3)] || [loc.toUpperCase()]; // Default to self if not in loc_coasts
    }

    public abuts(unit_type: string, unit_loc: string, order_type: string, other_loc: string): number {
        const unitLocUpper = unit_loc.toUpperCase();
        const otherLocUpper = other_loc.toUpperCase();

        if (unit_type === '?') {
            const keyA = `A-${unitLocUpper}-${order_type}-${otherLocUpper}`;
            const keyF = `F-${unitLocUpper}-${order_type}-${otherLocUpper}`;
            return (this.abuts_cache[keyA] || 0) || (this.abuts_cache[keyF] || 0);
        }

        const queryTupleKey = `${unit_type}-${unitLocUpper}-${order_type}-${otherLocUpper}`;
        return this.abuts_cache[queryTupleKey] || 0;
    }

    private _abuts(unit_type: string, unit_loc: string, order_type: string, other_loc: string): number {
        // unit_loc and other_loc are expected to be uppercase here from build_cache context
        // In Python, they are uppercased at the start of the method.

        if (!this.is_valid_unit(`${unit_type} ${unit_loc}`)) {
            return 0;
        }

        let effective_other_loc = other_loc;
        if (other_loc.includes('/')) {
            if (order_type === 'S') { // Support can target the main province
                effective_other_loc = other_loc.substring(0, 3);
            } else if (unit_type === 'A') { // Armies cannot interact with specific coasts directly for move/convoy
                return 0;
            }
        }

        let place_found_in_abut_list: string | undefined = undefined;
        // abut_list returns mixed-case entries from map file.
        // We need to compare with effective_other_loc (which is uppercase).
        for (const place_from_list of this.abut_list(unit_loc)) { // unit_loc might be 'SPA' or 'SPA/NC'
            const up_place_from_list = place_from_list.toUpperCase(); // e.g. 'MAR' or 'SPA/SC'
            const up_loc_base_from_list = up_place_from_list.substring(0, 3); // e.g. 'MAR' or 'SPA'

            if (effective_other_loc === up_place_from_list || effective_other_loc === up_loc_base_from_list) {
                place_found_in_abut_list = place_from_list; // Store the original mixed-case for later checks
                break;
            }
        }

        if (!place_found_in_abut_list) {
            return 0;
        }

        const other_loc_type = this.area_type(effective_other_loc); // Use effective_other_loc
        if (other_loc_type === 'SHUT') {
            return 0;
        }

        if (unit_type === '?') { // Should have been handled by is_valid_unit, but as a safeguard
            return 1;
        }

        if (unit_type === 'F') {
            // Fleets cannot affect LAND.
            // Python: `place[0] != up_loc[0]` means mixed case like `Bal` vs `BAL`.
            // `other_loc not in self.loc_type` implies `other_loc` is a coast like `spa` (lowercase) not in `loc_type` keys.
            // This means a fleet cannot move to a lowercase-defined coast (which are army-only passages).
            if (other_loc_type === 'LAND' ||
                (place_found_in_abut_list !== place_found_in_abut_list.toUpperCase() && place_found_in_abut_list !== place_found_in_abut_list.toLowerCase()) || // Mixed case like 'Bal'
                (order_type !== 'S' && !this.loc_type[effective_other_loc.toUpperCase()] && this.loc_type[effective_other_loc.toLowerCase()]) // Target is a lowercase only loc like 'spa'
            ) {
                return 0;
            }
        } else if (unit_type === 'A') {
            // Armies cannot move to water (unless convoy, handled by caller).
            // Armies can't move to spaces listed in Mixed case (e.g. 'Bal' which is fleet-only water access from land)
            if (order_type !== 'C' &&
                (other_loc_type === 'WATER' ||
                 (place_found_in_abut_list !== place_found_in_abut_list.toUpperCase() && place_found_in_abut_list !== place_found_in_abut_list.toLowerCase()) // Mixed case
                )) {
                return 0;
            }
        }
        return 1;
    }

    public is_valid_unit(unit: string, no_coast_ok: boolean = false, shut_ok: boolean = false): boolean {
        const parts = unit.toUpperCase().split(/\s+/);
        if (parts.length !== 2) return false; // Should be like "A PAR" or "F STP/SC"
        const unit_type = parts[0];
        const loc = parts[1]; // loc is already uppercase

        const areaType = this.area_type(loc); // area_type can handle uppercase loc

        if (areaType === 'SHUT') {
            return shut_ok ? true : false;
        }
        if (unit_type === '?') { // Wildcard unit type
            return areaType !== undefined && areaType !== 'SHUT';
        }

        if (unit_type === 'A') {
            // Army can be anywhere, except in 'WATER'.
            // It cannot be on a specific coast like 'SPA/NC', only on 'SPA' (if SPA is LAND/COAST)
            return !loc.includes('/') && (areaType === 'LAND' || areaType === 'COAST' || areaType === 'PORT');
        }

        if (unit_type === 'F') {
            // Fleet must be in WATER, COAST, or PORT.
            // If loc is like 'SPA' (no_coast), it's valid if no_coast_ok is true OR
            // if 'spa' (lowercase) is not defined in loc_abut (meaning SPA is not a "parent" of coasts like spa for SPA/NC)
            // Python: `loc.lower() not in self.loc_abut`
            // This check means: if 'spa' is a key in loc_abut, it implies 'SPA' is a generic land area with specific coasts,
            // so a fleet F SPA would be invalid unless no_coast_ok. If 'spa' is not in loc_abut, then 'SPA' might be a sea zone.
            const lowerLoc = loc.toLowerCase();
            const isSimpleSeaOrCoastalProv = !this.loc_abut[lowerLoc]; // True if 'spa' is not a key in loc_abut

            return (areaType === 'WATER' || areaType === 'COAST' || areaType === 'PORT')) &&
                   (no_coast_ok || loc.includes('/') || isSimpleSeaOrCoastalProv);
        }
        return false; // Should not happen
    }

    public abut_list(site: string, incl_no_coast: boolean = false): string[] {
        // site can be 'SPA' or 'spa' or 'SPA/NC'
        let abutList: string[] = [];
        const siteUpper = site.toUpperCase();
        const siteLower = site.toLowerCase();

        if (this.loc_abut[site]) { // Exact match (e.g. 'SPA/NC', or 'spa' if defined)
            abutList = [...this.loc_abut[site]];
        } else if (this.loc_abut[siteUpper]) { // Try uppercase ('SPA')
            abutList = [...this.loc_abut[siteUpper]];
        } else if (this.loc_abut[siteLower]) { // Try lowercase ('spa')
            abutList = [...this.loc_abut[siteLower]];
        } else {
            abutList = [];
        }

        if (incl_no_coast) {
            const baseSite = siteUpper.substring(0, 3); // e.g., SPA from SPA/NC
            let hasSpecificCoastsInList = false;
            for (const loc of abutList) {
                if (loc.toUpperCase().startsWith(baseSite + "/")) {
                    hasSpecificCoastsInList = true;
                    break;
                }
            }
            // If the original site was a specific coast (e.g. SPA/NC) or if its abut list contains specific coasts,
            // and the base name (e.g. 'spa' or 'SPA') is not already in the list, add it.
            // The Python version adds loc[:3] (e.g. 'spa' if loc was 'spa/nc') if not in abut_list
            // This implies if 'spa/nc' abuts 'foo', and 'spa' also abuts 'foo' (or something else), 'spa' should be in the list.
            // Let's ensure the 3-char version (lowercase, as per Python's example 'bur') is present if relevant.
            // The map files define abutments like:
            // SPA/NC ABUTS NAO ...
            // spa    ABUTS NAO POR MAR... (for armies)
            // If site is 'SPA/NC', abut_list('SPA/NC') would be ['NAO', ...]
            // If incl_no_coast, should we add 'spa'? Only if 'spa' provides *additional* adjacencies or is the army-movable equivalent.
            // The Python code: `if '/' in loc and loc[:3] not in abut_list: abut_list += [loc[:3]]`
            // This was iterating over the *current* abut_list.
            // A better interpretation for incl_no_coast: if `site` is `SPA/NC`, also include adjacencies of `spa`.
            // Or if `site` is `SPA`, include both `SPA` and `spa` adjacencies if they differ.
            // For now, let's stick to a simpler interpretation: if the list contains specific coasts, ensure the base parent is also considered if it exists as a separate entry.
            // The most direct translation of python's list comprehension on abut_list:
            const additionalAbuts: string[] = [];
            if (site.includes('/')) { // If site itself is a specific coast e.g. SPA/NC
                const parentLocLower = siteLower.substring(0,3); // spa
                if (this.loc_abut[parentLocLower] && !abutList.some(a => a.toLowerCase() === parentLocLower)) {
                     // Check if 'spa' adjacencies should be merged. This is complex.
                     // The original Python code's logic for `incl_no_coast` in `abut_list` was:
                     // `for loc in list(abut_list): if '/' in loc and loc[:3] not in abut_list: abut_list += [loc[:3]]`
                     // This means: if an existing abutment is a specific coast (e.g. MAR/GC), add its parent (mar) to the list *if not already there*.
                     // This seems to expand the list with parent provinces of *already listed coastal adjacencies*.
                     // It does not necessarily add the parent of the *input site*.
                     for (const loc of abutList) {
                         if (loc.includes('/') && loc.length > 3) { // e.g. MAR/GC
                             const parentOfAbut = loc.substring(0,3); // MAR (original map files might use 'mar')
                             // Check against existing list, case insensitively for parent.
                             if (!abutList.some(existingAbut => existingAbut.toUpperCase() === parentOfAbut.toUpperCase())) {
                                 // Prefer lowercase if that's how it's defined in loc_abut keys, else uppercase
                                 if (this.loc_abut[parentOfAbut.toLowerCase()]) {
                                     additionalAbuts.push(parentOfAbut.toLowerCase());
                                 } else if (this.loc_abut[parentOfAbut.toUpperCase()]) {
                                     additionalAbuts.push(parentOfAbut.toUpperCase());
                                 }
                             }
                         }
                     }
                }
            }
             abutList.push(...additionalAbuts);
             return [...new Set(abutList)]; // Return unique list
        }
        return [...new Set(abutList)];
    }

    public find_next_phase(phase: string, phase_type?: string, skip: number = 0): string {
        const now = phase.split(/\s+/);
        if (now.length < 3) {
            return phase; // FORMING or COMPLETED
        }

        let year = parseInt(now[1], 10);
        const currentPhaseKey = `${now[0]} ${now[2]}`; // e.g., "SPRING MOVEMENT"
        let season_ix = this.seq.indexOf(currentPhaseKey);
        if (season_ix === -1) return ''; // Should not happen if phase is valid and seq is populated

        season_ix = (season_ix + 1) % this.seq.length;
        let seq_len_countdown = this.seq.length;

        while (seq_len_countdown > 0) {
            seq_len_countdown--;
            const new_season_parts = this.seq[season_ix].split(/\s+/); // e.g., ["SPRING", "MOVEMENT"] or ["NEWYEAR"]

            if (new_season_parts[0] === 'IFYEARDIV') {
                let div: number, mod: number;
                if (new_season_parts[1].includes('=')) {
                    [div, mod] = new_season_parts[1].split('=').map(Number);
                } else {
                    div = parseInt(new_season_parts[1], 10);
                    mod = 0;
                }
                if (year % div !== mod) {
                    // Condition not met, effectively skip this whole IFYEARDIV block.
                    // The original python code sets season_ix = -1 and then the loop structure handles it.
                    // Here, we can advance season_ix to simulate skipping.
                    // Find the end of this conditional block or assume it's just one entry.
                    // For simplicity, assuming IFYEARDIV is a single entry in seq that guards the next actual phase.
                    // This might need adjustment if IFYEARDIV can span multiple seq entries.
                }
            } else if (new_season_parts[0] === 'NEWYEAR') {
                year += (new_season_parts.length === 1 || isNaN(parseInt(new_season_parts[1],10))) ? 1 : parseInt(new_season_parts[1],10);
            } else { // Actual phase
                if (phase_type === undefined || phase_type === null || new_season_parts[1][0].toUpperCase() === phase_type.toUpperCase()) {
                    if (skip === 0) {
                        return `${new_season_parts[0]} ${year} ${new_season_parts[1]}`;
                    }
                    skip--;
                    // seq_len_countdown = this.seq.length; // Python version resets this, implying a fresh search for next 'skip'
                }
            }
            season_ix = (season_ix + 1) % this.seq.length;
        }
        return ''; // Could not find next phase
    }

    public find_previous_phase(phase: string, phase_type?: string, skip: number = 0): string {
        const now = phase.split(/\s+/);
        if (now.length < 3) {
            return phase; // FORMING or COMPLETED
        }

        let year = parseInt(now[1], 10);
        const currentPhaseKey = `${now[0]} ${now[2]}`;
        let season_ix = this.seq.indexOf(currentPhaseKey);
        if (season_ix === -1) return '';

        let seq_len_countdown = this.seq.length;

        while (seq_len_countdown > 0) {
            seq_len_countdown--;
            season_ix--;
            let temp_year = year; // Temporary year for IFYEARDIV checks within the loop iteration

            if (season_ix < 0) { // Wrapped around
                season_ix = this.seq.length - 1;
                // Check for NEWYEAR at the end of sequence before wrapping
                for (let i = this.seq.length -1; i >=0; i--) {
                    const prev_season_parts_check = this.seq[i].split(/\s+/);
                     if (prev_season_parts_check[0] === 'IFYEARDIV') {
                        // This logic is complex for reverse. If an IFYEARDIV governed the year change,
                        // we need to know if it applied.
                        // This simplified version might not perfectly handle all IFYEARDIV cases in reverse.
                        let div: number, mod: number;
                        if (prev_season_parts_check[1].includes('=')) {
                            [div, mod] = prev_season_parts_check[1].split('=').map(Number);
                        } else {
                            div = parseInt(prev_season_parts_check[1], 10);
                            mod = 0;
                        }
                        // If the *previous* year mod div was the condition, then year would have changed.
                        // This is hard to check without knowing the year *before* it incremented.
                        // For now, we assume IFYEARDIV mainly affects forward progression skipping.
                    } else if (prev_season_parts_check[0] === 'NEWYEAR') {
                         // If we just passed a NEWYEAR going backward, decrement the year
                         temp_year -= (prev_season_parts_check.length === 1 || isNaN(parseInt(prev_season_parts_check[1],10))) ? 1 : parseInt(prev_season_parts_check[1],10);
                         break; // Found the relevant NEWYEAR that caused the wrap
                    }
                }
            }

            const prev_season_parts = this.seq[season_ix].split(/\s+/);

            if (prev_season_parts[0] === 'IFYEARDIV') {
                // Similar to find_next_phase, IFYEARDIV mainly gates forward progress.
                // In reverse, we assume it was met if we are here.
                // The primary effect is on year changes associated with NEWYEAR.
            } else if (prev_season_parts[0] === 'NEWYEAR') {
                 year -= (prev_season_parts.length === 1 || isNaN(parseInt(prev_season_parts[1],10))) ? 1 : parseInt(prev_season_parts[1],10);
            } else { // Actual phase
                if (phase_type === undefined || phase_type === null || prev_season_parts[1][0].toUpperCase() === phase_type.toUpperCase()) {
                    if (skip === 0) {
                        return `${prev_season_parts[0]} ${year} ${prev_season_parts[1]}`;
                    }
                    skip--;
                    // seq_len_countdown = this.seq.length; // Python version resets this
                }
            }
        }
        return ''; // Could not find previous phase
    }

    public compare_phases(phase1: string, phase2: string): number {
        let p1 = phase1;
        let p2 = phase2;

        if (p1.endsWith('?')) {
            const base = p1.slice(0, -1); // e.g. S1901
            const seasonInitial = base[0].toUpperCase();
            const lastPhaseTypeForSeason = this.seq.filter(s => s.startsWith(seasonInitial) && !s.startsWith("IFYEARDIV") && !s.startsWith("NEWYEAR")).pop()?.split(/\s+/)[1][0];
            p1 = base + (lastPhaseTypeForSeason || '');
        }
        if (p2.endsWith('?')) {
            const base = p2.slice(0, -1);
            const seasonInitial = base[0].toUpperCase();
            const lastPhaseTypeForSeason = this.seq.filter(s => s.startsWith(seasonInitial) && !s.startsWith("IFYEARDIV") && !s.startsWith("NEWYEAR")).pop()?.split(/\s+/)[1][0];
            p2 = base + (lastPhaseTypeForSeason || '');
        }

        if (p1.split(/\s+/).length === 1) p1 = this.phase_long(p1, p1.toUpperCase());
        if (p2.split(/\s+/).length === 1) p2 = this.phase_long(p2, p2.toUpperCase());

        if (p1 === p2) return 0;

        const now1_parts = p1.split(/\s+/);
        const now2_parts = p2.split(/\s+/);

        const getPhaseOrderVal = (phaseStr: string, parts: string[]): number => {
            if (parts.length > 2) return 2; // Normal phase
            if (phaseStr === 'FORMING') return 1;
            if (phaseStr === 'COMPLETED') return 3;
            return 0; // Unknown
        };

        if (now1_parts.length < 3 || now2_parts.length < 3) {
            const order1 = getPhaseOrderVal(p1, now1_parts);
            const order2 = getPhaseOrderVal(p2, now2_parts);
            if (order1 === order2) return 0;
            return order1 > order2 ? 1 : -1;
        }

        const year1 = parseInt(now1_parts[1], 10);
        const year2 = parseInt(now2_parts[1], 10);

        if (year1 !== year2) {
            return (year1 > year2 ? 1 : -1) * (this.flow_sign || 1);
        }

        const season_ix1 = this.seq.indexOf(`${now1_parts[0]} ${now1_parts[2]}`);
        const season_ix2 = this.seq.indexOf(`${now2_parts[0]} ${now2_parts[2]}`);

        if (season_ix1 === -1 || season_ix2 === -1) return 0; // Should not happen

        // Check if NEWYEAR is between the two seasons if they are in different "effective years" due to NEWYEAR placement
        if (season_ix1 > season_ix2) {
            for (let i = season_ix2 + 1; i < season_ix1; i++) {
                if (this.seq[i].startsWith('NEWYEAR')) return -1 * (this.flow_sign || 1); // phase1 is earlier in effective year
            }
            return 1 * (this.flow_sign || 1);
        }
        if (season_ix1 < season_ix2) {
            for (let i = season_ix1 + 1; i < season_ix2; i++) {
                if (this.seq[i].startsWith('NEWYEAR')) return 1 * (this.flow_sign || 1); // phase1 is later in effective year
            }
            return -1 * (this.flow_sign || 1);
        }
        return 0; // Should be caught by p1 === p2
    }

    public static phase_abbr(phase: string, defaultVal: string = '?????'): string {
        if (phase === 'FORMING' || phase === 'COMPLETED') {
            return phase;
        }
        const parts = phase.split(/\s+/);
        if (parts.length === 3) {
            try {
                const year = parseInt(parts[1], 10);
                // Format year to be exactly 4 digits, zero-padded if necessary, though typical years won't need it.
                // String(year).padStart(4, '0') - but map files usually have 4-digit years.
                return `${parts[0][0].toUpperCase()}${parts[1]}${parts[2][0].toUpperCase()}`;
            } catch {
                return defaultVal;
            }
        }
        return defaultVal;
    }

    public phase_long(phase_abbr: string, defaultVal: string = '?????'): string {
        if (phase_abbr.length < 3) return defaultVal; // Basic check for S1M, S1901M etc.
        const abbrUpper = phase_abbr.toUpperCase();

        try {
            const seasonChar = abbrUpper[0];
            const phaseTypeChar = abbrUpper.slice(-1);
            const yearStr = abbrUpper.substring(1, abbrUpper.length - 1);
            const year = parseInt(yearStr, 10);
            if (isNaN(year)) return defaultVal;

            for (const season_full_def of this.seq) { // e.g. "SPRING MOVEMENT"
                const parts = season_full_def.split(/\s+/);
                if (parts.length === 2 && parts[0] !== 'NEWYEAR' && parts[0] !== 'IFYEARDIV') {
                    if (parts[0][0].toUpperCase() === seasonChar && parts[1][0].toUpperCase() === phaseTypeChar) {
                        return `${parts[0]} ${year} ${parts[1]}`.toUpperCase();
                    }
                }
            }
        } catch {
            // Fall through to default
        }
        return defaultVal;
    }
}

// Initialize CONVOYS_PATH_CACHE at module level after class definition
CONVOYS_PATH_CACHE = get_convoy_paths_cache();
