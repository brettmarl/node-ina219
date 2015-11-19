# node-ina219
Node.js Driver for Adafruit INA219


# Install

````bash 
$ npm install ina219
````

##Usage

```javascript

  var ina219 = require('ina219');

  ina219.init();
  ina219.enableLogging(true);
  
  ina219.calibrate32V1A(function () {
    
    ina219.getBusVoltage_V(function (volts) {
	  
      console.log("Voltage: " + volts);
      ina219.getCurrent_mA(function (current){
  			
        console.log("Current (mA): " + current );
      });	
    });
  });
```

