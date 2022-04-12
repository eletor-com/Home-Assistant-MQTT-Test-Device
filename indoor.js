const mqtt = require('mqtt')

const host = '192.168.1.241'
const port = '1883'
//const clientId = `Test_12345`

const id ="123453";
const name = 'ELETOR_Sensor-THP-' + id;
const userName = 'Indoor'

const clientId = name

const connectUrl = `mqtt://${host}:${port}`
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'Login',
  password: 'Password',
  reconnectPeriod: 1000,
  will: { topic: 'eletor/sensor/'+name+'/availability', payload: 'offline' } 
})



const topicSysStatus = 'homeassistant/status'

const topic1 = 'homeassistant/sensor/'+name+'_T/config'
const topic2 = 'homeassistant/sensor/'+name+'_RH/config'
const topic3 = 'homeassistant/sensor/'+name+'_P/config'

const device = {
  name: 'ELETOR Sensor-THP '+ userName,
  model: "Sensor-THP",
  manufacturer: "ELETOR",
  identifiers: ["Czujnik1"]
}
 

const conf1 = {
  device_class: "temperature",
	name: "Temperature",
	unique_id: name+'_T',
	unit_of_measurement: "°C",
	value_template: "{{ value_json.temperature}}",
  state_topic: 'eletor/sensor/'+name+'/state',
  availability_topic: 'eletor/sensor/'+name+'/availability', 
  device
}

const conf2 = {
  device_class: "humidity",
  name: "Humidity",
	unique_id: name+'_RH',
  unit_of_measurement: "%",
  value_template: "{{ value_json.humidity}}",
  state_topic: 'eletor/sensor/'+name+'/state',
  availability_topic: 'eletor/sensor/'+name+'/availability', 
  device
}

const conf3 = {
  device_class: "pressure",
  name: "Pressure",
	unique_id: name+'_P',
  unit_of_measurement: "hPa",
  value_template: "{{ value_json.pressure}}",
  state_topic: 'eletor/sensor/'+name+'/state',
  availability_topic: 'eletor/sensor/'+name+'/availability', 
  device
}

var s = { temperature: 20.0, humidity: 60.0, pressure: 1014.00 }

var myInterval


function sendConfig(){
  client.publish(topic1, JSON.stringify(conf1), { qos: 0, retain: true }, (error) => { if (error) {console.error(error)} })
  console.log('Send Config:', JSON.stringify(conf1))
  client.publish(topic2, JSON.stringify(conf2), { qos: 0, retain: true }, (error) => { if (error) {console.error(error)} })
  client.publish(topic3, JSON.stringify(conf3), { qos: 0, retain: true }, (error) => { if (error) {console.error(error)} })

  client.publish('eletor/sensor/'+name+'/availability', "online", { qos: 0, retain: true }, (error) => { if (error) {console.error(error)} })
}

function sendData(){
  s.temperature = Math.round(100* (s.temperature + (Math.random() * 0.2) - 0.1) ) / 100;
  s.humidity = Math.round(100* (s.humidity + Math.random() - 0.5) ) / 100;
  s.pressure = Math.round(100* (s.pressure + ((Math.random()*3) - 1.5)) ) / 100;
  client.publish('eletor/sensor/'+name+'/state', JSON.stringify(s), { qos: 0, retain: false }, (error) => {})
  console.log('Send Message:', JSON.stringify(s))
}


function mqttConect(){
  client.on('connect', () => {
    console.log('Connected')
    client.subscribe([topicSysStatus], () => {
      console.log(`Subscribe to topic `)
    })
    sendConfig()
    myInterval = setInterval(sendData, 3000);
  })
}


client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString())
  if (topic.normalize() === topicSysStatus.normalize()){
    sendConfig()
  }
})


client.on('close',function(){
  console.log("connection closed")
  clearInterval(myInterval);
})


mqttConect()