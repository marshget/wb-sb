const https = require('https');

// Handler untuk endpoint webhook
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    console.log('Received data:', body); // Log data yang diterima

    // Parsing data dari POST request
    const params = new URLSearchParams(body);
    const statusMessage = params.get('status');

    if (!statusMessage) {
      res.status(400).json({ status: 'failure', error: 'No status data received' });
      return;
    }

    // URL webhook Discord (pastikan ini diatur di environment variables Vercel)
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    // Mengambil waktu sekarang dalam format yang diinginkan (tanpa detik)
    const now = new Date();
    const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleString('id-ID', options);

    // Payload untuk dikirim ke Discord
    const payload = JSON.stringify({
      content: '',
      embeds: [
        {
          title: '<a:vip:1126867807636815955> **VIP SuperBroadcast** <a:vip:1126867807636815955>',
          description: statusMessage, // Tanggal dan waktu dihapus dari deskripsi
          color: 0xFF0000, // Warna merah
          image: {
            url: 'https://wb-marsh-brandeds-projects.vercel.app/standard_22.gif ' // Ganti dengan URL gambar atau GIF yang diinginkan
          },
          thumbnail: {
            url: 'https://wb-marsh-brandeds-projects.vercel.app/standard_16.gif' // URL logo yang ditampilkan di pojok kanan atas
          },
          footer: {
            text: `Â© 2024 Scripting CreativePS | ${formattedDate} (WIB)` // Tanggal dan waktu di bawah
          }
        }
      ]
    });

    const optionsRequest = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const webhookReq = https.request(discordWebhookUrl, optionsRequest, (response) => {
      let responseData = '';
      response.on('data', (chunk) => {
        responseData += chunk;
      });

      response.on('end', () => {
        console.log('Response from Discord:', responseData); // Log response dari Discord

        if (response.statusCode === 204) {
          res.status(200).json({ status: 'success' });
        } else {
          res.status(500).json({ status: 'failure', error: 'Failed to send data to Discord' });
        }
      });
    });

    webhookReq.on('error', (e) => {
      console.error('Error sending request:', e);
      res.status(500).json({ status: 'failure', error: 'Internal Server Error' });
    });

    webhookReq.write(payload);
    webhookReq.end();
  });
};
