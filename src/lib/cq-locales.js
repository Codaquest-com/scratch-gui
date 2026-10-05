import locales from 'scratch-l10n';

/**
 * Codaquest offers Scratch in French and English only, the two languages of the LMS.
 * French is the default whenever neither the URL nor the browser asks for one of them.
 */
const CQ_LOCALE_CODES = ['fr', 'en'];
const CQ_DEFAULT_LOCALE = 'fr';

const cqLocales = CQ_LOCALE_CODES.reduce((picked, code) => {
    picked[code] = locales[code];
    return picked;
}, {});

export {
    cqLocales as default,
    CQ_DEFAULT_LOCALE,
    CQ_LOCALE_CODES
};
