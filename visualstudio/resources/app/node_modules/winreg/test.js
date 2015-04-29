
var Registry = require(__dirname+'/lib/registry.js')

// create a registry client
,   r1 =  new Registry({
      hive: Registry.HKCU,
      key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
    })
,   r2 = new Registry({
      hive: Registry.HKCU,
      key:  '\\Control Panel\\Desktop'
    })

// get parent key
console.log('parent of "'+r2.path+'" -> "'+r2.parent.path+'"');

// list subkeys
r2
.   keys(function (err, items) {
      
      if (!err)
        for (var i in items)
          console.log('subkey of "'+r2.path+'": '+items[i].path);
      
      // list values
      r1
      .   values(function (err, items) {
            
            if (!err)
              console.log(JSON.stringify(items, null, '\t'));
            
            // query named value
            r1
            .   get(items[0].name, function (err, item) {
                  
                  if (!err)
                    console.log(JSON.stringify(item, null, '\t'));
                  
                  // add value
                  r1
                  .   set('bla', Registry.REG_SZ, 'hello world!', function (err) {
                        
                        if (!err)
                          console.log('value written');
                        
                        // delete value
                        r1
                        .   remove('bla', function (err) {
                              
                              if (!err)
                                console.log('value deleted');
                              
                            })
                        ;
                      })
                  ;
                })
            ;
          })
      ;

    })
;
