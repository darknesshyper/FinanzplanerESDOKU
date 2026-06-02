const helper = require('../helper.js');
const KontostandDao = require('../dao/kontostandDao.js');
const express = require('express');
const { validateTokenAndGetUserId } = require('./token.js');
var serviceRouter = express.Router();

console.log('- Service Kontostand');


serviceRouter.get('/kontostand/gib/:id', function(request, response) {
    console.log('Service Kontostand: Client requested one record, id=' + request.params.id);

    const kontostandDao = new KontostandDao(request.app.locals.dbConnection);
    try {
        var obj = kontostandDao.loadById(request.params.id);
        console.log('Service Kontostand: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Kontostand: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/kontostand/alle', function(request, response) {
    console.log('Service Kontostand: Client requested all records');

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const kontostandDao = new KontostandDao(request.app.locals.dbConnection);
    try {
        var arr = kontostandDao.loadAllByBenutzer(benutzerId);
        console.log('Service Kontostand: Records loaded for user ' + benutzerId + ', count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Kontostand: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/kontostand/existiert/:id', function(request, response) {
    console.log('Service Kontostand: Client requested check, if record exists, id=' + request.params.id);

    const kontostandDao = new KontostandDao(request.app.locals.dbConnection);
    try {
        var exists = kontostandDao.exists(request.params.id);
        console.log('Service Kontostand: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error('Service Kontostand: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/kontostand', function(request, response) {
    console.log('Service Kontostand: Client requested creation of new record');

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    var errorMsgs=[];
    if (helper.isEmpty(request.body.startwert)) 
        errorMsgs.push('startwert fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Kontostand: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const kontostandDao = new KontostandDao(request.app.locals.dbConnection);
    try {
        var obj = kontostandDao.create(benutzerId, request.body.startwert);
        console.log('Service Kontostand: Record inserted for user ' + benutzerId);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Kontostand: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/kontostand/:id', function(request, response) {
    console.log('Service Kontostand: Client requested update of existing record');

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isEmpty(request.body.startwert)) 
        errorMsgs.push('startwert fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Kontostand: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const kontostandDao = new KontostandDao(request.app.locals.dbConnection);
    try {
        var obj = kontostandDao.loadById(request.body.id);
        if (obj.benutzerId != benutzerId) {
            console.log('Service Kontostand: Datensatz gehoert nicht dem Benutzer');
            response.status(403).json({ 'fehler': true, 'nachricht': 'Zugriff verweigert' });
            return;
        }
        var updatedObj = kontostandDao.update(request.body.id, request.body.startwert);
        console.log('Service Kontostand: Record updated, id=' + request.body.id);
        response.status(200).json(updatedObj);
    } catch (ex) {
        console.error('Service Kontostand: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/kontostand/:id', function(request, response) {
    console.log('Service Kontostand: Client requested deletion of record, id=' + request.params.id);

    var benutzerId = validateTokenAndGetUserId(request, response);
    if (benutzerId === null) return;

    const kontostandDao = new KontostandDao(request.app.locals.dbConnection);
    try {
        var obj = kontostandDao.loadById(request.params.id);
        if (obj.benutzerId != benutzerId) {
            console.log('Service Kontostand: Datensatz gehoert nicht dem Benutzer');
            response.status(403).json({ 'fehler': true, 'nachricht': 'Zugriff verweigert' });
            return;
        }
        kontostandDao.delete(request.params.id);
        console.log('Service Kontostand: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Kontostand: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;