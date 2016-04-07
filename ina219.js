"use strict";
/*
 * Node driver for Adafruit INA219 ported from https://github.com/adafruit/Adafruit_INA219
 */
var i2c = require('../i2c-bus');	// https://github.com/fivdi/i2c-bus

/**
 * Ina219 is the main class exported from the Node module
 * @class Ina219
 */
var Ina219 = function() {}


/**
 * Callback for standard oncomplete
 *
 * @callback onCompleteCallback
 */

/**
 * Callback for returning a single value
 *
 * @callback onHaveValueCallback
 * @param {int} value - value returned by async operation 
 */

// ===========================================================================
//   I2C ADDRESS/BITS
// ==========================================================================
var INA219_ADDRESS                         	= 0x40    ; // 1000000 (A0+A1=GND)
var INA219_ADDRESS_A0                      	= 0x41    ; 
var INA219_ADDRESS_A1                      	= 0x44    ; 
var INA219_ADDRESS_A0_A1                   	= 0x45    ;

var INA219_READ 							= 0x01; 
// ===========================================================================
//    CONFIG REGISTER (R/W)
// ===========================================================================
var INA219_REG_CONFIG                      	= 0x00;

// ===========================================================================
var INA219_CONFIG_RESET                    	= 0x8000  ; // Reset Bit
var INA219_CONFIG_BVOLTAGERANGE_MASK       	= 0x2000  ; // Bus Voltage Range Mask
var INA219_CONFIG_BVOLTAGERANGE_16V        	= 0x0000  ; // 0-16V Range
var INA219_CONFIG_BVOLTAGERANGE_32V        	= 0x2000  ; // 0-32V Range

var INA219_CONFIG_GAIN_MASK                	= 0x1800  ; // Gain Mask
var INA219_CONFIG_GAIN_1_40MV              	= 0x0000  ; // Gain 1, 40mV Range
var INA219_CONFIG_GAIN_2_80MV              	= 0x0800  ; // Gain 2, 80mV Range
var INA219_CONFIG_GAIN_4_160MV             	= 0x1000  ; // Gain 4, 160mV Range
var INA219_CONFIG_GAIN_8_320MV             	= 0x1800  ; // Gain 8, 320mV Range

var INA219_CONFIG_BADCRES_MASK             	= 0x0780  ; // Bus ADC Resolution Mask
var INA219_CONFIG_BADCRES_9BIT             	= 0x0080  ; // 9-bit bus res = 0..511
var INA219_CONFIG_BADCRES_10BIT            	= 0x0100  ; // 10-bit bus res = 0..1023
var INA219_CONFIG_BADCRES_11BIT            	= 0x0200  ; // 11-bit bus res = 0..2047
var INA219_CONFIG_BADCRES_12BIT            	= 0x0400  ; // 12-bit bus res = 0..4097

var INA219_CONFIG_SADCRES_MASK             	= 0x0078  ; // Shunt ADC Resolution and Averaging Mask
var INA219_CONFIG_SADCRES_9BIT_1S_84US     	= 0x0000  ; // 1 x 9-bit shunt sample
var INA219_CONFIG_SADCRES_10BIT_1S_148US   	= 0x0008  ; // 1 x 10-bit shunt sample
var INA219_CONFIG_SADCRES_11BIT_1S_276US   	= 0x0010  ; // 1 x 11-bit shunt sample
var INA219_CONFIG_SADCRES_12BIT_1S_532US   	= 0x0018  ; // 1 x 12-bit shunt sample
var INA219_CONFIG_SADCRES_12BIT_2S_1060US  	= 0x0048  ; // 2 x 12-bit shunt samples averaged together
var INA219_CONFIG_SADCRES_12BIT_4S_2130US  	= 0x0050  ; // 4 x 12-bit shunt samples averaged together
var INA219_CONFIG_SADCRES_12BIT_8S_4260US  	= 0x0058  ; // 8 x 12-bit shunt samples averaged together
var INA219_CONFIG_SADCRES_12BIT_16S_8510US 	= 0x0060  ; // 16 x 12-bit shunt samples averaged together
var INA219_CONFIG_SADCRES_12BIT_32S_17MS   	= 0x0068  ; // 32 x 12-bit shunt samples averaged together
var INA219_CONFIG_SADCRES_12BIT_64S_34MS   	= 0x0070  ; // 64 x 12-bit shunt samples averaged together
var INA219_CONFIG_SADCRES_12BIT_128S_69MS  	= 0x0078  ; // 128 x 12-bit shunt samples averaged together

