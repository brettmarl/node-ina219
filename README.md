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


## Classes
<dl>
<dt><a href="#Ina219">Ina219</a></dt>
<dd></dd>
</dl>
## Typedefs
<dl>
<dt><a href="#onCompleteCallback">onCompleteCallback</a> : <code>function</code></dt>
<dd><p>Callback for standard oncomplete</p>
</dd>
<dt><a href="#onHaveValueCallback">onHaveValueCallback</a> : <code>function</code></dt>
<dd><p>Callback for returning a single value</p>
</dd>
</dl>
<a name="Ina219"></a>
## Ina219
**Kind**: global class  

* [Ina219](#Ina219)
  * [new Ina219()](#new_Ina219_new)
  * [.init(address, device)](#Ina219+init)
  * [.enableLogging(enable)](#Ina219+enableLogging)
  * [.writeRegister(register, value, callback)](#Ina219+writeRegister)
  * [.readRegister(register, callback)](#Ina219+readRegister)
  * [.calibrate32V1A(callback)](#Ina219+calibrate32V1A)
  * [.log(s)](#Ina219+log)
  * [.getBusVoltage_raw(callback)](#Ina219+getBusVoltage_raw)
  * [.getShuntVoltage_raw(callback)](#Ina219+getShuntVoltage_raw)
  * [.getCurrent_raw(callback)](#Ina219+getCurrent_raw)
  * [.getBusVoltage_V(callback)](#Ina219+getBusVoltage_V)
  * [.getShuntVoltage_mV(callback)](#Ina219+getShuntVoltage_mV)
  * [.getCurrent_mA(callback)](#Ina219+getCurrent_mA)

<a name="new_Ina219_new"></a>
### new Ina219()
Ina219 is the main class exported from the Node module

<a name="Ina219+init"></a>
### ina219.init(address, device)
Called to initilize the INA219 board, you should calibrate it after this.

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | Address you want to use. Defaults to INA219_ADDRESS |
| device | <code>string</code> | Device to connect to. Defaults to "/dev/i2c-1" |

<a name="Ina219+enableLogging"></a>
### ina219.enableLogging(enable)
Enabled debug logging to console.log

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| enable | <code>bool</code> | True to enable, False to disable |

<a name="Ina219+writeRegister"></a>
### ina219.writeRegister(register, value, callback)
Reads a 16 bit value over I2C

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| register | <code>integer</code> | Register to read from (One of INA219_REG_*) |
| value | <code>integer</code> | Value to be written |
| callback | <code>writeRegisterCallback</code> | Callback to be invoked when complete |

<a name="Ina219+readRegister"></a>
### ina219.readRegister(register, callback)
Reads a 16 bit value over I2C

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| register | <code>integer</code> | Register to read from (One of INA219_REG_*) |
| callback | <code>[onHaveValueCallback](#onHaveValueCallback)</code> | Callback to be invoked when complete |

<a name="Ina219+calibrate32V1A"></a>
### ina219.calibrate32V1A(callback)
Configures to INA219 to be able to measure up to 32V and 1A of current.
 Each unit of current corresponds to 40uA, and each unit of power corresponds
 to 800mW. Counter overflow occurs at 1.3A.
 Note: These calculations assume a 0.1 ohm resistor is present

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>[onCompleteCallback](#onCompleteCallback)</code> | Callback to be invoked when complete |

<a name="Ina219+log"></a>
### ina219.log(s)
Logs a string to the console if logging enabled

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | String to log |

<a name="Ina219+getBusVoltage_raw"></a>
### ina219.getBusVoltage_raw(callback)
Reads the raw bus voltage

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>[onHaveValueCallback](#onHaveValueCallback)</code> | Callback to be invoked when complete. |

<a name="Ina219+getShuntVoltage_raw"></a>
### ina219.getShuntVoltage_raw(callback)
Reads the raw shunt voltage

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>[onHaveValueCallback](#onHaveValueCallback)</code> | Callback to be invoked when complete. |

<a name="Ina219+getCurrent_raw"></a>
### ina219.getCurrent_raw(callback)
Reads the raw current value

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>[onHaveValueCallback](#onHaveValueCallback)</code> | Callback to be invoked when complete. |

<a name="Ina219+getBusVoltage_V"></a>
### ina219.getBusVoltage_V(callback)
Gets the bus voltage in volts

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>[onHaveValueCallback](#onHaveValueCallback)</code> | Callback to be invoked when complete. |

<a name="Ina219+getShuntVoltage_mV"></a>
### ina219.getShuntVoltage_mV(callback)
Gets the shunt voltage in mV (so +-327mV)

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>[onHaveValueCallback](#onHaveValueCallback)</code> | Callback to be invoked when complete. |

<a name="Ina219+getCurrent_mA"></a>
### ina219.getCurrent_mA(callback)
Gets the current value in mA, taking into account the config settings and current LSB

**Kind**: instance method of <code>[Ina219](#Ina219)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>[onHaveValueCallback](#onHaveValueCallback)</code> | Callback to be invoked when complete. |

<a name="onCompleteCallback"></a>
## onCompleteCallback : <code>function</code>
Callback for standard oncomplete

**Kind**: global typedef  
<a name="onHaveValueCallback"></a>
## onHaveValueCallback : <code>function</code>
Callback for returning a single value

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>int</code> | value returned by async operation |

