var fs = require('fs');
var cities;
 
fs.readFile('cities.csv', 'utf8', function(err, contents) {
 if(err) console.log('Error reading the file');
    else{
     console.log('Success reading the file');
     cities = csvJSON(contents);
     checkDistributionPermision();
    } 
});


//var csv is the CSV file with headers
function csvJSON(csv){

  var lines=csv.split("\n");

  var result = {};

  var countryIndex=lines[0].split(",").length-1;
  var stateIndex=countryIndex-1;
  var cityIndex=stateIndex-1;
  var country, state, city;

  for(var i=1;i<lines.length;i++){
    if(lines[i]){
      var currentline=lines[i].split(",");

      country =  currentline[countryIndex].replace(/\s/g,'').toUpperCase();
      if(!result[country]) result[country] = {};

      state = currentline[stateIndex].replace(/\s/g,'').toUpperCase();
      if(!result[country][state]) result[country][state] = {};

      city = currentline[cityIndex].replace(/\s/g,'').toUpperCase();
      if(!result[country][state][city]) result[country][state][city] = true;
    }
  }

  //return result; //JavaScript object
  return result; //JSON
}

var DistributorFactory = function(include=[],exclude=[],inheritedDistributor=[]){
  this.include = include;
  this.exclude = exclude;
  this.inheritedDistributor = inheritedDistributor;
  this.availableCities = {};
  this.setAvailableCities = function(){
    for(let distributor in this.inheritedDistributor){
      this.include.concat(distributor.include);
      this.exclude.concat(distributor.exclude);
    }

    for(let inc of this.include){
      var incArr = inc.split('-');
      if(incArr.length==1){
        this.availableCities[inc] = JSON.parse(JSON.stringify(cities[inc]));
      }
      if(incArr.length==2){
        if(!this.availableCities[incArr[1]]) this.availableCities[incArr[1]] = {};
        this.availableCities[incArr[1]][incArr[0]] = JSON.parse(JSON.stringify(cities[incArr[1]][incArr[0]]));
      }
      if(incArr.length==3){
        if(!this.availableCities[incArr[2]]) this.availableCities[incArr[2]] = {};
        if(!this.availableCities[incArr[2]][incArr[1]]) this.availableCities[incArr[2]][incArr[1]] = {};
        this.availableCities[incArr[2]][incArr[1]][incArr[0]] = cities[incArr[2]][incArr[1]][incArr[0]];
      }
    }

    for(let exc of this.exclude){
      var excArr = exc.split('-');
      if(excArr.length==1){
        this.availableCities[exc] = {};
      }
      if(excArr.length==2){
        if(this.availableCities[excArr[1]])
        this.availableCities[excArr[1]][excArr[0]] = {};
      }
      if(excArr.length==3){
        if(this.availableCities[excArr[2]] && this.availableCities[excArr[2]][excArr[1]]) 
        this.availableCities[excArr[2]][excArr[1]][excArr[0]] = false;
      }
    }
  }
  this.setAvailableCities();

  this.checkPermission = function(cityInfo){
      var infoArr = cityInfo.split('-');
      if(infoArr.length==3){
        if(this.availableCities[infoArr[2]] && this.availableCities[infoArr[2]][infoArr[1]] && this.availableCities[infoArr[2]][infoArr[1]][infoArr[0]]) return 'YES';
        else return 'NO';
      }
      else {
        console.log('insufficient information');
        return 'NO';
      }
  }
}

function checkDistributionPermision(){
  var distributor1 = new DistributorFactory(['INDIA','UNITEDSTATES'],['KARNATAKA-INDIA','CHENNAI-TAMILNADU-INDIA']);

  var distributor2 = new DistributorFactory(['INDIA'],['TAMILNADU-INDIA'],[distributor1]);

  var distributor3 = new DistributorFactory(['HUBLI-KARNATAKA-INDIA'],[],[distributor1,distributor2]);

  console.log('Checking permision for distributor1 : ', distributor1.checkPermission('CHICAGO-ILLINOIS-UNITEDSTATES'));

  console.log('Checking permision for distributor2 : ', distributor2.checkPermission('CHICAGO-ILLINOIS-UNITEDSTATES'));

  console.log('Checking permision for distributor3 : ', distributor3.checkPermission('HUBLI-KARNATAKA-INDIA'));

  console.log('Checking permision for distributor3 : ', distributor3.checkPermission('WADI-KARNATAKA-INDIA'));
}