var INA219_CONFIG_MODE_MASK                	= 0x0007  ; // Operating Mode Mask
var INA219_CONFIG_MODE_POWERDOWN 			= 0x0000;
var INA219_CONFIG_MODE_SVOLT_TRIGGERED 	 	= 0x0001;
var INA219_CONFIG_MODE_BVOLT_TRIGGERED 	 	= 0x0002;
var INA219_CONFIG_MODE_SANDBVOLT_TRIGGERED 	= 0x0003;
var INA219_CONFIG_MODE_ADCOFF 			 	= 0x0004;
var INA219_CONFIG_MODE_SVOLT_CONTINUOUS 	= 0x0005;
var INA219_CONFIG_MODE_BVOLT_CONTINUOUS 	= 0x0006;
var INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS	= 0x0007;


// ===========================================================================
//   SHUNT VOLTAGE REGISTER (R)
// ===========================================================================
var INA219_REG_SHUNTVOLTAGE                	= 0x01
// ===========================================================================

// ===========================================================================
//   BUS VOLTAGE REGISTER (R)
// ===========================================================================
var INA219_REG_BUSVOLTAGE                  	= 0x02
// ===========================================================================

// ===========================================================================
//   POWER REGISTER (R)
// ===========================================================================
var INA219_REG_POWER                       	= 0x03
// ===========================================================================

// ==========================================================================
//    CURRENT REGISTER (R)
// ===========================================================================
var INA219_REG_CURRENT                     	= 0x04
// ===========================================================================

// ===========================================================================
//    CALIBRATION REGISTER (R/W)
// ===========================================================================
var INA219_REG_CALIBRATION                 	= 0x05
// ===========================================================================



/**
  * Called to initilize the INA219 board, you should calibrate it after this.
  * @param {onCompleteCallback} callback - Callback to be invoked when complete
  * @param {string} address - Address you want to use. Defaults to INA219_ADDRESS
  * @param {string} device - Device to connect to. Defaults to "/dev/i2c-1"
  */
Ina219.prototype.init = function (address, device) {

	// defaults
	address = typeof address !== 'undefined' ? address : INA219_ADDRESS;
	device = typeof device !== 'undefined' ? device : '/dev/i2c-1';
	
	this.log("init:: " + address + " | " + device)
	this.currentDivider_mA = 0;
	this.powerDivider_mW = 0;
	this.calValue = 0;
	this.address = address;
	
	this.wire = i2c.openSync(1);	// 1 == /dev/ic2-1
	
	//this.wire = new i2c(address, { device: device }); // point to your i2c address, debug provides REPL interface
}



/**
  * Enabled debug logging to console.log
  * @param {bool} enable - True to enable, False to disable
  */
Ina219.prototype.enableLogging  = function (enable) {

	this.loggingEnabled = enable;
}

/**
  * Reads a 16 bit value over I2C
  * @param {integer} register - Register to read from (One of INA219_REG_*)
  * @param {integer} value - Value to be written
  * @param {writeRegisterCallback} callback - Callback to be invoked when complete
  */
Ina219.prototype.writeRegister  = function (register, value, callback) {

	var bytes = new Buffer(2);

	bytes[0] = (value >> 8) & 0xFF;
	bytes[1] = value & 0xFF
		 
	this.wire.writeI2cBlockSync(this.address, register, 2, bytes);
	callback(null);		 
}

var FIX_TWOS_BUG = true;

