const helper = require('../helper.js');
const KontostandDao = require('../dao/kontostandDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Kontostand');

serviceRouter.get('/kontostand/gib', function(request, response) {
    console.log('Service Kontostand: Client requested current kontostand');

    const kontostandDao = new KontostandDao(request.app.locals.dbConnection);
    try {
        var arr = kontostandDao.loadAll();
        if (arr && arr.length > 0) {
            console.log('Service Kontostand: Startwert loaded = ' + arr[0].startwert);
            response.status(200).json({ 'startwert': arr[0].startwert, 'id': arr[0].id });
        } else {
            response.status(200).json({ 'startwert': 0, 'id': null });
        }
    } catch (ex) {
        console.error('Service Kontostand: Error loading kontostand. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.put('/kontostand', function(request, response) {
    console.log('Service Kontostand: Client requested to update kontostand');

    var errorMsgs = [];
    if (helper.isUndefined(request.body.startwert)) 
        errorMsgs.push('startwert fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Kontostand: update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const kontostandDao = new KontostandDao(request.app.locals.dbConnection);
    try {
        var arr = kontostandDao.loadAll();
        var startwert = parseFloat(request.body.startwert);
        
        if (arr && arr.length > 0) {
            // Update existing
            var result = kontostandDao.update(arr[0].id, startwert);
            console.log('Service Kontostand: Record updated, new startwert=' + result.startwert);
            response.status(200).json({ 'startwert': result.startwert, 'nachricht': 'Kontostand erfolgreich gespeichert' });
        } else {
            // Create new
            var result = kontostandDao.create(startwert);
            console.log('Service Kontostand: Record created, new startwert=' + result.startwert);
            response.status(200).json({ 'startwert': result.startwert, 'nachricht': 'Kontostand erfolgreich gespeichert' });
        }
    } catch (ex) {
        console.error('Service Kontostand: Error updating record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

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

    const kontostandDao = new KontostandDao(request.app.locals.dbConnection);
    try {
        var arr = kontostandDao.loadAll();
        console.log('Service Kontostand: Records loaded, count=' + arr.length);
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
        var obj = kontostandDao.create(request.body.startwert);
        console.log('Service Kontostand: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Kontostand: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/kontostand/:id', function(request, response) {
    console.log('Service Kontostand: Client requested update of existing record');

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
        var obj = kontostandDao.update(request.body.id, request.body.startwert);
        console.log('Service Kontostand: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Kontostand: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/kontostand/:id', function(request, response) {
    console.log('Service Kontostand: Client requested deletion of record, id=' + request.params.id);

    const kontostandDao = new KontostandDao(request.app.locals.dbConnection);
    try {
        var obj = kontostandDao.loadById(request.params.id);
        kontostandDao.delete(request.params.id);
        console.log('Service Kontostand: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Kontostand: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;