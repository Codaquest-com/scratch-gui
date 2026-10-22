import soundLibraryContent from '../lib/libraries/sounds.json';
import spriteLibraryContent from '../lib/libraries/sprites.json';

// Codaquest: the Sound category and the Sounds tab stay hidden until the child
// adds "Sound" from the extension library, like Pen. A project that already
// uses sound blocks, or holds a sound the child made, turns it on by itself
// when it loads.
const SET_SOUND_MOD = 'scratch-gui/cq-sound-mod/SET_SOUND_MOD';

const initialState = false;

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_SOUND_MOD:
        return action.enabled;
    default:
        return state;
    }
};

const setSoundMod = enabled => ({
    type: SET_SOUND_MOD,
    enabled: enabled
});

let stockSoundIds = null;
const isStockSound = assetId => {
    if (!stockSoundIds) {
        stockSoundIds = new Set(soundLibraryContent.map(sound => sound.assetId));
        spriteLibraryContent.forEach(sprite => {
            (sprite.sounds || []).forEach(sound => stockSoundIds.add(sound.assetId));
        });
    }
    return stockSoundIds.has(assetId);
};

/**
 * A recorded, uploaded or edited sound has an asset no library ships, so only
 * the Sounds tab can have made it.
 * @param {VirtualMachine} vm - the VM holding the project
 * @return {boolean} whether any sprite or the stage has a sound block or a sound the child made
 */
const projectUsesSound = vm => vm.runtime.targets.some(target => {
    const blocks = target.blocks && target.blocks._blocks;
    const hasSoundBlock = !!blocks && Object.keys(blocks).some(id => blocks[id].opcode.startsWith('sound_'));
    return hasSoundBlock || target.getSounds().some(sound => !isStockSound(sound.assetId));
});

export {
    reducer as default,
    initialState as cqSoundModInitialState,
    setSoundMod,
    projectUsesSound
};
