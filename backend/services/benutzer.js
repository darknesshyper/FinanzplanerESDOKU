const helper = require('../helper.js');
const BenutzerDao = require('../dao/benutzerDao.js');
const express = require('express');
const { validateTokenAndGetUserId } = require('./token.js');
var serviceRouter = express.Router();

console.log('- Service Benutzer');

serviceRouter.get('/benutzer/gib/:id', function (request, response) {
    console.log('Service Benutzer: Client requested one record, id=' + request.params.id);

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerDao.loadById(request.params.id);
        console.log('Service Benutzer: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzer: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzer/aktuell', function (request, response) {
    console.log('Service Benutzer: Client requested actual record');

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var arr = benutzerDao.loadNameById(benutzerId);
        console.log('Service Benutzer: Records loaded for user ' + benutzerId + ', count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Benutzer: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzer/alle', function (request, response) {
    console.log('Service Benutzer: Client requested all records');

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var arr = benutzerDao.loadAll();
        console.log('Service Benutzer: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Benutzer: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzer/existiert/:id', function (request, response) {
    console.log('Service Benutzer: Client requested check, if record exists, id=' + request.params.id);

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var exists = benutzerDao.exists(request.params.id);
        console.log('Service Benutzer: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({ 'id': request.params.id, 'existiert': exists });
    } catch (ex) {
        console.error('Service Benutzer: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzer/eindeutig/:email', function (request, response) {
    console.log('Service Benutzer: Client requested check, if email is unique', request.params.email);

    var errorMsgs = [];
    if (helper.isUndefined(request.params.email))
        errorMsgs.push('email fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: check not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var unique = benutzerDao.isunique(request.params.email);
        console.log('Service Benutzer: Check if unique, unique=' + unique);
        response.status(200).json({ 'email': request.params.email, 'eindeutig': unique });
    } catch (ex) {
        console.error('Service Benutzer: Error checking if unique. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzer/check/:email/:passwort', function (request, response) {
    console.log('Service Benutzer: Client requested check, if user has access for/with', request.params.email, request.params.passwort);

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    var errorMsgs = [];
    if (helper.isUndefined(request.params.email))
        errorMsgs.push('email fehlt');
    if (helper.isUndefined(request.params.passwort))
        errorMsgs.push('passwort fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: check not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var hasaccess = benutzerDao.hasaccess(request.params.email, request.params.passwort);
        console.log('Service Benutzer: Check if user has access, hasaccess=' + hasaccess);
        response.status(200).json(hasaccess);
    } catch (ex) {
        console.error('Service Benutzer: Error checking if user has access. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/benutzer', function (request, response) {
    console.log('Service Benutzer: Client requested creation of new record');

    var errorMsgs = [];
    if (helper.isUndefined(request.body.name))
        errorMsgs.push('name fehlt');
    if (helper.isUndefined(request.body.email))
        errorMsgs.push('email fehlt');
    if (helper.isUndefined(request.body.passwort))
        errorMsgs.push('passwort fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerDao.create(request.body.name, request.body.email, request.body.passwort);
        console.log('Service Benutzer: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzer: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.put('/benutzer', function (request, response) {
    console.log('Service Benutzer: Client requested update of existing record');

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    var errorMsgs = [];
    if (helper.isUndefined(request.body.id))
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.name))
        errorMsgs.push('name fehlt');
    if (helper.isUndefined(request.body.email))
        errorMsgs.push('email fehlt');
    if (helper.isUndefined(request.body.neuespasswort))
        request.body.neuespasswort = null;

    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerDao.update(request.body.id, request.body.name, request.body.email, request.body.neuespasswort);
        console.log('Service Benutzer: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzer: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.delete('/benutzer/:id', function (request, response) {
    console.log('Service Benutzer: Client requested deletion of record, id=' + request.params.id);

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerDao.loadById(request.params.id);
        benutzerDao.delete(request.params.id);
        console.log('Service Benutzer: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Benutzer: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;