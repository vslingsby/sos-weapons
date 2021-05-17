const csv = require('csv-parser');
const fs = require('fs');
const currencyUtils = require('./currency.js');

let results = [];
fs.createReadStream('data/weapons.csv')
  .pipe(csv(['name', 'type', 'hands', 'reach', 'swing', 'thrust', 'def', 'qualities', 'wt', 'cost']))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    let parsed = parseResults(results);
    //console.log(JSON.stringify(parsed));

    fs.appendFile('weapons.json', JSON.stringify(parsed), (err) => {
      if (err) throw err;
      console.log('Saved!')
    })
  });

function parseResults(items) {
  let weapons = [];
  items.forEach(item => {
    let weapon = parseWeapon(item);
    weapons.push(weapon);
  })
  return weapons;
}

function parseWeapon(item) {
  let weapon = {};

  weapon.name = item.name;
  weapon.type = parseType(item.type);
  weapon.cost = parseCost(item.cost);
  weapon.swing = parseAttack(item.swing);
  weapon.thrust = parseAttack(item.thrust);
  weapon.defence = parseDefence(item.def);
  weapon.wt = parseInt(item.wt);
  weapon.qualities = parseQualities(item.qualities);
  console.log(JSON.stringify(weapon));
  return weapon;
}

function parseAttack(attackString) {
  if (attackString === '-') {
    return {};
  }
  let regex = /([0-9]+)\(([0-9+-pbc]+)\)/
  let match = attackString.match(regex);
  let tn = match[1];
  let damageString = match[2];
  damageString = damageString.split("/");
  let attack = {};
  attack.tn = tn;
  attack.damage = [];
  damageString.forEach( chunk => {
    let obj = {};
    let mod = 1;
    if (chunk[0] === '-') {
      mod = -1;
    }
    let type = chunk[chunk.length - 1];
    chunk = chunk.substring(1);
    chunk = chunk.substring(0, chunk.length - 1);
    obj.type = type;
    obj.value = mod * parseInt(chunk);
    attack.damage.push(obj);
  })
  return attack;
}

function parseCost(costString) {
  return currencyUtils.parseCurrency(costString);
}

function parseDefence(defenceString) {
  if (defenceString === '-') {
    return {};
  }
  let regex = /([0-9]+)\(([0-9]+)\)/;
  let match = defenceString.match(regex);
  let obj = {};
  obj.tn = match[1];
  obj.guard = match[2];
  return obj;
}

function parseQualities(qualitiesString) {
  qualities = [];
  let chunks = qualitiesString.split(", ");
  //console.log(chunks);
  chunks.filter(chunk => chunk != "-" && chunk).forEach(chunk => {
    let regex = /([A-z \(\)]+) ?([0-9]+)?/
    let match = chunk.match(regex);
    //console.log(chunk);
    //console.log(match)
    let quality = match[1];
    let value = 0;
    if (typeof match[2] !== undefined) {
      value = match[2];
    }
    let obj = {
      name: quality.trim()
    }
    if (value > 0) {
      obj.level = value;
    }
    qualities.push(obj);
  })
  return qualities;

}

function parseReach(reachString) {
  let reaches = ['HA', 'H', 'S', 'M', 'L', 'VL', 'EL', 'LL'];
  return reaches.indexOf(reachString) + 1;
}

function parseType(typeString) {
  let types = typeString.toLowerCase().split(', ');
  return types;
}

function parseHands(handsString) {
  return parseInt(handsString[0]);
}
