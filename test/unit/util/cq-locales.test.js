import cqLocales, {CQ_DEFAULT_LOCALE, CQ_LOCALE_CODES} from '../../../src/lib/cq-locales.js';
import {detectLocale} from '../../../src/lib/detect-locale.js';

const setBrowserLanguage = language => {
    Object.defineProperty(window.navigator, 'language', {value: language, configurable: true});
};

const setSearch = search => {
    Object.defineProperty(window.location, 'search', {value: search, configurable: true});
};

describe('Codaquest locales', () => {
    test('offers French and English only', () => {
        expect(Object.keys(cqLocales)).toEqual(['fr', 'en']);
        expect(cqLocales.fr.name).toEqual('Français');
        expect(cqLocales.en.name).toEqual('English');
    });

    test('starts in French when the browser asks for another language', () => {
        setSearch('');
        setBrowserLanguage('nl-BE');
        expect(detectLocale(CQ_LOCALE_CODES, CQ_DEFAULT_LOCALE)).toEqual('fr');
    });

    test('ignores a URL locale outside French and English', () => {
        setSearch('?locale=es');
        setBrowserLanguage('nl-BE');
        expect(detectLocale(CQ_LOCALE_CODES, CQ_DEFAULT_LOCALE)).toEqual('fr');
    });

    test('keeps an English browser in English', () => {
        setSearch('');
        setBrowserLanguage('en-GB');
        expect(detectLocale(CQ_LOCALE_CODES, CQ_DEFAULT_LOCALE)).toEqual('en');
    });

    test('lets the URL pick English', () => {
        setSearch('?locale=en');
        setBrowserLanguage('fr-BE');
        expect(detectLocale(CQ_LOCALE_CODES, CQ_DEFAULT_LOCALE)).toEqual('en');
    });
});
