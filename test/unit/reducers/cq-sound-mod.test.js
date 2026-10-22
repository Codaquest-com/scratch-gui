/* eslint-env jest */
import cqSoundModReducer, {projectUsesSound, setSoundMod} from '../../../src/reducers/cq-sound-mod';

const MEOW = '83c36d806dc92327b9e7049a565c6bff';
const RECORDED = '0123456789abcdef0123456789abcdef';

const target = ({opcodes = [], sounds = []}) => ({
    blocks: {_blocks: opcodes.reduce((all, opcode, i) => Object.assign(all, {[i]: {opcode}}), {})},
    getSounds: () => sounds.map(assetId => ({assetId}))
});
const vmWith = (...targets) => ({runtime: {targets}});

test('the Sound mod starts hidden and follows setSoundMod', () => {
    expect(cqSoundModReducer(undefined, {type: 'anything'})).toBe(false);
    expect(cqSoundModReducer(false, setSoundMod(true))).toBe(true);
});

test('the stock project, whose sprite only meows, does not use sound', () => {
    expect(projectUsesSound(vmWith(target({opcodes: ['event_whenflagclicked'], sounds: [MEOW]})))).toBe(false);
});

test('a sound block uses sound', () => {
    expect(projectUsesSound(vmWith(target({}), target({opcodes: ['sound_play'], sounds: [MEOW]})))).toBe(true);
});

test('a recorded or uploaded sound uses sound even before any block plays it', () => {
    expect(projectUsesSound(vmWith(target({sounds: [MEOW, RECORDED]})))).toBe(true);
});
