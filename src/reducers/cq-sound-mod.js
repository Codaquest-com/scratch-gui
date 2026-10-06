// Codaquest: the Sound category and the Sounds tab stay hidden until the child
// adds "Sound" from the extension library, like Pen. A project that already
// uses sound blocks turns it on by itself when it loads.
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

/**
 * @param {VirtualMachine} vm - the VM holding the project
 * @return {boolean} whether any sprite or the stage has a sound block
 */
const projectUsesSound = vm => vm.runtime.targets.some(target => {
    const blocks = target.blocks && target.blocks._blocks;
    return !!blocks && Object.keys(blocks).some(id => blocks[id].opcode.startsWith('sound_'));
});

export {
    reducer as default,
    initialState as cqSoundModInitialState,
    setSoundMod,
    projectUsesSound
};
