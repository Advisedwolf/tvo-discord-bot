// src/services/onboardingService.js
// Complete DM-based onboarding flow with country, timezone, VOWs, age, bio,
// gaming experience, farms, alert subscriptions, Alliance Ruins time,
// event attendance, and onboarding announcement.

require('dotenv').config();
const { 
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  MessageEmbed
} = require('discord.js');
const UserProfile = require('../models/UserProfile');
const vows = require('../../config/vows.json');
const { translateToEnglish } = require('../utils/translator');

// Translator stub
const t = (str, locale) => str;

module.exports = { onboardingButtonHandler };

/** Entry point: user clicks "Start Onboarding". */
async function onboardingButtonHandler(interaction, client) {
  await interaction.deferUpdate();
  const dm = await interaction.user.createDM();
  let profile = await UserProfile.findOne({ userId: interaction.user.id });
  if (!profile) profile = new UserProfile({ userId: interaction.user.id });
  await askCountry(dm, profile, client);
}

/** Step 1a: Ask country */
async function askCountry(dm, profile, client) {
  await dm.send('🌍 What country are you from?');
  const collector = dm.createMessageCollector({ filter: m => m.author.id === profile.userId, max: 1, time: 120000 });
  collector.on('collect', async m => {
    const country = m.content.trim();
    if (!country) return m.reply('⚠️ Please enter a valid country name.');
    profile.country = country;
    await profile.save();
    await m.reply(`✅ Saved country: **${country}**.`);
    await askTimeDifference(dm, profile, client);
  });
  collector.on('end', collected => {
    if (collected.size === 0) dm.send('⌛ No country received. Please run `/onboarding` again when you’re ready.');
  });
}





/**
 * Step 1b: Ask timezone offset
 */
async function askTimeDifference(dm, profile, client) {
  await dm.send('⏰ What is your time difference from UTC? Reply like `UTC+0`, `UTC-5`, etc.');

  console.log('[Onboarding] Awaiting timezone response from', profile.userId);
  const filter = m => m.author.id === profile.userId;
  const collected = await dm.awaitMessages({ filter, max: 1, time: 120000 }).catch(() => null);

  if (!collected || !collected.size) {
    await dm.send('⌛ No timezone received. Please run `/onboarding` again when you’re ready.');
    return;
  }

  const m = collected.first();
  const diff = m.content.trim().toUpperCase();
  console.log('[Onboarding] Time diff collected:', diff);

  if (!/^UTC[+-]\d{1,2}$/.test(diff)) {
    await dm.send('⚠️ Invalid format. Use `UTC+0`, `UTC-5`, etc.');
    return askTimeDifference(dm, profile, client);
  }

  profile.timezone = diff;
  await profile.save();
  await dm.send(`✅ Saved timezone: **${diff}**.`);

  // Proceed to VOWs consent
  await askConsentToVows(dm, profile, client);
}

/** Step 2: VOWs consent */
async function askConsentToVows(dm, profile, client) {
  const text = vows[profile.locale] || vows.en;
  await dm.send({ content: t(text, profile.locale), split: true });
  const row = new MessageActionRow().addComponents(
    new MessageButton().setCustomId('consent_vows').setLabel(t('I agree to the VOWs', profile.locale)).setStyle('SUCCESS')
  );
  const msg = await dm.send({ content: t('📜 Please read and consent to our VOWs to continue.', profile.locale), components: [row] });
  const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === profile.userId && i.customId === 'consent_vows', max: 1, time: 120000 });
  collector.on('collect', async i => {
    await i.deferUpdate();
    profile.consented = true;
    await profile.save();
    await dm.send(t('✅ VOWs accepted!', profile.locale));
    await askAgeRange(dm, profile, client);
  });
  collector.on('end', collected => {
    if (collected.size === 0) dm.send(t('⌛ Consent not received. Run `/onboarding` again.', profile.locale));
  });
}

/** Step 3: Age range */
async function askAgeRange(dm, profile, client) {
  const options = ['Under 18','18-30','31-50','50+'].map(v=>({label:v,value:v}));
  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu().setCustomId('select_age_range').setPlaceholder(t('Select your age range',profile.locale)).addOptions(options)
  );
  const msg = await dm.send({ content: t('🔢 How old are you?', profile.locale), components: [row] });
  const inter = await msg.awaitMessageComponent({ filter: i=>i.user.id===profile.userId, time:120000 }).catch(()=>null);
  if (!inter) return dm.send(t('⌛ No selection. Run `/onboarding` again.',profile.locale));
  await inter.deferUpdate();
  profile.ageRange = inter.values[0];
  await profile.save();
  await dm.send(t(`✅ Age range: **${profile.ageRange}** saved.`,profile.locale));
  await askForBio(dm,profile,client);
}

