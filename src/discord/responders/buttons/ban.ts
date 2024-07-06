import { Responder, ResponderType } from "#base";
import { hexToRgb } from "@magicyan/discord";
import { EmbedBuilder } from "discord.js";
import { getBanOptions } from "discord/commands/private/ban.js";
import {settings} from "#settings";
import { reply } from "#functions";

new Responder({
    customId: "ban/cancel/button",
    type: ResponderType.Button, cache: "cached",
    async run(interaction) {
        getBanOptions();

      await interaction.update({
        embeds: [
          new EmbedBuilder({
            description: "Banimento cancelado",
            color: hexToRgb(settings.colors.danger),
          }),
        ],
        components: [],
      });
    },
});

new Responder({
    customId: "ban/confirm/button",
    type: ResponderType.Button, cache: "cached",
    async run(interaction) {
        const { guild, member } = interaction;
    const banOptions = getBanOptions();

    if (banOptions) {
      const { reason, user: userToBan } = banOptions;

      if (
        userToBan.roles.highest.comparePositionTo(
          guild.roles.highest || null
        ) >= 0
      ) {
        reply.danger({
            interaction,
            update: true,
            clear: true,
            text: "Eu não posso banir este usuário porque ele possui um cargo igual ou superior ao meu."
        });
        
        return;
      }
      if (
        userToBan.roles.highest.comparePositionTo(
          member.roles.highest || null
        ) >= 0
      ) {
        reply.danger({
            interaction,
            update: true,
            text: "Você não pode banir este usuário porque ele possui um cargo igual ou superior ao seu.",
            clear: true
        });
        
        return;
      }

      try {
        userToBan.ban({ reason: reason });

        reply.success({
            interaction,
            update: true,
            clear: true,
            text: "Usuário banido com sucesso!"
        });

      } catch (error) {

        reply.danger({
            interaction,
            update: true,
            clear: true,
            text: "Ocorreu um erro ao tentar banir o usuário!"
        });
      }
    }
    },
});