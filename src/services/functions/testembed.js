// src/services/functions/testembed.js
export default async function handleTestembed(interaction) {
  const type = interaction.options.getString("type");
  return {
    template: type, // picks the embed template by name
    title: `Test: ${type}`,
    description: `This is a ${type} embed test.`,
    fields: [
      { name: "Field A", value: "Value A", inline: true },
      { name: "Field B", value: "Value B", inline: true },
    ],
  };
}
