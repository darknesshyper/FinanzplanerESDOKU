const helper = require('../helper.js');
const AusgabeDao = require('../dao/ausgabeDao.js');
const express = require('express');
const { validateTokenAndGetUserId } = require('./token.js');
var serviceRouter = express.Router();

console.log('- Service Ausgabe');


serviceRouter.get('/ausgabe/gib/:id', function(request, response) {
    console.log('Service Ausgabe: Client requested one record, id=' + request.params.id);

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const ausgabeDao = new AusgabeDao(request.app.locals.dbConnection);
    try {
        var obj = ausgabeDao.loadById(request.params.id);
        console.log('Service Ausgabe: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Ausgabe: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/ausgabe/alle', function(request, response) {
    console.log('Service Ausgabe: Client requested all records');

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const ausgabeDao = new AusgabeDao(request.app.locals.dbConnection);
    try {
        var arr = ausgabeDao.loadAllByBenutzer(benutzerId);
        console.log('Service Ausgabe: Records loaded for user ' + benutzerId + ', count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Ausgabe: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/ausgabe/existiert/:id', function(request, response) {
    console.log('Service Ausgabe: Client requested check, if record exists, id=' + request.params.id);

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const ausgabeDao = new AusgabeDao(request.app.locals.dbConnection);
    try {
        var exists = ausgabeDao.exists(request.params.id);
        console.log('Service Ausgabe: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({ 'id': request.params.id, 'existiert': exists });
    } catch (ex) {
        console.error('Service Ausgabe: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/ausgabe', function(request, response) {
    console.log('Service Ausgabe: Client requested creation of new record');

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    var errorMsgs = [];
    if (helper.isEmpty(request.body.bezeichnung))
        errorMsgs.push('bezeichnung fehlt');
    if (helper.isEmpty(request.body.geldbetrag)) {
        errorMsgs.push('geldbetrag fehlt');
    } else if (!helper.isNumeric(request.body.geldbetrag)) {
        errorMsgs.push('geldbetrag muss eine Zahl sein');
    }
    if (helper.isEmpty(request.body.kategorie)) {
        errorMsgs.push('kategorie fehlt');
    } else {
        const allowedCategories = [
            'Miete/Wohnen',
            'Nebenkosten',
            'Lebensmittel',
            'Transport/Benzin',
            'Versicherungen',
            'Internet/Handy',
            'Freizeit',
            'Restaurants/Essen gehen',
            'Kleidung',
            'Gesundheit/Apotheke',
            'Abonnements',
            'Bildung/Weiterbildung',
            'Reisen/Urlaub',
            'Haushalt',
            'Sonstiges'
        ];

        request.body.kategorie = request.body.kategorie.trim();

        if (!allowedCategories.includes(request.body.kategorie)) {
            errorMsgs.push('kategorie ungültig. Erlaubte Werte: ' + allowedCategories.join(', '));
        }
    }
    if (helper.isEmpty(request.body.datum))
        errorMsgs.push('datum fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Ausgabe: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const ausgabeDao = new AusgabeDao(request.app.locals.dbConnection);
    try {
        var obj = ausgabeDao.create(benutzerId, request.body.bezeichnung, request.body.geldbetrag, request.body.kategorie, request.body.datum);
        console.log('Service Ausgabe: Record inserted for user ' + benutzerId);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Ausgabe: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.put('/ausgabe', function(request, response) {
    console.log('Service Ausgabe: Client requested update of existing record');

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    var errorMsgs = [];
    if (helper.isUndefined(request.body.id))
        errorMsgs.push('id fehlt');
    if (helper.isEmpty(request.body.bezeichnung))
        errorMsgs.push('bezeichnung fehlt');
    if (helper.isEmpty(request.body.geldbetrag)) {
        errorMsgs.push('geldbetrag fehlt');
    } else if (!helper.isNumeric(request.body.geldbetrag)) {
        errorMsgs.push('geldbetrag muss eine Zahl sein');
    } else if (request.body.geldbetrag <= 0) {
        errorMsgs.push('geldbetrag muss eine Zahl > 0 sein');
    }
    if (helper.isEmpty(request.body.kategorie)) {
        errorMsgs.push('kategorie fehlt');
    } else {
        const allowedCategories = [
            'Miete/Wohnen',
            'Nebenkosten',
            'Lebensmittel',
            'Transport/Benzin',
            'Versicherungen',
            'Internet/Handy',
            'Freizeit',
            'Restaurants/Essen gehen',
            'Kleidung',
            'Gesundheit/Apotheke',
            'Abonnements',
            'Bildung/Weiterbildung',
            'Reisen/Urlaub',
            'Haushalt',
            'Sonstiges'
        ];
        
        request.body.kategorie = request.body.kategorie.trim();
        
        if (!allowedCategories.includes(request.body.kategorie)) {
            errorMsgs.push('kategorie ungültig. Erlaubte Werte: ' + allowedCategories.join(', '));
        }
    }
    if (helper.isEmpty(request.body.datum))
        errorMsgs.push('datum fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Ausgabe: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const ausgabeDao = new AusgabeDao(request.app.locals.dbConnection);
    try {
        var obj = ausgabeDao.loadById(request.body.id);
        if (obj.benutzerId != benutzerId) {
            console.log('Service Ausgabe: Datensatz gehoert nicht dem Benutzer');
            response.status(403).json({ 'fehler': true, 'nachricht': 'Zugriff verweigert' });
            return;
        }
        var updatedObj = ausgabeDao.update(request.body.id, request.body.bezeichnung, request.body.geldbetrag, request.body.kategorie, request.body.datum);
        console.log('Service Ausgabe: Record updated, id=' + request.body.id);
        response.status(200).json(updatedObj);
    } catch (ex) {
        console.error('Service Ausgabe: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.delete('/ausgabe/:id', function(request, response) {
    console.log('Service Ausgabe: Client requested deletion of record, id=' + request.params.id);

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const ausgabeDao = new AusgabeDao(request.app.locals.dbConnection);
    try {
        var obj = ausgabeDao.loadById(request.params.id);
        if (obj.benutzerId != benutzerId) {
            console.log('Service Ausgabe: Datensatz gehoert nicht dem Benutzer');
            response.status(403).json({ 'fehler': true, 'nachricht': 'Zugriff verweigert' });
            return;
        }
        ausgabeDao.delete(request.params.id);
        console.log('Service Ausgabe: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Ausgabe: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;