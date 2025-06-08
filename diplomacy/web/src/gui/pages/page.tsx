// ==============================================================================
// Copyright (C) 2019 - Philip Paquette, Steven Bocco
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
/** Main class to use to create app GUI. **/

import * as React from 'react';
import {ContentConnection} from "./content_connection";
import {UTILS} from "../../diplomacy/utils/utils";
import {Diplog} from "../../diplomacy/utils/diplog";
import {DipStorage} from "../utils/dipStorage";
import {PageContext, PageContextType} from "../components/page_context"; // Assuming PageContextType is exported
import {ContentGames} from "./content_games";
import {loadGameFromDisk} from "../utils/load_game_from_disk";
import {ContentGame} from "./content_game";
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// Forward declare types for now, assuming they exist or will be created
type GameDataType = any; // Replace with actual game data type
type ChannelType = any; // Replace with actual Channel type
type ConnectionType = any; // Replace with actual Connection type
type AvailableMapsType = any; // Replace with actual available maps type
type MessagesType = { error?: string; info?: string; success?: string };

interface PageProps {
    // No props are passed to Page from index.tsx
}

interface PageState {
    error: string | null;
    info: string | null;
    success: string | null;
    name: string | null; // Or specific page names: 'games' | 'game:game_id' | null
    body: React.ReactNode | null;
    games: { [key: string]: GameDataType };
    myGames: { [key: string]: GameDataType };
}

export class Page extends React.Component<PageProps, PageState> {
    connection: ConnectionType | null;
    channel: ChannelType | null;
    availableMaps: AvailableMapsType | null;

    // For this.context to work with TypeScript
    static contextType = PageContext;
    context!: PageContextType; // Assert that context is always initialized if PageContext.Provider is always above

    constructor(props: PageProps) {
        super(props);
        this.connection = null;
        this.channel = null;
        this.availableMaps = null;
        this.state = {
            error: null,
            info: null,
            success: null,
            name: null,
            body: null,
            games: {},
            myGames: {}
        };
        this.error = this.error.bind(this);
        this.info = this.info.bind(this);
        this.success = this.success.bind(this);
        this.logout = this.logout.bind(this);
        this.loadGameFromDisk = this.loadGameFromDisk.bind(this);
        this._post_remove = this._post_remove.bind(this);
        this._add_to_my_games = this._add_to_my_games.bind(this);
        this._remove_from_my_games = this._remove_from_my_games.bind(this);
        this._remove_from_games = this._remove_from_games.bind(this);
        this.onReconnectionError = this.onReconnectionError.bind(this);
    }

    static wrapMessage(message) {
        return message ? `(${UTILS.date()}) ${message}` : '';
    }

    static __sort_games(games) {
        // Sort games with not-joined games first, else compare game ID.
        games.sort((a, b) => (((a.role ? 1 : 0) - (b.role ? 1 : 0)) || a.game_id.localeCompare(b.game_id)));
        return games;
    }

    static defaultPage() {
        return <ContentConnection/>;
    }

    // Making setState promise-based, as originally intended
    setStatePromise<K extends keyof PageState>(
        state: Pick<PageState, K> | ((prevState: Readonly<PageState>, props: Readonly<PageProps>) => Pick<PageState, K> | PageState | null) | PageState | null
    ): Promise<void> {
        return new Promise<void>(resolve => {
            super.setState(state as any, resolve); // Use 'as any' to bypass complex setState overload issues temporarily
        });
    }

    onReconnectionError(error: Error | any) { // Typed error
        this.__disconnect(error);
    }

    /**
     * @callback OnClose
     */

    /**
     * @callback DialogBuilder
     * @param {OnClose} onClose
     */

    /**
     * open a dialog box
     * @param {DialogBuilder} builder - a callback to generate dialog GUI. Will be executed with a `onClose` callback
     * parameter to call when dialog must be closed: `builder(onClose)`.
     */
    dialog(builder) {
        confirmAlert({customUI: ({onClose}) => builder(onClose)});
    }

    //// Methods to load a page.

    load(name: string | null, body: React.ReactNode | null, messages?: MessagesType): Promise<void> {
        const newState: Partial<PageState> = {};
        if (messages) {
            for (const key of ['error', 'info', 'success'] as (keyof MessagesType)[]) {
                (newState as any)[key] = Page.wrapMessage(messages[key]);
            }
        }
        Diplog.printMessages(newState as any); // Diplog.printMessages might need typing or adjustment
        newState.name = name;
        newState.body = body;
        return this.setStatePromise(newState as PageState); // Cast as PageState if all relevant fields are updated
    }

    loadGames(messages?: MessagesType): Promise<void> {
        return this.load(
            'games',
            <ContentGames myGames={this.getMyGames()} gamesFound={this.getGamesFound()}/>,
            messages
        );
    }

