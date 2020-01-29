function drill(accum, key) {
    if (typeof accum === 'undefined') {
        return accum;
    }

    return accum[key];
}

module.exports = function drillDown(parent, descendents) {
    return descendents.reduce(drill, parent);
};
