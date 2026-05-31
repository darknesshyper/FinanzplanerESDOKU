const helper = require('../helper.js');

class AusgabeDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = 'SELECT * FROM Ausgabe WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result))
            throw new Error('No Record found by id=' + id);

        return result;
    }

    loadAllByBenutzer(benutzerId) {
        var sql = 'SELECT * FROM Ausgabe WHERE benutzerId=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(benutzerId);

        if (helper.isArrayEmpty(result))
            return [];

        return result;
    }

    loadAll() {
        var sql = 'SELECT * FROM Ausgabe';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Ausgabe WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1)
            return true;

        return false;
    }

    create(benutzerId, bezeichnung = '', geldbetrag = 0, kategorie = '', datum = '') {
        var sql = 'INSERT INTO Ausgabe (benutzerId, bezeichnung, geldbetrag, kategorie, datum) VALUES (?,?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [benutzerId, bezeichnung, geldbetrag, kategorie, datum];
        var result = statement.run(params);

        if (result.changes != 1)
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, bezeichnung = '', geldbetrag = 0, kategorie = '', datum = '') {
        var sql = 'UPDATE Ausgabe SET bezeichnung=?, geldbetrag=?, kategorie=?, datum=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, geldbetrag, kategorie, datum, id];
        var result = statement.run(params);

        if (result.changes != 1)
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM Ausgabe WHERE id=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1)
                throw new Error('Could not delete Record by id=' + id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message);
        }
    }

    toString() {
        console.log('AusgabeDao [_conn=' + this._conn + ']');
    }
}

module.exports = AusgabeDao;
