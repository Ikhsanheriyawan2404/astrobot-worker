import { Telegraf, Markup } from 'telegraf'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()
const token = process.env.TELEGRAM_TOKEN as string
if (!token) {
  console.error('Missing TELEGRAM_TOKEN in environment')
  process.exit(1)
}

const bot = new Telegraf(token)

// One-shot: register commands and exit. No listeners, no bot.launch.
async function runOnce() {
  try {
    await bot.telegram.setMyCommands([
      { command: 'start', description: '🚀 Mulai — halo! buka menu utama' },
      { command: 'help', description: '❓ Bantuan — butuh bantuan? tanya sini aja' },
      { command: 'settings', description: '⚙️ Setting — atur preferensimu ✨' },
      { command: 'todos', description: '📝 Todos — manage tugas, stay on track' },
      { command: 'cuaca', description: '🌤️ Cuaca — cek cuaca sekarang' },
      { command: 'sholat', description: '🕌 Sholat — cek waktu sholat' },
    ])

    console.log('✅ Menu commands registered')
  } catch (err) {
    console.error('Failed to register menu commands:', err)
    process.exitCode = 1
  } finally {
    // Exit immediately since this is a one-off script
    process.exit()
  }
}

runOnce()