const Null = {};
Null.fromModel = model => {
    const nullModel = {
        name: `Null${model.name}`,
        properties: [],
        methods: [],
    };
    for ( const prop of model.properties ) {
        nullModel.properties.push({
            name: prop.name,
            getter: () => {
                throw new Error('tried to get information from a Null class');
            },
            setter: () => {},
        });
    }
    for ( const method of model.methods ) {
        nullModel.methods.push({
            name: method.name,
            instance: () => {},
        });
    }
    return nullModel;
};
Null.fromClass = cls => Null.fromModel(cls.toModel({ deep: true }));

module.exports = { Null };
