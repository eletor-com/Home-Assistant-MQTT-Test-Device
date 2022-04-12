const mqtt = require('mqtt')

const host = '192.168.1.241'
const port = '1883'
//const clientId = `Test_12345`

const id ="1234539";
const name = 'ELETOR_Sensor-W-' + id;
const userName = 'Silos-1'

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

const topic1 = 'homeassistant/sensor/'+name+'_W/config'


const device = {
  name: 'ELETOR Sensor-W '+ userName,
  model: "Sensor-W",
  manufacturer: "ELETOR",
  identifiers: ["Waga1"]
}
 

const conf1 = {
  device_class: "battery",
	name: "Scale",
	unique_id: name+'_W',
	unit_of_measurement: "kg",
	value_template: "{{ value_json.waga}}",
  state_topic: 'eletor/sensor/'+name+'/state',
  availability_topic: 'eletor/sensor/'+name+'/availability', 
  device
}



var s = { waga: 485.0 }

var myInterval


function sendConfig(){
  client.publish(topic1, JSON.stringify(conf1), { qos: 0, retain: true }, (error) => { if (error) {console.error(error)} })
  console.log('Send Config:', JSON.stringify(conf1))

  client.publish('eletor/sensor/'+name+'/availability', "online", { qos: 0, retain: true }, (error) => { if (error) {console.error(error)} })
}

function sendData(){
  s.waga = Math.round(100* (s.waga - (Math.random() * 0.2)) ) / 100;
  if (s.waga < 70) s.waga = 490;
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