    loadGameFromDisk(): Promise<void | null> { // Adjusted return type based on usage
        return loadGameFromDisk()
            .then((game: GameDataType) => { // Added type for game
                if (!game || !game.game_id) { // Basic validation
                    this.error("Failed to load game from disk: Invalid game data.");
                    return null;
                }
                return this.load(
                    `game: ${game.game_id}`,
                    <ContentGame data={game}/>,
                    {success: `Game loaded from disk: ${game.game_id}`}
                );
            })
            .catch(this.error);
    }

    getName(): string | null { // Return type based on PageState
        return this.state.name;
    }

    //// Methods to sign out channel and go back to connection page.

    __disconnect(error?: Error | any): Promise<void> { // Typed error
        // Clear local data and go back to connection page.
        if (this.connection) this.connection.close(); // Check if connection exists
        this.connection = null;
        this.channel = null;
        this.availableMaps = null;
        const message = Page.wrapMessage(error ? `${error.toString()}` : `Disconnected from channel and server.`);
        Diplog.success(message);
        return this.setStatePromise({
            error: error ? message : null,
            info: null,
            success: error ? null : message,
            name: null,
            body: null,
            games: {},
            myGames: {}
        });
    }

    logout(): Promise<void | null> { // Adjusted return type
        // Disconnect channel and go back to connection page.
        if (this.channel) {
            return this.channel.logout()
                .then(() => this.__disconnect())
                .catch((error: Error | any) => this.error(`Error while disconnecting: ${error.toString()}.`));
        } else {
            return this.__disconnect();
        }
    }

    //// Methods to be used to set page title and messages.

    error(message: string): Promise<void> {
        message = Page.wrapMessage(message);
        Diplog.error(message);
        return this.setStatePromise({error: message, success: null, info: null});
    }

    info(message: string): Promise<void> {
        message = Page.wrapMessage(message);
        Diplog.info(message);
        return this.setStatePromise({info: message, success: null, error: null});
    }

    success(message: string): Promise<void> {
        message = Page.wrapMessage(message);
        Diplog.success(message);
        return this.setStatePromise({success: message, error: null, info: null});
    }

    warn(message: string): Promise<void> {
        return this.info(message);
    }

    //// Methods to manage games.

    updateMyGames(gamesToAdd: GameDataType[]): Promise<void> { // Typed gamesToAdd
        // Update state myGames with given games. This method does not update local storage.
        const myGames = {...this.state.myGames}; // Use spread for new object
        let gamesFound = null;
        for (const gameToAdd of gamesToAdd) { // Use const for loop variable
            if (gameToAdd && gameToAdd.game_id) { // Basic validation
                myGames[gameToAdd.game_id] = gameToAdd;
                if (this.state.games.hasOwnProperty(gameToAdd.game_id)) {
                    if (!gamesFound) {
                        gamesFound = {...this.state.games};
                    }
                    gamesFound[gameToAdd.game_id] = gameToAdd;
                }
            }
        }
        if (!gamesFound) {
            gamesFound = this.state.games;
        }
        return this.setStatePromise({myGames: myGames, games: gamesFound});
    }

    getGame(gameID: string): GameDataType | null { // Typed gameID and return
        if (this.state.myGames.hasOwnProperty(gameID)) {
            return this.state.myGames[gameID];
        }
        return this.state.games[gameID] || null; // Ensure null if not found
    }

    getMyGames(): GameDataType[] { // Return type
        return Page.__sort_games(Object.values(this.state.myGames));
    }

    getGamesFound(): GameDataType[] { // Return type
        return Page.__sort_games(Object.values(this.state.games));
    }

    addGamesFound(gamesToAdd: GameDataType[]): Promise<void> { // Typed gamesToAdd
        const gamesFound: { [key: string]: GameDataType } = {};
        for (const game of gamesToAdd) {
            if (game && game.game_id) { // Basic validation
                 gamesFound[game.game_id] = (
                    this.state.myGames.hasOwnProperty(game.game_id) ?
                        this.state.myGames[game.game_id] : game
                );
            }
        }
        return this.setStatePromise({games: gamesFound});
    }

    leaveGame(gameID: string): Promise<void | null> | null { // Typed gameID and return
        if (this.state.myGames.hasOwnProperty(gameID)) {
            const game = this.state.myGames[gameID];
            if (game.client) {
                return game.client.leave()
                    .then(() => this.disconnectGame(gameID))
                    .then(() => this.loadGames({info: `Game ${gameID} left.`}))
                    .catch((error: Error | any) => this.error(`Error when leaving game ${gameID}: ${error.toString()}`));
            }
        } else {
            return this.loadGames({info: `No game to left.`});
        }
        return null; // Explicitly return null if no action taken
    }

