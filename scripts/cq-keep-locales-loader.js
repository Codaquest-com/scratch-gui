/**
 * Webpack loader that strips every translation except the ones Codaquest offers
 * (see src/lib/cq-locales.js) from the two generated catalogs that ship every
 * Scratch language: scratch-l10n's editor messages and scratch-blocks' block
 * messages. Only French and English can ever be selected, so the rest is dead
 * weight a child's browser would otherwise download.
 */
const KEEP = ['fr', 'en'];

const keepEditorMessages = source => {
    const body = source.slice(source.indexOf('export default') + 'export default'.length)
        .trim()
        .replace(/;\s*$/, '');
    const all = JSON.parse(body);
    const kept = {};
    for (const code of KEEP) {
        if (!all[code]) throw new Error(`cq-keep-locales-loader: editor messages lack "${code}"`);
        kept[code] = all[code];
    }
    return `export default ${JSON.stringify(kept)};\n`;
};

const BLOCK_LOCALE = /^Blockly\.ScratchMsgs\.locales\["([^"]+)"\] =$/m;

const keepBlockMessages = source => {
    const parts = source.split(/(?=^Blockly\.ScratchMsgs\.locales\["[^"]+"\] =$)/m);
    const kept = parts.filter((part, index) => {
        if (index === 0) return true;
        return KEEP.includes(part.match(BLOCK_LOCALE)[1]);
    });
    if (kept.length !== KEEP.length + 1) {
        throw new Error('cq-keep-locales-loader: block messages lack a kept locale');
    }
    const last = kept[kept.length - 1];
    if (!last.includes('// End of combined translations')) {
        kept[kept.length - 1] = `${last.trimEnd()}\n// End of combined translations\n`;
    }
    return kept.join('');
};

module.exports = function (source) {
    if (this.resourcePath.endsWith('editor-msgs.js')) return keepEditorMessages(source);
    if (this.resourcePath.endsWith('scratch_msgs.js')) return keepBlockMessages(source);
    return source;
};
