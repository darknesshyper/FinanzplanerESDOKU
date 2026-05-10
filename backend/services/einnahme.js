const helper = require('../helper.js');
const EinnahmeDao = require('../dao/einnahmeDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Einnahme');

serviceRouter.get('/einnahme/gib/:id', function(request, response) {
    console.log('Service Einnahme: Client requested one record, id=' + request.params.id);

    const einnahmeDao = new EinnahmeDao(request.app.locals.dbConnection);
    try {
        var obj = einnahmeDao.loadById(request.params.id);
        console.log('Service Einnahme: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Einnahme: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/einnahme/alle', function(request, response) {
    console.log('Service Einnahme: Client requested all records');

    const einnahmeDao = new EinnahmeDao(request.app.locals.dbConnection);
    try {
        var arr = einnahmeDao.loadAll();
        console.log('Service Einnahme: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Einnahme: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/einnahme/existiert/:id', function(request, response) {
    console.log('Service Einnahme: Client requested check, if record exists, id=' + request.params.id);

    const einnahmeDao = new EinnahmeDao(request.app.locals.dbConnection);
    try {
        var exists = einnahmeDao.exists(request.params.id);
        console.log('Service Einnahme: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error('Service Einnahme: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/einnahme', function(request, response) {
    console.log('Service Einnahme: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');
    if (helper.isUndefined(request.body.geldbetrag)) {
        errorMsgs.push('geldbetrag fehlt');
    } else if (!helper.isNumeric(request.body.geldbetrag)) {
        errorMsgs.push('geldbetrag muss eine Zahl sein');
    }
   if (helper.isUndefined(request.body.kategorie)) {
        errorMsgs.push('kategorie fehlt');
    } else {
        const allowedCategories = [
            'Gehalt/Lohn',
            'Nebenjob',
            'Bonus/Prämien',
            'Zinsen',
            'Mieteinnahmen',
            'Staatliche Leistungen',
            'Geschenke',
            'Sonstiges'
        ];

        request.body.kategorie = request.body.kategorie.trim();
        
        if (!allowedCategories.includes(request.body.kategorie)) {
            errorMsgs.push('kategorie ungültig. Erlaubte Werte: ' + allowedCategories.join(', '));
        }
    }
    if (helper.isUndefined(request.body.datum)) 
        errorMsgs.push('datum fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Einnahme: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const einnahmeDao = new EinnahmeDao(request.app.locals.dbConnection);
    try {
        var obj = einnahmeDao.create(request.body.bezeichnung, request.body.geldbetrag, request.body.kategorie, request.body.datum);
        console.log('Service Einnahme: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Einnahme: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/einnahme', function(request, response) {
    console.log('Service Einnahme: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');
    if (helper.isUndefined(request.body.geldbetrag)) {
        errorMsgs.push('geldbetrag fehlt');
    } else if (!helper.isNumeric(request.body.geldbetrag)) {
        errorMsgs.push('geldbetrag muss eine Zahl sein');
    } else if (request.body.geldbetrag <= 0) {
        errorMsgs.push('geldbetrag muss eine Zahl > 0 sein');
    }
    if (helper.isUndefined(request.body.kategorie)) {
        errorMsgs.push('kategorie fehlt');
    } else {
        const allowedCategories = [
            'Gehalt/Lohn',
            'Nebenjob',
            'Bonus/Prämien',
            'Zinsen',
            'Mieteinnahmen',
            'Staatliche Leistungen',
            'Geschenke',
            'Sonstiges'
        ];

        request.body.kategorie = request.body.kategorie.trim();
        
        if (!allowedCategories.includes(request.body.kategorie)) {
            errorMsgs.push('kategorie ungültig. Erlaubte Werte: ' + allowedCategories.join(', '));
        }
    }
    if (helper.isUndefined(request.body.datum)) 
        errorMsgs.push('datum fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Einnahme: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const einnahmeDao = new EinnahmeDao(request.app.locals.dbConnection);
    try {
        var obj = einnahmeDao.update(request.body.id, request.body.bezeichnung, request.body.geldbetrag, request.body.kategorie, request.body.datum);
        console.log('Service Einnahme: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Einnahme: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/einnahme/:id', function(request, response) {
    console.log('Service Einnahme: Client requested deletion of record, id=' + request.params.id);

    const einnahmeDao = new EinnahmeDao(request.app.locals.dbConnection);
    try {
        var obj = einnahmeDao.loadById(request.params.id);
        einnahmeDao.delete(request.params.id);
        console.log('Service Einnahme: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Einnahme: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;