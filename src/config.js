var json = {};


const settings = fetch('/settings.json'
    ,{
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
    }
    )
    .then(function(response){
        return response.json();
    })
    .then(function(myJson) {
        console.log(myJson);
        return myJson;
    });

console.log(settings);

export {settings};
