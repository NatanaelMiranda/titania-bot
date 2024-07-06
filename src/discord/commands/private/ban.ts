import { Command } from "#base";
import { settings } from "#settings";
import { brBuilder, hexToRgb } from "@magicyan/discord";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  EmbedBuilder
} from "discord.js";

interface BanOptions {
  user: GuildMember;
  reason: string;
}

let banOptions: BanOptions | null = null;

export const setBanOptions = (options: BanOptions) => {
  banOptions = options;
};

export const getBanOptions = () => {
  return banOptions;
};

new Command({
  name: "ban",
  description: "Banir um usuário com confirmação",
  dmPermission: false,
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: ["Administrator", "BanMembers"],
  options: [
    {
      name: "user",
      description: "Usuário a ser banido",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "motivo",
      description: "Motivo do banimento",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async run(interaction) {
    await interaction.deferReply({ ephemeral });
    const { options, appPermissions } = interaction;

    const userToBan = options.getMember("user") as GuildMember;
    const reason = options.getString("motivo") as string;

    if (!appPermissions.has("BanMembers")) {
      await interaction.editReply({
        content: "Eu não tenho permissão para banir menbros neste servidor.",
      });
      return;
    }

    setBanOptions({ user: userToBan, reason });

    const row = new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder({
          customId: "ban/confirm/button",
          label: "Confirmar",
          style: ButtonStyle.Danger,
        }),
        new ButtonBuilder({
          customId: "ban/cancel/button",
          label: "Cancelar",
          style: ButtonStyle.Secondary,
        }),
      ],
    });

    const embed = new EmbedBuilder({
      title: "**Tem cetreza de que quer banir o usuário?**",
      description: brBuilder(
        `> **Membro:** ${userToBan.user.username} `,
        `> **motivo:** ${reason} `
      ),
      color: hexToRgb(settings.colors.info),
    });

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  },
});
/*
components: [
  new Component({
    customId: "cancelBan",
    type: ComponentType.Button,
    cache: "cached",
    async run(interaction) {
      getBanOptions();

      await interaction.update({
        embeds: [
          new EmbedBuilder({
            description: "Banimento cancelado",
            color: hexToRgb(settings.colors.theme.danger),
          }),
        ],
        components: [],
      });
    },
  }),
];
*/