    _post_remove(gameID: string): Promise<void> { // Typed gameID
        return this.disconnectGame(gameID)
            .then(() => {
                const myGames = this._remove_from_my_games(gameID);
                const games = this._remove_from_games(gameID);
                return this.setStatePromise({games, myGames});
            })
            .then(() => this.loadGames({info: `Game ${gameID} deleted.`}));
    }

    removeGame(gameID: string): Promise<void | null> | null { // Typed gameID
        const game = this.getGame(gameID);
        if (game) {
            if (game.client) {
                return game.client.remove()
                    .then(() => this._post_remove(gameID))
                    .catch((error: Error | any) => this.error(`Error when deleting game ${gameID}: ${error.toString()}`));
            } else if (this.channel) { // Ensure channel exists
                return this.channel.joinGame({game_id: gameID})
                    .then((networkGame: any) => networkGame.remove()) // Assuming joinGame returns a game object with remove
                    .then(() => this._post_remove(gameID))
                    .catch((error: Error | any) => this.error(`Error when deleting game after joining it (${gameID}): ${error.toString()}`));
            }
        }
        return null; // Explicitly return null
    }

    disconnectGame(gameID: string): Promise<void | null> | null { // Typed gameID and return
        const game = this.getGame(gameID);
        if (game) {
            if (game.client) {
                game.client.clearAllCallbacks();
                game.client.callbacksBound = false;
                if (game.client.queue) {
                    game.client.queue.append(null);
                }
            }
            if (this.channel) { // Ensure channel exists
                return this.channel.getGamesInfo({games: [gameID]})
                    .then((gamesInfo: GameDataType[]) => this.updateMyGames(gamesInfo)) // Typed gamesInfo
                    .catch((error: Error | any) => this.error(`Error while leaving game ${gameID}: ${error.toString()}`));
            }
        }
        return null; // Explicitly return null
    }

    _add_to_my_games(game: GameDataType): Partial<PageState> { // Typed game and return
        const myGames = {...this.state.myGames};
        const gamesFound = this.state.games.hasOwnProperty(game.game_id) ? {...this.state.games} : this.state.games;
        myGames[game.game_id] = game;
        if (gamesFound.hasOwnProperty(game.game_id)) {
            gamesFound[game.game_id] = game;
        }
        return {myGames: myGames, games: gamesFound};
    }

    _remove_from_my_games(gameID: string): { [key: string]: GameDataType } { // Typed gameID and return
        if (this.state.myGames.hasOwnProperty(gameID)) {
            const games = {...this.state.myGames};
            delete games[gameID];
            if (this.channel) { // Ensure channel exists
                DipStorage.removeUserGame(this.channel.username, gameID);
            }
            return games;
        } else {
            return this.state.myGames;
        }
    }

    _remove_from_games(gameID: string): { [key: string]: GameDataType } { // Typed gameID and return
        if (this.state.games.hasOwnProperty(gameID)) {
            const games = {...this.state.games};
            delete games[gameID];
            return games;
        } else {
            return this.state.games;
        }
    }

    addToMyGames(game: GameDataType): Promise<void> { // Typed game
        if (this.channel) { // Ensure channel exists
             DipStorage.addUserGame(this.channel.username, game.game_id);
        }
        return this.setStatePromise(this._add_to_my_games(game) as PageState).then(() => this.loadGames());
    }

    removeFromMyGames(gameID: string): Promise<void> { // Typed gameID
        const myGames = this._remove_from_my_games(gameID);
        return this.setStatePromise({myGames}).then(() => this.loadGames());
    }

    hasMyGame(gameID: string): boolean { // Typed gameID
        return this.state.myGames.hasOwnProperty(gameID);
    }

    //// Render method.

    render() {
        const successMessage = this.state.success || '-';
        const infoMessage = this.state.info || '-';
        const errorMessage = this.state.error || '-';
        return (
            <PageContext.Provider value={this}>
                <div className="page container-fluid" id={this.state.name || 'page-container'}>
                    <div className={'top-msg row'}>
                        <div title={successMessage !== '-' ? successMessage : ''}
                             className={'col-sm-4 msg success ' + (this.state.success ? 'with-msg' : 'no-msg')}
                             onClick={() => this.success('')}>
                            {successMessage}
                        </div>
                        <div title={infoMessage !== '-' ? infoMessage : ''}
                             className={'col-sm-4 msg info ' + (this.state.info ? 'with-msg' : 'no-msg')}
                             onClick={() => this.info('')}>
                            {infoMessage}
                        </div>
                        <div title={errorMessage !== '-' ? errorMessage : ''}
                             className={'col-sm-4 msg error ' + (this.state.error ? 'with-msg' : 'no-msg')}
                             onClick={() => this.error('')}>
                            {errorMessage}
                        </div>
                    </div>
                    {this.state.body || Page.defaultPage()}
                </div>
            </PageContext.Provider>
        );
    }
}
