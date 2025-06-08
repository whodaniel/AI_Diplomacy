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
import * as React from "react";
// Import Page type for context typing. Use 'type' keyword if Page class itself imports PageContext to avoid circular dependencies.
// However, since Page is a class and likely the provider, this might be okay, or PageContextType can be defined in Page.tsx
// For now, let's assume Page type will be available or use 'any'.
// import type { Page } from "../pages/page";

// If Page is not available here due to load order or circular deps, use 'any' or a placeholder
export const PageContext = React.createContext<any | null>(null);
export type PageContextType = any | null; // Exporting the type for Page.tsx to use
