// global var - Userdata
var userObj = null;
var credentials = null;

function saveToken(obj) {
    console.log('Saving Token Object to session');
    setJSONSessionItem('credentials', obj);
}

function jumpToLogin() {
    console.log('Jumping to login page');
    document.location.href = 'anmelden.html';
}

function validateTokenExistence() {
    console.log('Validating Existence of Token');

    // if nothing in session we can break away
    if (!existsSessionItem('credentials')) {
        console.log('No token in session storage, break away');
        //alert('Sie sind nicht angemeldet');
        jumpToLogin();
    } else {
        console.log('Token exists in Session');
    }
}

function validateTokenFromSession() {
    console.log('Validating Token from Session against Service');
    
    // credentials/token has to be in session!!!!
    credentials = getJSONSessionItem('credentials');

    $.ajax({
        url: 'http://localhost:8000/api/token/validate',
        method: 'get',
        contentType: 'application/json; charset=utf-8',
        cache: false,
        dataType: 'json',
        headers: { 'Authorization': 'Bearer ' + credentials.token }
    }).done(function (response) {
        console.log('Token is valid', response);

        // set the received response to the global object
        userObj = response;

        // call now the main function/logic which processes the intended job
        //doTheMainJob();
    }).fail(function (jqXHR, statusText, error) {
        console.log('Token is invalid -> jump to login page');
        console.log('Response Code: ' + jqXHR.status + ' - Fehlermeldung: ' + jqXHR.responseText);

        //alert('Sie sind nicht angemeldet bzw. haben keinen Zugang');
        jumpToLogin();
    });
}