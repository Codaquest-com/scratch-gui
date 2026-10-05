import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import locales from '../../lib/cq-locales.js';
import {selectLocale} from '../../reducers/locales.js';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';

import menuBarStyles from './menu-bar.css';
import styles from './settings-menu.css';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';
import languageIcon from '../language-selector/language-icon.svg';

// Codaquest: language is the only setting, so it sits directly in the menu bar
// instead of behind Settings > Language.
const CqLanguageBarMenu = ({
    currentLocale,
    isRtl,
    menuOpen,
    onChangeLanguage,
    onRequestClose,
    onRequestOpen
}) => (
    <div
        className={classNames(menuBarStyles.menuBarItem, menuBarStyles.hoverable, menuBarStyles.themeMenu, {
            [menuBarStyles.active]: menuOpen
        })}
        onMouseUp={onRequestOpen}
    >
        <img src={languageIcon} />
        <span className={styles.dropdownLabel}>
            <FormattedMessage
                defaultMessage="Language"
                description="Language sub-menu"
                id="gui.menuBar.language"
            />
        </span>
        <img src={dropdownCaret} />
        <MenuBarMenu
            className={menuBarStyles.menuBarMenu}
            open={menuOpen}
            place={isRtl ? 'left' : 'right'}
            onRequestClose={onRequestClose}
        >
            <MenuSection>
                {Object.keys(locales).map(locale => (
                    <MenuItem
                        key={locale}
                        // eslint-disable-next-line react/jsx-no-bind
                        onClick={() => {
                            onChangeLanguage(locale);
                            onRequestClose();
                        }}
                    >
                        <img
                            className={classNames(styles.check, {
                                [styles.selected]: currentLocale === locale
                            })}
                            src={check}
                        />
                        {locales[locale].name}
                    </MenuItem>
                ))}
            </MenuSection>
        </MenuBarMenu>
    </div>
);

CqLanguageBarMenu.propTypes = {
    currentLocale: PropTypes.string,
    isRtl: PropTypes.bool,
    menuOpen: PropTypes.bool,
    onChangeLanguage: PropTypes.func,
    onRequestClose: PropTypes.func,
    onRequestOpen: PropTypes.func
};

const mapStateToProps = state => ({
    currentLocale: state.locales.locale
});

const mapDispatchToProps = dispatch => ({
    onChangeLanguage: locale => dispatch(selectLocale(locale))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CqLanguageBarMenu);
