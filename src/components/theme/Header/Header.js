/**
 * Header component.
 * @module components/Header
 */

import React from 'react';

import { Logo, Search } from 'components';

/**
 * Header component class.
 * @function Field
 * @returns {string} Markup of the component.
 */
const Header = () => (
  <header id="content-header">
    <div className="container">
      <div id="portal-header">
        <Logo />
        <div id="portal-searchbox">
          <Search />
        </div>
      </div>
    </div>
  </header>
);

export default Header;
