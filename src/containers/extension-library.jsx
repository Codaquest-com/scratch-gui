import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import extensionLibraryContent from '../lib/libraries/extensions/index.jsx';

import LibraryComponent from '../components/library/library.jsx';
import extensionIcon from '../components/action-menu/icon--sprite.svg';
import soundIconURL from '../lib/libraries/extensions/music/music.png';
import soundInsetIconURL from '../lib/libraries/extensions/music/music-small.svg';
import {setSoundMod} from '../reducers/cq-sound-mod';

// Codaquest lessons only use Pen. Other extensions stay in the data so an older
// project that already uses one still loads, but they are no longer offered.
const CQ_OFFERED_EXTENSIONS = ['pen'];

// Sound is core Scratch, not an extension, so picking it only reveals the
// Sound category and the Sounds tab (see reducers/cq-sound-mod.js).
const CQ_SOUND_ID = 'cqSound';
const cqSoundEntry = locale => ({
    name: locale === 'en' ? 'Sound' : 'Son',
    extensionId: CQ_SOUND_ID,
    iconURL: soundIconURL,
    rawURL: soundIconURL,
    insetIconURL: soundInsetIconURL,
    description: locale === 'en' ?
        'Play sounds and change the volume.' :
        'Joue des sons et change le volume.',
    featured: true
});

const messages = defineMessages({
    extensionTitle: {
        defaultMessage: 'Choose an Extension',
        description: 'Heading for the extension library',
        id: 'gui.extensionLibrary.chooseAnExtension'
    },
    extensionUrl: {
        defaultMessage: 'Enter the URL of the extension',
        description: 'Prompt for unoffical extension url',
        id: 'gui.extensionLibrary.extensionUrl'
    }
});

class ExtensionLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect'
        ]);
    }
    handleItemSelect (item) {
        const id = item.extensionId;
        if (id === CQ_SOUND_ID) {
            this.props.onEnableSound();
            // Wait for the toolbox to gain the Sound category before scrolling to it.
            setTimeout(() => this.props.onCategorySelected('sound'));
            return;
        }
        let url = item.extensionURL ? item.extensionURL : id;
        if (!item.disabled && !id) {
            // eslint-disable-next-line no-alert
            url = prompt(this.props.intl.formatMessage(messages.extensionUrl));
        }
        if (id && !item.disabled) {
            if (this.props.vm.extensionManager.isExtensionLoaded(url)) {
                this.props.onCategorySelected(id);
            } else {
                this.props.vm.extensionManager.loadExtensionURL(url).then(() => {
                    this.props.onCategorySelected(id);
                });
            }
        }
    }
    render () {
        const extensionLibraryThumbnailData = [cqSoundEntry(this.props.intl.locale)].concat(
            extensionLibraryContent
                .filter(extension => CQ_OFFERED_EXTENSIONS.includes(extension.extensionId))
                .map(extension => ({
                    rawURL: extension.iconURL || extensionIcon,
                    ...extension
                }))
        );
        return (
            <LibraryComponent
                data={extensionLibraryThumbnailData}
                filterable={false}
                id="extensionLibrary"
                title={this.props.intl.formatMessage(messages.extensionTitle)}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

ExtensionLibrary.propTypes = {
    intl: intlShape.isRequired,
    onCategorySelected: PropTypes.func,
    onEnableSound: PropTypes.func,
    onRequestClose: PropTypes.func,
    visible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired // eslint-disable-line react/no-unused-prop-types
};

const mapDispatchToProps = dispatch => ({
    onEnableSound: () => dispatch(setSoundMod(true))
});

export default injectIntl(connect(null, mapDispatchToProps)(ExtensionLibrary));
