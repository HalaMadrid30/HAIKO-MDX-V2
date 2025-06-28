const { cmd } = require('../command');
const config = require('../config');

const antiSpamGroups = new Set();
const userMessageTimestamps = new Map();

cmd({
    pattern: "antispam",
    alias: ["spamblock", "blockspam"],
    react: "🛡️",
    desc: "*Aᴄᴛɪᴠᴇ/ᴅéᴀᴄᴛɪᴠᴇ ʟ'ᴀɴᴛɪ-sᴘᴀᴍ ᴘᴏᴜʀ ʟᴇ ɢʀᴏᴜᴘᴇ*",
    category: "group",
    use: "*.antispam on/off/status",
    filename: __filename
},
async (conn, mek, m, { reply, args, isGroup, isAdmin }) => {
    try {
        if (!isGroup) return reply("❌ Commande réservée aux groupes.");
        if (!isAdmin) return reply("❌ Seuls les admins peuvent gérer l'antispam.");

        const mode = args[0]?.toLowerCase();
        const groupId = m.chat;

        switch (mode) {
            case "on":
                antiSpamGroups.add(groupId);
                reply("✅ *Antispam activé.* Les messages répétés ou trop rapides seront supprimés.");
                break;

            case "off":
                antiSpamGroups.delete(groupId);
                reply("⚠️ *Antispam désactivé.* Les messages ne seront plus filtrés.");
                break;

            case "status":
                reply(`📊 *Statut Antispam :* ${antiSpamGroups.has(groupId) ? "✅ Activé" : "❌ Désactivé"}`);
                break;

            default:
                reply("❓ Utilisation : *.antispam on/off/status*");
        }
    } catch (e) {
        console.error(e);
        reply("❎ Erreur : " + e.message);
    }
});

// Middleware à utiliser dans le handler principal
async function handleAntiSpam(conn, m) {
    try {
        if (!m.isGroup) return;
        if (!antiSpamGroups.has(m.chat)) return;
        if (!m.sender) return;

        const key = `${m.chat}:${m.sender}`;
        const now = Date.now();

        if (!userMessageTimestamps.has(key)) {
            userMessageTimestamps.set(key, []);
        }

        const timestamps = userMessageTimestamps.get(key);

        // Ajoute nouvo timestamp
        timestamps.push(now);

        // Kenbe sèlman timestamps ki nan 10 segond dènye yo
        const recent = timestamps.filter(t => now - t < 10000);
        userMessageTimestamps.set(key, recent);

        // Si plis pase 5 mesaj nan 10 segond → sispann mesaj
        if (recent.length > 5) {
            // Efase mesaj spam nan
            try {
                // Baileys v4+ fason efase mesaj (asire ou verifye dokimantasyon ou)
                await conn.sendMessage(m.chat, { delete: m.key });

                // Avèti itilizatè a
                await conn.sendMessage(m.chat, {
                    text: `🚫 *@${m.sender.split("@")[0]}*, spam détecté. Calme-toi.`,
                    mentions: [m.sender]
                });
            } catch (err) {
                console.error("Erreur suppression anti-spam :", err.message);
            }
        }
    } catch (error) {
        console.error("handleAntiSpam error:", error);
    }
}

module.exports = { antiSpamGroups, handleAntiSpam };
