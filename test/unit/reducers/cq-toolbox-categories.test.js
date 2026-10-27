/* eslint-env jest */
import cqToolboxCategoriesReducer, {setToolboxCategories} from '../../../src/reducers/cq-toolbox-categories';
import makeToolboxXML from '../../../src/lib/make-toolbox-xml';

const categoryIds = xml => Array.from(xml.matchAll(/<category[^>]*\sid="([^"]+)"/g), match => match[1]);

test('the toolbox starts whole and follows setToolboxCategories', () => {
    expect(cqToolboxCategoriesReducer(undefined, {type: 'anything'})).toBeNull();
    expect(cqToolboxCategoriesReducer(null, setToolboxCategories(['motion', 'events']))).toEqual(['motion', 'events']);
    expect(cqToolboxCategoriesReducer(['motion'], setToolboxCategories(null))).toBeNull();
});

test('a project that is not an exercise keeps every category', () => {
    expect(categoryIds(makeToolboxXML(false, false, 'sprite'))).toEqual(
        ['motion', 'looks', 'events', 'control', 'sensing', 'operators', 'variables']
    );
});

test('an exercise shows only the categories its level uses, in the usual order', () => {
    const xml = makeToolboxXML(false, false, 'sprite', [], '', '', '', undefined, false, ['control', 'events', 'motion']);

    expect(categoryIds(xml)).toEqual(['motion', 'events', 'control']);
});

test('the Sound mod still shows Sound when the level hides the rest', () => {
    const xml = makeToolboxXML(false, false, 'sprite', [], '', '', '', undefined, true, ['motion', 'events']);

    expect(categoryIds(xml)).toEqual(['motion', 'events', 'sound']);
});
