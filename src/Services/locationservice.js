// src/services/locationService.js
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} = require('discord.js');
const ctz = require('countries-and-timezones');
const logger = require('../utils/logger');
const translator = require('../utils/translator');
const UserProfile = require('../models/UserProfile');
const countriesData = require('../../config/country_hierarchy.json');

const DEFAULT_LOCALES = {
  US: 'en-US', CA: 'en-CA', GB: 'en-GB', FR: 'fr-FR', DE: 'de-DE', ES: 'es-ES'
};

/**
 * Asks user for location: region > subregion > country > (opt) subdivision > timezone
 * Returns an object with { country, subdivision, timezone, locale }
 */
async function askLocation(user) {
  const locale = user.locale || 'en';
  const dm = await user.createDM();

  // 1) Region
  const regions = Object.keys(countriesData);
  const regionMenu = new StringSelectMenuBuilder()
    .setCustomId('onboard_region')
    .setPlaceholder(translator.t('onboarding.selectRegion', locale))
    .addOptions(regions.map(r => ({ label: r, value: r })));
  await dm.send({ content: translator.t('onboarding.selectRegion', locale), components: [new ActionRowBuilder().addComponents(regionMenu)] });
  const regionSel = await dm.awaitMessageComponent({ filter: i => i.user.id === user.id && i.customId === 'onboard_region', componentType: ComponentType.StringSelect, time: 120000 });
  const region = regionSel.values[0];

  // 2) Subregion
  const subregions = Object.keys(countriesData[region]);
  const subMenu = new StringSelectMenuBuilder()
    .setCustomId('onboard_subregion')
    .setPlaceholder(translator.t('onboarding.selectSubregion', locale))
    .addOptions(subregions.map(s => ({ label: s, value: s })));
  await regionSel.update({ content: translator.t('onboarding.selectSubregion', locale), components: [new ActionRowBuilder().addComponents(subMenu)] });
  const subSel = await dm.awaitMessageComponent({ filter: i => i.user.id === user.id && i.customId === 'onboard_subregion', componentType: ComponentType.StringSelect, time: 120000 });
  const subregion = subSel.values[0];

  // 3) Country
  const countryBlock = countriesData[region][subregion];
  const countries = Array.isArray(countryBlock) ? countryBlock : Object.keys(countryBlock);
  const countryMenu = new StringSelectMenuBuilder()
    .setCustomId('onboard_country')
    .setPlaceholder(translator.t('onboarding.selectCountry', locale))
    .addOptions(countries.map(c => ({ label: c, value: c })));
  await subSel.update({ content: translator.t('onboarding.selectCountry', locale), components: [new ActionRowBuilder().addComponents(countryMenu)] });
  const countrySel = await dm.awaitMessageComponent({ filter: i => i.user.id === user.id && i.customId === 'onboard_country', componentType: ComponentType.StringSelect, time: 120000 });
  const country = countrySel.values[0];

  // 4) Optional subdivision
  let subdivision;
  const entry = countryBlock[country];
  if (entry && entry.subdivisions) {
    const subs = Object.keys(entry.subdivisions);
    const subdivMenu = new StringSelectMenuBuilder()
      .setCustomId('onboard_subdivision')
      .setPlaceholder(translator.t('onboarding.selectSubdivision', locale))
      .addOptions(subs.map(s => ({ label: s, value: s })));
    await countrySel.update({ content: translator.t('onboarding.selectSubdivision', locale), components: [new ActionRowBuilder().addComponents(subdivMenu)] });
    const subdivSel = await dm.awaitMessageComponent({ filter: i => i.user.id === user.id && i.customId === 'onboard_subdivision', componentType: ComponentType.StringSelect, time: 120000 });
    subdivision = subdivSel.values[0];
    await subdivSel.update({ content: translator.t('onboarding.subdivisionConfirm', locale, { subdivision }), components: [] });
  } else {
    await countrySel.update({ components: [] });
  }

  // Persist country/subdivision
  const profile = await UserProfile.findOne({ userId: user.id });
  profile.country = country;
  if (subdivision) profile.subdivision = subdivision;
  await profile.save();
  logger.info(`Location set: ${country}${subdivision ? ' / ' + subdivision : ''} for ${user.tag}`, 'onboarding');

  // 5) Timezone
  const tzs = ctz.getTimezonesForCountry(country).map(z => z.name);
  const tzMenu = new StringSelectMenuBuilder()
    .setCustomId('onboard_timezone')
    .setPlaceholder(translator.t('onboarding.selectTimezone', locale))
    .addOptions(tzs.map(tz => ({ label: tz.replace('_',' '), value: tz })));
  await dm.send({ content: translator.t('onboarding.selectTimezone', locale), components: [new ActionRowBuilder().addComponents(tzMenu)] });
  const tzSel = await dm.awaitMessageComponent({ filter: i => i.user.id === user.id && i.customId === 'onboard_timezone', componentType: ComponentType.StringSelect, time: 120000 });
  const timezone = tzSel.values[0];

  profile.timezone = timezone;
  profile.locale = DEFAULT_LOCALES[ctz.findCountry(timezone)?.id] || 'en-US';
  await profile.save();
  await tzSel.update({ content: translator.t('onboarding.timezoneConfirm', locale, { tz: timezone }), components: [] });
  logger.info(`Timezone set to ${timezone} for ${user.tag}`, 'onboarding');

  return { country, subdivision, timezone, locale: profile.locale };
}

module.exports = { askLocation };