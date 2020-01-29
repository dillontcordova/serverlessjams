module.exports = {
    createUpdateExp: function( tableName, id, optsToUpdate, updateExp='set', conditional='attribute_exists(id)' ) {

        let expAttrNames    = {};
        let expAttrValues   = {};
        updateExp           += ' ';
        const updateKeys    = Object.keys(optsToUpdate);
        const keysLen       = updateKeys.length;

        updateKeys.forEach( (key, index) => {
            let name            = `#${key}`;
            expAttrNames[name]  = key;

            let randStr             = Math.random().toString(36).substring(7);
            let value               = `:${randStr}`;
            expAttrValues[value]    = optsToUpdate[key];

            updateExp += index < keysLen-1 ? `${name} = ${value}, `: `${name} = ${value}`;
        });

        return {
            TableName: tableName,
            Key: {
                id: id
            },
            UpdateExpression            : updateExp,
            ConditionExpression         : conditional,
            ExpressionAttributeNames    : expAttrNames,
            ExpressionAttributeValues   : expAttrValues,
            ReturnValues                : "ALL_NEW"
        };
    }
}