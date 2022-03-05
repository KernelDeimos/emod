const conventionalConstructor = function ( ...args ) {
    for ( const o of args ) {
        if ( typeof o !== 'object' || Array.isArray(o) ) {
            throw new Error('conventional constructor only accepts objects');
        }
        for ( const [k, v] of Object.entries(o) ) {
            this[k] = v;
        }
    }
    if ( this.init && typeof this.init === 'function' ) {
        this.init();
    }
};

// Class depends on ParentOfBase to check if a class extends Base, because the
// class Base depends on Class (Class cannot reference Base).
class ParentOfBase {}

module.exports = { conventionalConstructor, ParentOfBase };
