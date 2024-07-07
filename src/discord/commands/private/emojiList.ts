import { Command } from "#base";
import { reply } from "#functions";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  GuildEmoji,
} from "discord.js";

new Command({
  name: "emojis",
  description: "Comando de emojis.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "listar",
      description: "Crie uma lista de emojis.",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "local",
          description: "Cria uma lista de ids de todos os emojis do servidor.",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ],
  async run(interaction) {
    const { guild, options } = interaction;

    await interaction.deferReply({ ephemeral });

    const Group = options.getSubcommandGroup();
    const SubCommand = options.getSubcommand();

    const staticEmojis: record<string, string> = {};
    const animatedEmojis: record<string, string> = {};

    const processEmojis = (emoji: GuildEmoji) => {
      if (emoji.animated) {
        animatedEmojis[emoji.name] = emoji.id;
      } else {
        staticEmojis[emoji.name] = emoji.id;
      }
    };

    switch (Group) {
      case "listar": {
        switch (SubCommand) {

          case "local": {
            guild.emojis.cache.forEach((emoji) => processEmojis(emoji));

            const response = {
              emojis: {
                static: staticEmojis,
                animated: animatedEmojis,
              },
            };

            reply.primary({
              interaction,
              update: true,
              text: `\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\``,
            });
            return;
          }
        }
        return;
      }
    }
  },
});