function twosToInt(val, len)
{
	if (val & (1<< len -1))
		val =  val - (1>>len);
	
	return val;
}
/**
  * Reads a 16 bit value over I2C
  * @param {integer} register - Register to read from (One of INA219_REG_*)
  * @param {onHaveValueCallback} callback - Callback to be invoked when complete
  */
Ina219.prototype.readRegister  = function (register, callback) {

	var res = new Buffer(2);
	
	this.wire.readI2cBlockSync(this.address, register, 2, res);
	
	var value;
	
	// Shift values to create properly formed integer
if (FIX_TWOS_BUG)
{
	if (res[0] >> 7 == 1)
	{
		value = res[0] * 256 + res[1];
		value = twosToInt(value, 16);
	}
	else
		value = res[0] << 8 | res[1];
}
else
value = res[0] << 8 | res[1];
	
	this.log("::readRegister => [" + res[0] + ", " + res[1] + "]");
		
	callback(value);
}

/**
  *  Configures to INA219 to be able to measure up to 32V and 1A of current.
  *  Each unit of current corresponds to 40uA, and each unit of power corresponds
  *  to 800mW. Counter overflow occurs at 1.3A.
  *  Note: These calculations assume a 0.1 ohm resistor is present
  *
  * @param {onCompleteCallback} callback - Callback to be invoked when complete
  */
Ina219.prototype.calibrate32V1A  = function (callback) {

	this.log("calibrate32V1A");
		
	// By default we use a pretty huge range for the input voltage,
	// which probably isn't the most appropriate choice for system
	// that don't use a lot of power.  But all of the calculations
	// are shown below if you want to change the settings.  You will
	// also need to change any relevant register settings, such as
	// setting the VBUS_MAX to 16V instead of 32V, etc.
	
	// VBUS_MAX = 32V		(Assumes 32V, can also be set to 16V)
	// VSHUNT_MAX = 0.32	(Assumes Gain 8, 320mV, can also be 0.16, 0.08, 0.04)
	// RSHUNT = 0.1			(Resistor value in ohms)
	
	// 1. Determine max possible current
	// MaxPossible_I = VSHUNT_MAX / RSHUNT
	// MaxPossible_I = 3.2A
	
	// 2. Determine max expected current
	// MaxExpected_I = 1.0A
	
	// 3. Calculate possible range of LSBs (Min = 15-bit, Max = 12-bit)
	// MinimumLSB = MaxExpected_I/32767
	// MinimumLSB = 0.0000305             (30.5�A per bit)
	// MaximumLSB = MaxExpected_I/4096
	// MaximumLSB = 0.000244              (244�A per bit)
	
	// 4. Choose an LSB between the min and max values
	//    (Preferrably a roundish number close to MinLSB)
	// CurrentLSB = 0.0000400 (40�A per bit)
	
	// 5. Compute the calibration register
	// Cal = trunc (0.04096 / (Current_LSB * RSHUNT))
	// Cal = 10240 (0x2800)

	this.calValue = 10240;

	// 6. Calculate the power LSB
	// PowerLSB = 20 * CurrentLSB
	// PowerLSB = 0.0008 (800�W per bit)
	
	// 7. Compute the maximum current and shunt voltage values before overflow
	//
	// Max_Current = Current_LSB * 32767
	// Max_Current = 1.31068A before overflow
	//
	// If Max_Current > Max_Possible_I then
	//    Max_Current_Before_Overflow = MaxPossible_I
	// Else
	//    Max_Current_Before_Overflow = Max_Current
	// End If
	//
	// ... In this case, we're good though since Max_Current is less than MaxPossible_I
	//
	// Max_ShuntVoltage = Max_Current_Before_Overflow * RSHUNT
	// Max_ShuntVoltage = 0.131068V
	//
	// If Max_ShuntVoltage >= VSHUNT_MAX
	//    Max_ShuntVoltage_Before_Overflow = VSHUNT_MAX
	// Else
	//    Max_ShuntVoltage_Before_Overflow = Max_ShuntVoltage
	// End If
	
	// 8. Compute the Maximum Power
	// MaximumPower = Max_Current_Before_Overflow * VBUS_MAX
	// MaximumPower = 1.31068 * 32V
	// MaximumPower = 41.94176W
	
	// Set multipliers to convert raw current/power values
	this.currentDivider_mA = 25;      // Current LSB = 40uA per bit (1000/40 = 25)
  	this.powerDivider_mW = 1;         // Power LSB = 800�W per bit
  
	var $this = this;
	this.writeRegister(INA219_REG_CALIBRATION, this.calValue, function(err) {

		$this.log("INA219_REG_CALIBRATION done: " + err);
				
		var config =    INA219_CONFIG_BVOLTAGERANGE_32V |
						INA219_CONFIG_GAIN_8_320MV |
						INA219_CONFIG_BADCRES_12BIT |
						INA219_CONFIG_SADCRES_12BIT_1S_532US |
						INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS;

		$this.writeRegister(INA219_REG_CONFIG, config, function(err)  {
			
			$this.log("INA219_REG_CONFIG done: " + config + ": " + err);
			callback();
		});
	});

}


