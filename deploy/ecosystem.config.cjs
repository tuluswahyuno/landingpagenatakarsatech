// Konfigurasi PM2: menjalankan website dan menyalakannya ulang otomatis bila crash / server reboot.
// Pakai: pm2 start deploy/ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: 'natakarsa-web',
      cwd: __dirname + '/..',
      script: 'dist/server/entry.mjs',
      node_args: '--env-file=.env',
      // Cukup 1 proses: cache konten, rate limit, dan jadwal pengingat berjalan di memori proses ini
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '400M',
      // HOST & PORT diambil dari .env (CloudPanel menentukan port per situs, mis. 3004)
      env: { NODE_ENV: 'production' },
      time: true,
    },
  ],
};
