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
import * as React from 'react';
import PropTypes from 'prop-types';

interface DivProps {
    className?: string;
    children?: React.ReactNode;
}

class Div extends React.Component<DivProps> {
    getClassName() {
        return '';
    }

    render() {
        // Ensure this.props.className is treated as a string even if undefined
        const additionalClassName = this.props.className ? ' ' + this.props.className : '';
        return (
            <div className={this.getClassName() + additionalClassName}>
                {this.props.children}
            </div>
        );
    }
}

/*
Div.propTypes = {
    className: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};
*/

export class Bar extends Div {
    getClassName() {
        return 'bar';
    }
}

export class Row extends Div {
    getClassName() {
        return 'row';
    }
}

export class Col extends Div {
    getClassName() {
        return 'col';
    }
}