/**
  *  Configures to INA219 to be able to measure up to 32V and 2A of current.
  *  Each unit of current corresponds to 40uA, and each unit of power corresponds
  *  to 800mW. Counter overflow occurs at 1.3A.
  *  Note: These calculations assume a 0.1 ohm resistor is present
  *
  * @param {onCompleteCallback} callback - Callback to be invoked when complete
  */

Ina219.prototype.calibrate32V2A  = function (callback) {

	this.log("calibrate32V2A");
		
	// By default we use a pretty huge range for the input voltage,
	// which probably isn't the most appropriate choice for system
	// that don't use a lot of power.  But all of the calculations
	// are shown below if you want to change the settings.  You will
	// also need to change any relevant register settings, such as
	// setting the VBUS_MAX to 16V instead of 32V, etc.
	
	// VBUS_MAX = 32V		(Assumes 32V, can also be set to 16V)
	// VSHUNT_MAX = 0.32	(Assumes Gain 8, 320mV, can also be 0.16, 0.08, 0.04)
	// RSHUNT = 0.1			(Resistor value in ohms)
	
	// 1. Determine max possible current
	// MaxPossible_I = VSHUNT_MAX / RSHUNT
	// MaxPossible_I = 3.2A
	
	// 2. Determine max expected current
  // MaxExpected_I = 2.0A
	
  // 3. Calculate possible range of LSBs (Min = 15-bit, Max = 12-bit)
  // MinimumLSB = MaxExpected_I/32767
  // MinimumLSB = 0.000061              (61uA per bit)
  // MaximumLSB = MaxExpected_I/4096
  // MaximumLSB = 0,000488              (488uA per bit)
  
  // 4. Choose an LSB between the min and max values
  //    (Preferrably a roundish number close to MinLSB)
  // CurrentLSB = 0.0001 (100uA per bit)
  
  // 5. Compute the calibration register
  // Cal = trunc (0.04096 / (Current_LSB * RSHUNT))
  // Cal = 4096 (0x1000)

	this.calValue = 4096;

	 // 6. Calculate the power LSB
  // PowerLSB = 20 * CurrentLSB
  // PowerLSB = 0.002 (2mW per bit)
  
  // 7. Compute the maximum current and shunt voltage values before overflow
  //
  // Max_Current = Current_LSB * 32767
  // Max_Current = 3.2767A before overflow
  //
  // If Max_Current > Max_Possible_I then
  //    Max_Current_Before_Overflow = MaxPossible_I
  // Else
  //    Max_Current_Before_Overflow = Max_Current
  // End If
  //
  // Max_ShuntVoltage = Max_Current_Before_Overflow * RSHUNT
  // Max_ShuntVoltage = 0.32V
  //
  // If Max_ShuntVoltage >= VSHUNT_MAX
  //    Max_ShuntVoltage_Before_Overflow = VSHUNT_MAX
  // Else
  //    Max_ShuntVoltage_Before_Overflow = Max_ShuntVoltage
  // End If
  
  // 8. Compute the Maximum Power
  // MaximumPower = Max_Current_Before_Overflow * VBUS_MAX
  // MaximumPower = 3.2 * 32V
  // MaximumPower = 102.4W
	
	// Set multipliers to convert raw current/power values
	this.currentDivider_mA = 10;      // Current LSB = 40uA per bit (1000/40 = 25)
  	this.powerDivider_mW = 2;         // Power LSB = 800�W per bit
  
	var $this = this;
	this.writeRegister(INA219_REG_CALIBRATION, this.calValue, function(err) {

		$this.log("INA219_REG_CALIBRATION done: " + err);

		var config =    INA219_CONFIG_BVOLTAGERANGE_32V |
						INA219_CONFIG_GAIN_8_320MV |
						INA219_CONFIG_BADCRES_12BIT |
						INA219_CONFIG_SADCRES_12BIT_1S_532US |
						INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS;

		$this.writeRegister(INA219_REG_CONFIG, config, function(err)  {
			
			$this.log("INA219_REG_CONFIG done: " + err);

			callback();
		});
	});

}

