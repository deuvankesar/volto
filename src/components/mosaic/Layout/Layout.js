/**
 * Layout container.
 * @module containers/Layout
 */

/* eslint react/prefer-stateless-function: 0 */

import React, { Component, PropTypes } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { fromJS } from 'immutable';
import { v4 as uuid } from 'uuid';

import { Grid } from 'components';

/**
 * Layout component class.
 * @class Layout
 * @extends Component
 */
export default class Layout extends Component {

  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    layout: PropTypes.object.isRequired,
  }

  /**
   * Construcor
   * @param {Object} props Properties.
   * @constructs
   */
  constructor(props) {
    super(props);
    this.state = {
      layout: this.props.layout.map((row, rowIndex) =>
        row.map((tile, tileIndex) =>
          ({
            width: tile.width,
            content: EditorState.createWithContent(ContentState.createFromText(tile.content)),
            selected: rowIndex === 0 && tileIndex === 0,
          })
        )
      ),
      selected: {
        row: 0,
        column: 0,
      }
    };
  }

  /**
   * Set tile content.
   * @function setTileContent
   * @param {number} row Row index.
   * @param {number} column Column index.
   * @param {Object} content New content.
   * @returns {undefined}
   */
  setTileContent(row, column, content) {
    this.setState({
      layout: this.state.layout.map((rowList, rowIndex) =>
        rowList.map((tile, tileIndex) =>
          (rowIndex === row && tileIndex === column) ? {
            ...tile,
            content,
          } : tile 
        )
      )
    });
  }

  /**
   * Select tile.
   * @function selectTile
   * @param {number} row Row index.
   * @param {number} column Column index.
   * @returns {undefined}
   */
  selectTile(row, column) {
    this.state.layout[this.state.selected.row][this.state.selected.column].selected = false;
    this.state.layout[row][column].selected = true;
    this.setState({
      selected: {
        row,
        column
      },
      layout: this.state.layout,
    });
  }

  /**
   * Render method.
   * @function render
   * @returns {string} Markup of the container.
   */
  render() {
    const { layout, selected } = this.state;

//    const selection = window.getSelection().getRangeAt(0).getBoundingClientRect();

    const rows = layout.map((row, rowIndex) =>
      row.map((tile, tileIndex) =>
        ({
          width: tile.width,
          content: tile.content,
          selected: tile.selected,
        })
      )
    );

    return <Grid rows={rows}
      selectTile={::this.selectTile} setTileContent={::this.setTileContent} />;
  }
}

export default Layout;
