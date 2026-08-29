const {Client,GatewayIntentBits,REST,Routes,SlashCommandBuilder,PermissionFlagsBits}=require("discord.js");
const TOKEN=process.env.BOT_TOKEN;
if(!TOKEN){console.error("BOT_TOKEN não configurado.");process.exit(1)}
const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent]});

const commands=[
new SlashCommandBuilder().setName("ping").setDescription("Testa o bot"),
new SlashCommandBuilder().setName("avatar").setDescription("Mostra um avatar").addUserOption(o=>o.setName("usuario").setDescription("Usuário")),
new SlashCommandBuilder().setName("userinfo").setDescription("Informações de usuário").addUserOption(o=>o.setName("usuario").setDescription("Usuário")),
new SlashCommandBuilder().setName("serverinfo").setDescription("Informações do servidor"),
new SlashCommandBuilder().setName("say").setDescription("Envia uma mensagem").addStringOption(o=>o.setName("mensagem").setDescription("Mensagem").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages.toString()),
new SlashCommandBuilder().setName("clear").setDescription("Apaga mensagens").addIntegerOption(o=>o.setName("quantidade").setDescription("1-100").setMinValue(1).setMaxValue(100).setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages.toString()),
new SlashCommandBuilder().setName("kick").setDescription("Expulsa membro").addUserOption(o=>o.setName("usuario").setDescription("Membro").setRequired(true)).addStringOption(o=>o.setName("motivo").setDescription("Motivo")).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers.toString()),
new SlashCommandBuilder().setName("ban").setDescription("Bane membro").addUserOption(o=>o.setName("usuario").setDescription("Membro").setRequired(true)).addStringOption(o=>o.setName("motivo").setDescription("Motivo")).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers.toString())
].map(x=>x.toJSON());

client.once("ready",async()=>{
 console.log(`Online como ${client.user.tag}`);
 try{const rest=new REST({version:"10"}).setToken(TOKEN);await rest.put(Routes.applicationCommands(client.user.id),{body:commands});console.log("Comandos registrados!")}catch(e){console.error(e)}
});
client.on("interactionCreate",async i=>{
 if(!i.isChatInputCommand())return;
 try{
  if(i.commandName==="ping")return i.reply(`🏓 Pong! ${client.ws.ping}ms`);
  if(i.commandName==="avatar"){const u=i.options.getUser("usuario")||i.user;return i.reply(u.displayAvatarURL({size:1024,extension:"png"}))}
  if(i.commandName==="userinfo"){const u=i.options.getUser("usuario")||i.user;return i.reply(`👤 ${u.tag}\n🆔 ${u.id}`)}
  if(i.commandName==="serverinfo"){const g=i.guild;return i.reply(`🏠 ${g.name}\n👥 ${g.memberCount} membros\n💬 ${g.channels.cache.size} canais`)}
  if(i.commandName==="say"){const m=i.options.getString("mensagem",true);await i.reply({content:"✅ Enviado!",ephemeral:true});return i.channel.send(m)}
  if(i.commandName==="clear"){const n=i.options.getInteger("quantidade",true);const x=await i.channel.bulkDelete(n,true);return i.reply({content:`🧹 ${x.size} mensagens apagadas.`,ephemeral:true})}
  if(i.commandName==="kick"){const u=i.options.getUser("usuario",true),m=await i.guild.members.fetch(u.id);if(!m.kickable)return i.reply({content:"❌ Não consigo expulsar.",ephemeral:true});await m.kick(i.options.getString("motivo")||"Sem motivo");return i.reply(`👢 ${u.tag} foi expulso.`)}
  if(i.commandName==="ban"){const u=i.options.getUser("usuario",true),m=await i.guild.members.fetch(u.id).catch(()=>null);if(m&&!m.bannable)return i.reply({content:"❌ Não consigo banir.",ephemeral:true});await i.guild.members.ban(u.id,{reason:i.options.getString("motivo")||"Sem motivo"});return i.reply(`🔨 ${u.tag} foi banido.`)}
 }catch(e){console.error(e);if(!i.replied) i.reply({content:"❌ Erro ao executar.",ephemeral:true}).catch(()=>{})}
});
client.login(TOKEN);