/**
  * Logs a string to the console if logging enabled
  * @param {string} s - String to log
  */
Ina219.prototype.log  = function (s) {
	
	if (this.loggingEnabled)
		console.log(s);
}

/**
  * Reads the raw bus voltage 
  * @param {onHaveValueCallback} callback - Callback to be invoked when complete. 
  */
Ina219.prototype.getBusVoltage_raw  = function (callback) {

	this.log("getBusVoltage_raw");

	var $this = this;
	this.readRegister(INA219_REG_BUSVOLTAGE, function (value) {

		$this.log("getBusVoltage_raw RET: " + value);

		//  Shift to the right 3 to drop CNVR and OVF and multiply by LSB
		callback( (value >> 3) * 4);

	});
}


/**
  * Reads the raw shunt voltage 
  * @param {onHaveValueCallback} callback - Callback to be invoked when complete. 
  */
Ina219.prototype.getShuntVoltage_raw  = function (callback) {

	this.log("getShuntVoltage_raw");
	var $this = this;
	this.readRegister(INA219_REG_SHUNTVOLTAGE, function (value) {

		$this.log("getShuntVoltage_raw RET: " + value);
		callback(value);
    });
}

/**
  * Reads the raw current value 
  * @param {onHaveValueCallback} callback - Callback to be invoked when complete. 
  */
Ina219.prototype.getCurrent_raw  = function (callback) {

	this.log("getCurrent_raw");

	// Sometimes a sharp load will reset the INA219, which will
	// reset the cal register, meaning CURRENT and POWER will
	// not be available ... avoid this by always setting a cal
	// value even if it's an unfortunate extra step
	var	$this = this;
	this.writeRegister(INA219_REG_CALIBRATION, this.calValue, function(err) {
			
		// Now we can safely read the CURRENT register!
		$this.readRegister(INA219_REG_CURRENT, function (value) {

			$this.log("getCurrent_raw RET: " + value);
			callback(value);
		});			  
	});
}


/**
  *  Gets the bus voltage in volts 
  * @param {onHaveValueCallback} callback - Callback to be invoked when complete. 
  */
Ina219.prototype.getBusVoltage_V  = function (callback) {

	this.getBusVoltage_raw(function(result) {
		callback(result * 0.001);
	});
	
}



/**
  * Gets the shunt voltage in mV (so +-327mV) 
  * @param {onHaveValueCallback} callback - Callback to be invoked when complete. 
  */
Ina219.prototype.getShuntVoltage_mV  = function (callback) {

	this.getShuntVoltage_raw(function(result) {
		callback(result * 0.01);
	});
}

/**
  * Gets the current value in mA, taking into account the config settings and current LSB
  * @param {onHaveValueCallback} callback - Callback to be invoked when complete. 
  */

Ina219.prototype.getCurrent_mA  = function (callback) {

	var $this = this;
	this.getCurrent_raw(function(value) {
		callback( value / $this.currentDivider_mA);
	});
}

	
// export is a Singleton
module.exports = new Ina219();

