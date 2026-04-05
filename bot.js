const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

let categories = {};
let pageSize = 10;

function loadAll(){

const folder = "./txt";
const files = fs.readdirSync(folder);

files.forEach(file=>{

const name = file.replace(".txt","");

const data = fs.readFileSync(path.join(folder,file),'utf8');

const lines = data.split('\n');

categories[name] = lines
.filter(line => line.trim() !== "")
.map(line=>{

const parts = line.split(':');

return {
title: parts[0],
url: parts.slice(1).join(':')
}

});

});

}

loadAll();

bot.onText(/\/start/, (msg)=>{

const buttons = Object.keys(categories).map(cat=>[
{
text:"📚 "+cat,
callback_data:"cat_"+cat
}
]);

bot.sendMessage(msg.chat.id,
"🎬 AS VIDEO GENERATOR\n\nSelect Category",
{
reply_markup:{
inline_keyboard:buttons
}
});

});

bot.on('callback_query', (query)=>{

const chatId = query.message.chat.id;

if(query.data.startsWith("cat_")){

const cat = query.data.replace("cat_","");

const videos = categories[cat];

const buttons = videos.slice(0,10).map((v,i)=>[
{
text:v.title,
callback_data:"video_"+cat+"_"+i
}
]);

bot.sendMessage(chatId,
"Select Video",
{
reply_markup:{
inline_keyboard:buttons
}
});

}

if(query.data.startsWith("video_")){

const parts = query.data.split("_");

const cat = parts[1];
const index = parts[2];

const video = categories[cat][index];

bot.sendMessage(chatId,
`🎬 ${video.title}

${video.url}

⚡ AS VIDEO GENERATOR`
);

}

});
