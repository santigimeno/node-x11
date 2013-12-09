var x11 = require('../../lib');
var async = require('async');

x11.createClient(function(err, display) {
    var X = display.client;
   
    function quotize(i) { return '\"' + i + '\"'; }
    function decodeProperty(type, data, cb) {
        var i;
        var result;
        var err;
        switch(type) {
            case 'STRING': 
                result = [];
                var s = '';
                for (i = 0; i < data.length; ++i) {
                    if (data[i] == 0) {
                       result.push(s);
                       s = '';
                       continue;
                    }
                    
                    s += String.fromCharCode(data[i]);
                }
                
                if (s.length > 0) {
                    result.push(s);
                }
                
                return cb(err, result);

            case 'ATOM':
                var atoms = [];
                for (i = 0; i < data.length; i += 4) {
                    atoms.push(data.unpack('L', i)[0]);
                }

                return async.map(
                    atoms,
                    function(atom, cb) {
                        X.GetAtomName(atom, cb);
                    },
                    cb
                );

            case 'INTEGER':
            case 'WINDOW':
            case 'CARDINAL':
               result = [];
               for (i = 0; i < data.length; i += 4) {
                   result.push(data.unpack('L', i)[0]);
               }

               return cb(err, result);  
  
            default:
               return cb(new Error('Decoding type: ' + type + ' is unsupported'));
        }
    }

    var id = parseInt(process.argv[2]);
    var root = display.screen[0].root;
    X.ListProperties(id, function(err, props) {
        props.forEach(function(p) {
            X.GetProperty(0, id, p, 0, 0, 10000000, function(err, propValue) {
                X.GetAtomName(propValue.type, function(err, typeName) {
                    X.GetAtomName(p, function(err, propName) {
                        decodeProperty(typeName, propValue.data, function(err, decodedData) {
                            console.log(propName + '(' + typeName + ') = ' + decodedData);
                        });
                    });
                });
            });
        })   
    });
    X.on('event', console.log);
    X.on('error', console.error);
});