/** Step 4: Bio */
async function askForBio(dm, profile, client) {
  const collector = dm.createMessageCollector({ filter:m=>m.author.id===profile.userId, max:1, time:180000 });
  await dm.send(t('📝 Write a short bio (50–200 chars):',profile.locale));
  collector.on('collect', async m=>{
    const text=m.content.trim();
    if(text.length<50||text.length>200){ return m.reply(t('⚠️ Bio must be 50–200 chars.',profile.locale)); }
    profile.bio=await translateToEnglish(text,profile.locale);
    await profile.save();
    await dm.send(t('✅ Bio saved.',profile.locale));
    await askGamingExperience(dm,profile,client);
  });
  collector.on('end', col=>{ if(col.size===0) dm.send(t('⌛ No bio. Run `/onboarding` again.',profile.locale)); });
}

/** Step 5: Gaming experience */
async function askGamingExperience(dm, profile, client) {
  const opts = Array.from({length:10},(_,i)=>({label:`${i+1} year${i>0?'s':''}`,value:`${i+1}`}));
  const row=new MessageActionRow().addComponents(
    new MessageSelectMenu().setCustomId('select_gaming_exp').setPlaceholder('Years of gaming experience').addOptions(opts)
  );
  const msg=await dm.send({content:'🎮 How many years of gaming experience do you have?',components:[row]});
  const inter=await msg.awaitMessageComponent({filter:i=>i.user.id===profile.userId,time:120000}).catch(()=>null);
  if(!inter) return dm.send('⌛ No response. You can update later with `/profile`.');
  await inter.deferUpdate(); profile.gamingExperience=Number(inter.values[0]); await profile.save();
  await dm.send(`✅ Gaming experience: **${profile.gamingExperience}** year(s).`);
  await askFarms(dm,profile,client);
}

/** Step 6: Farms */
async function askFarms(dm, profile, client) {
  const farmOpts = [
    { label: '0', value: '0' },{ label: '1', value: '1' },
    { label: '2-4', value: '2-4' },{ label: '5-10', value: '5-10' },
    { label: '10+', value: '10+' }
  ];
  const msg=await dm.send({
    content:'🚜 Do you run any farms? Choose one:',
    components:[ new MessageActionRow().addComponents(
      new MessageSelectMenu().setCustomId('select_farms').setPlaceholder('Number of farms?').addOptions(farmOpts)
    )]
  });
  const inter=await msg.awaitMessageComponent({filter:i=>i.user.id===profile.userId,time:120000}).catch(()=>null);
  if(!inter) return dm.send('⌛ No response. You can update later with `/profile`.');
  await inter.deferUpdate(); profile.farms=inter.values[0]; await profile.save();
  await dm.send(`✅ Farms: **${profile.farms}** saved.`);
  // Farm Operator role
  const guild=client.guilds.cache.get(process.env.GUILD_ID);
  const member=await guild.members.fetch(profile.userId);
  const farmRole='1368958149901549611';
  if(profile.farms!=='0') await member.roles.add(farmRole); else await member.roles.remove(farmRole).catch(()=>{});
  await askAlertSubscriptions(dm,profile,client);
}

