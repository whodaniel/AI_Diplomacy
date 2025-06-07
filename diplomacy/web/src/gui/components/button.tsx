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
import PropTypes from "prop-types";

interface ButtonProps {
    title: string;
    onClick: (event?: any) => void; // Or React.MouseEventHandler<HTMLButtonElement> if more specific event handling is needed
    color?: string;
    large?: boolean;
    small?: boolean;
    pickEvent?: boolean;
    disabled?: boolean;
}

export class Button extends React.Component<ButtonProps> {
    /** Bootstrap button.
     * Bootstrap classes:
     * - btn
     * - btn-primary
     * - mx-1 (margin-left 1px, margin-right 1px)
     * Props: title (str), onClick (function).
     * **/
    // title
    // onClick
    // pickEvent = false
    // large = false
    // small = false

    constructor(props: ButtonProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(event: React.MouseEvent<HTMLButtonElement>) {
        if (this.props.onClick) {
            this.props.onClick(this.props.pickEvent ? event : undefined);
        }
    }

    render() {
        const { color, large, small, disabled, title } = this.props;
        const btnColor = color || 'secondary';
        const btnBlock = large ? ' btn-block' : '';
        const btnSm = small ? ' btn-sm' : '';

        return (
            <button
                className={`btn btn-${btnColor}${btnBlock}${btnSm}`}
                disabled={disabled}
                onClick={this.onClick}>
                <strong>{title}</strong>
            </button>
        );
    }
}

/*
Button.propTypes = {
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    color: PropTypes.string,
    large: PropTypes.bool,
    small: PropTypes.bool,
    pickEvent: PropTypes.bool,
    disabled: PropTypes.bool
};

Button.defaultProps = { // Renamed from defaultPropTypes
    disabled: false
};
*/
