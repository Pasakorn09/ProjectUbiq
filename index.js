require('dotenv').config();
const request = require('request');
const express = require('express');
const port = process.env.PORT || 3001;
const _ = require('lodash');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// STATUS LED
let status = [false, false,false,false];   //Add Status
// TOPIC
const LED_TOPIC = `/ESP/LED`;
// Create a MQTT Client
const mqtt = require('mqtt');
// Create a client connection to CloudMQTT for live data
const client = mqtt.connect('mttq://tailor.cloudmqtt.com',  // Server MQTT ของเรานะ
{
  username: 'eqfqoyhu', // Username MQTT ของเรานะ
  password: 'm4LknnMs_D8n', // Password MQTT ของเรานะ
  port: 11596 // Port MQTT ของเรานะ
});
client.on('connect', function() { 
  // When connected
  console.log("Connected to CloudMQTT");
client.subscribe('/ESP/LED', function() {
    // when a message arrives, do something with it
    client.on('message', function(topic, message, packet) {
      switch(topic) {
        case LED_TOPIC:
          messageFromBuffer = message.toString('utf8');
          if (messageFromBuffer != 'GET') {
            const splitStatus = messageFromBuffer.split(',');
            if (splitStatus.length > 0) {
              splitStatus.map((ele, index)=> {
                console.log(`DOIT ${ele} ${index} ${parseInt(ele)}`);
                if (ele == 0) {
                  status[index] = false;
                } else {
                  status[index] = true;
                }
              });
            }
          }
console.log(`Received '${message}' on '${topic}`);
        break;
        default:
          console.log(`Unknow Topic group`);
      }
    });
  });
});
app.post('/webhook', async (req, res) => {
const message = req.body.events[0].message.text;
  const reply_token = req.body.events[0].replyToken;
  const TOKEN = 'iaUUggyLwJ7RWAwAsaW47CJtUjzh8bkbTUbdvHCp6jqpZzsV/IdhoHt3IdmKGSkkC8fXMd7Z6+1OS0D9GRJYyFcNYp++5dQXhUEJ6Msc2ZtSrNJqjN22cJaBNm/iPvzokM7o8LQm9OeI42H41+fExwdB04t89/1O/w1cDnyilFU='; // Token ที่ได้จาก Channel access token
  const HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
  };
if (message == 'เปิดไฟ หน้าบ้าน' || message == 'ปิดไฟ หน้าบ้าน') {
    if (message == 'เปิดไฟ หน้าบ้าน') {
      await mqttMessage(LED_TOPIC, 'LEDON_ONE');
    } else {
      await mqttMessage(LED_TOPIC, 'LEDOFF_ONE');
    }
  }
if (message == 'เปิดไฟ หลังบ้าน' || message == 'ปิดไฟ หลังบ้าน') {
    if (message == 'เปิดไฟ หลังบ้าน') {
      await mqttMessage(LED_TOPIC, 'LEDON_TWO');
    } else {
      await mqttMessage(LED_TOPIC, 'LEDOFF_TWO');
    }
  }
if (message == 'เปิดไฟ กลางบ้าน' || message == 'ปิดไฟ กลางบ้าน') {    //Add LED_THREE
    if (message == 'เปิดไฟ กลางบ้าน') {
      await mqttMessage(LED_TOPIC, 'LEDON_THREE');   //OPEN
    } else {
      await mqttMessage(LED_TOPIC, 'LEDOFF_THREE');   //CLOSE
    }
  }
if (message == 'เปิดไฟ ทั้งหมด' || message == 'ปิดไฟ ทั้งหมด') {    //Add LED_ALL
    if (message == 'เปิดไฟ ทั้งหมด') {
      await mqttMessage(LED_TOPIC, 'LEDON_ALL');   //OPEN
    } else {
      await mqttMessage(LED_TOPIC, 'LEDOFF_ALL');   //CLOSE
    }
  }
mqttMessage(LED_TOPIC, 'GET');
if (message == 'สถานะ') {
    await checkStatus();
  } else {
    await checkStatus();
  }
console.log(status);
  const objectMessage = genFlexMessage(status[0], status[1],status[2],status[3]);   //ADD STATUS
const body = JSON.stringify({
    replyToken: reply_token,
    messages: [
      objectMessage
    ]
  });
request({
    method: `POST`,
    url: 'https://api.line.me/v2/bot/message/reply',
    headers: HEADERS,
    body: body
  });
res.sendStatus(200);
});
let mqttMessage = async (topic, message) => {
  client.publish(topic, message);
  await checkStatus();
}
let checkStatus = async () => {
  await new Promise(done => setTimeout(done, 3000));
}
let genFlexMessage = (ledOne, ledTwo , ledThree,ledAll) => {
  return {
    "type": "flex",
    "altText": "สถานะระบบไฟ",
    "contents": {
      "type": "bubble",
      "hero": {
        "type": "image",
        "url": "https://sv1.picz.in.th/images/2020/02/02/RM0weI.jpg",
        "size": "full",
        "aspectRatio": "20:13",
        "aspectMode": "cover",
        "action": {
          "type": "uri",
          "label": "Line",
          "uri": "https://linecorp.com/"
        }
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "ระบบไฟ",
            "flex": 0,
            "size": "xl",
            "weight": "bold"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "flex": 1,
            "margin": "md",
            "contents": [
              {
                "type": "text",
                "text": "ไฟหน้าบ้าน",
                "align": "start",
                "gravity": "top",
                "weight": "bold"
              },
              {
                "type": "text",
                "text": (ledOne == true) ? "Open" : "Close",
                "align": "start",
                "weight": "bold",
                "color": (ledOne == true) ? "#FF0000" : "#000000",
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "flex": 1,
            "margin": "md",
            "contents": [
              {
                "type": "text",
                "text": "ไฟหลังบ้าน",
                "align": "start",
                "gravity": "top",
                "weight": "bold"
              },
              {
                "type": "text",
                "text": (ledTwo == true) ? "Open" : "Close",
                "align": "start",
                "weight": "bold",
                "color": (ledTwo == true) ? "#FF0000" : "#000000",
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "flex": 1,
            "margin": "md",
            "contents": [
              {
                "type": "text",
                "text": "ไฟกลางบ้าน",
                "align": "start",
                "gravity": "top",
                "weight": "bold"
              },
              {
                "type": "text",
                "text": (ledThree == true) ? "Open" : "Close",
                "align": "start",
                "weight": "bold",
                "color": (ledThree == true) ? "#FF0000" : "#000000",
              }
            ]
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "flex": 0,
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": `${(ledOne == true) ? "ปิดไฟ" : "เปิดไฟ"}หน้าบ้าน`,
              "text": `${(ledOne == true) ? "ปิดไฟ" : "เปิดไฟ"} หน้าบ้าน`
            },
            "height": "sm",
            "style": "link"
          },
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": `${(ledTwo == true) ? "ปิดไฟ" : "เปิดไฟ"}หลังบ้าน`,
              "text": `${(ledTwo == true) ? "ปิดไฟ" : "เปิดไฟ"} หลังบ้าน`
            },
            "height": "sm",
            "style": "link"
          },
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": `${(ledThree == true) ? "ปิดไฟ" : "เปิดไฟ"}กลางบ้าน`,
              "text": `${(ledThree == true) ? "ปิดไฟ" : "เปิดไฟ"} กลางบ้าน`
            },
            "height": "sm",
            "style": "link"
          },
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": `เปิดไฟทั้งหมด`,
              "text": `เปิดไฟ ทั้งหมด`
            },
            "height": "sm",
            "style": "link"
          },
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": `ปิดไฟทั้งหมด`,
              "text": `ปิดไฟ ทั้งหมด`
            },
            "height": "sm",
            "style": "link"
          },
          {
            "type": "spacer",
            "size": "sm"
          }
        ]
      }
    }
  };
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`))