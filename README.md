# ini-data
INI parser and serializer for JavaScript.

## Usage

### parse()
Let's say you have this INI file (named **config.ini**):

```
; this is a comment
key = value

[details]
user = root
password = thepassword

[database.main.values]
key1 = value1
key2 = value2
```

You can parse the file into an object like so:

```javascript
const fs = require('fs');
const iniConfig = require('ini-data');

const text = fs.readFileSync('ini.config', 'utf-8');
const obj = iniConfig.parse(text);

console.log(obj.key);  // value
console.log(obj.details.password);  // thepassword
console.log(obj.database.main.values.key1)  // value1
```

### stringify()

```javascript
const ini = require('ini-data');
const fs = require('fs');

const obj = {
  user: {
    name: 'root',
    password: 'thepassword',
    details: {
      item1: 'value1',
    }
  },
  key: 'value'
};
fs.writeFileSync('data.ini', ini.stringify(obj));
```

**data.ini** will contain the following INI data:
```
key = value

[user]
name = root
password = thepassword

[user.details]
item1 = value1
```