/** Step 7: Alert subs */
async function askAlertSubscriptions(dm, profile, client) {
  const guild=client.guilds.cache.get(process.env.GUILD_ID);
  const member=await guild.members.fetch(profile.userId);
  const roleMap={ scout:'1369672641283231846', attack:'1369685492919959653', event:'1369730477694386297' };
  const alertWatch='1369660860322152598'; profile.alertSubscriptions={}; let any=false;
  for(const type of['scout','attack','event']){
    const cap=type.charAt(0).toUpperCase()+type.slice(1);
    const msg=await dm.send({
      content:`🔔 Receive ${cap} alerts?`, components:[
        new MessageActionRow().addComponents(
          new MessageButton().setCustomId(`alert_${type}_yes`).setLabel('Yes').setStyle('SUCCESS'),
          new MessageButton().setCustomId(`alert_${type}_no`).setLabel('No').setStyle('SECONDARY')
        )
      ]
    });
    const inter=await msg.awaitMessageComponent({filter:i=>i.user.id===profile.userId,time:120000}).catch(()=>null);
    if(inter){ await inter.deferUpdate(); const en=inter.customId.endsWith('_yes'); profile.alertSubscriptions[type]=en;
      if(en){ any=true; await member.roles.add(roleMap[type]); await dm.send(`✅ ${cap} alerts enabled.`);} else { await member.roles.remove(roleMap[type]).catch(()=>{}); await dm.send(`✅ ${cap} alerts disabled.`);} }
    else { profile.alertSubscriptions[type]=false; }
  }
  if(any) await member.roles.add(alertWatch); else await member.roles.remove(alertWatch).catch(()=>{});
  profile.alertSubscriptionsGlobal=any; await profile.save();
  await askAllianceRuinsTime(dm,profile,client);
}

/** Step 8: Alliance Ruins time */
async function askAllianceRuinsTime(dm, profile, client) {
  const times=['00:00','18:00','20:00'];
  const msg=await dm.send({ content:'⏰ Preferred Alliance Ruins start time?', components:[
    new MessageActionRow().addComponents(
      ...times.map(tStr=>new MessageButton().setCustomId(`ruins_${tStr}`).setLabel(`${tStr} UHT`).setStyle('PRIMARY'))
    )
  ] });
  const inter=await msg.awaitMessageComponent({filter:i=>i.user.id===profile.userId,time:120000}).catch(()=>null);
  if(!inter) return dm.send('⌛ No response. Run `/onboarding` again.');
  await inter.deferUpdate(); profile.allianceRuinsTime=inter.customId.split('_')[1]; await profile.save();
  await dm.send(`✅ Ruins time: **${profile.allianceRuinsTime} UHT**.`);
  await askEventAttendance(dm,profile,client);
}

/** Step 9: Event attendance & announcement */
async function askEventAttendance(dm, profile, client) {
  const events=[
    {key:'elite',label:'Elite Adventures (Sunday 20:00 UHT)'},
    {key:'territory',label:'Territory Defence (Saturday 20:00 UHT)'}
  ]; const opts=['Often','Sometimes','Rarely']; profile.attendance={};
  for(const ev of events){
    const msg=await dm.send({ content:`📅 How often attend **${ev.label}**?`, components:[
      new MessageActionRow().addComponents(
        ...opts.map(opt=>new MessageButton().setCustomId(`attend_${ev.key}_${opt.toLowerCase()}`).setLabel(opt).setStyle('SECONDARY'))
      )
    ] });
    const inter=await msg.awaitMessageComponent({filter:i=>i.user.id===profile.userId,time:120000}).catch(()=>null);
    if(inter){ await inter.deferUpdate(); const raw=inter.customId.split('_')[2]; const choice=raw.charAt(0).toUpperCase()+raw.slice(1); profile.attendance[ev.key]=choice; await profile.save(); await dm.send(`✅ ${ev.label} attendance: **${choice}**.`);} else{ await dm.send(`⌛ No response for ${ev.label}.`); }
  }
  // Final roles
  const guild=client.guilds.cache.get(process.env.GUILD_ID);
  const member=await guild.members.fetch(profile.userId);
  const vis='1368758496333533284', mem='1368758332667723816';
  if(member.roles.cache.has(vis)) await member.roles.remove(vis).catch(()=>{});
  await member.roles.add(mem);
  profile.completed=true; await profile.save();
  await dm.send('🎉 Onboarding complete! You now have full access to the server.');
  // Announcement embed
  const channel=await client.channels.fetch('1369438136916250784');
  const user=await client.users.fetch(profile.userId);
  const embed = new MessageEmbed()
    .setColor('#4DB6E2')
    .setTitle(`New player onboarded: ${user.username}`)
    .addFields(
      {name:'Country & TZ',value:`${profile.country}, ${profile.timezone}`,inline:true},
      {name:'VOWs Accepted',value:'Yes',inline:true},
      {name:'Gaming Experience',value:`${profile.gamingExperience} yrs`,inline:true},
      {name:'Farms',value:`${profile.farms}`,inline:true},
      {name:'Age Range',value:`${profile.ageRange}`,inline:true},
      {name:'Introduction (Bio)',value:`${profile.bio}`}
    )
    .setTimestamp();
  channel.send({embeds:[embed]});
}

