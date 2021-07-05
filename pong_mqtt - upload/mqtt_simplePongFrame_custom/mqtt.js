
var reconnectTimeout = 2000;
var host="cha-cweb-dma.sjsu.edu";
var port=9001;
var username = "test";
var passwd = "HarveyDent";
function MQTTconnect(cname) {
console.log("connecting to "+ host +" "+ port);
console.log(cname);
mqtt = new Paho.MQTT.Client(host,port,cname);
var options = {
  userName: username,
  password: passwd,
  timeout: 3,
  onSuccess: onConnect,
  onFailure: onFailure
   };
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options); //connect
}

function onConnect() {
// Once a connection has been made, make a subscription and send a message.
console.log("Connected ");


  if (myClientName == "mserver" ) {
    console.log("server_subsribe " + mainTopicName);
    mqtt.subscribe(mainTopicName + "/#");
    serverNodeObject.nodeName = myClientName;
    serverNodeObject.nodeNumber = 0;
    serverNodeObject.ts = round(Date.now()/1000);
    console.log(serverNodeObject);
    nodeList.push(serverNodeObject);
    AfterStartServer();

  } else {

    console.log("player_subscribe " + mainTopicName);
    mqtt.subscribe(mainTopicName + "/mserver/#");
    nodeobject.nodeName = myClientName;
    nodeobject.nodeNumber = 0;
    nodeobject.ts = round(Date.now()/1000);
    console.log(nodeobject);
    console.log(st_topic_path);
    AfterStartClient();
    publishClientStartupMsg(nodeobject);  // make the client known to the server.

  }
    console.log("End onConnected ");
    playState = true;
}



function onFailure(message) {
  console.log("Connection Attempt to Host "+host+"Failed");
  setTimeout(MQTTconnect, reconnectTimeout);
}
