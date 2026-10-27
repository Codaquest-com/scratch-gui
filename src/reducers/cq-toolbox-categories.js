// Codaquest: the block categories an exercise shows. Codabox answers them with
// the exercise's steps (static/cq-steps.js), so a child on the first level
// picks from Motion, Events and Control rather than from every block Scratch
// has, and each level adds the categories its exercises use. Null, the
// default, is the whole toolbox, which every project that is not an exercise
// keeps. The action type is spelled out in cq-steps.js too, which dispatches
// it from outside the bundle.
const SET_TOOLBOX_CATEGORIES = 'scratch-gui/cq-toolbox-categories/SET_TOOLBOX_CATEGORIES';

const initialState = null;

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_TOOLBOX_CATEGORIES:
        return Array.isArray(action.categories) ? action.categories.slice() : null;
    default:
        return state;
    }
};

const setToolboxCategories = categories => ({
    type: SET_TOOLBOX_CATEGORIES,
    categories: categories
});

export {
    reducer as default,
    initialState as cqToolboxCategoriesInitialState,
    setToolboxCategories
};
