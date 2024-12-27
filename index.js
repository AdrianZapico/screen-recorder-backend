import express from 'express';
import cors from 'cors';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

const app = express();

// Habilitar CORS e permitir a origem específica
const allowedOrigins = ['https://screen-recorder-react.netlify.app']; // Adicione seu domínio aqui
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) { // Permitir requisições locais
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

// Configuração do Multer para salvar o arquivo temporariamente
const upload = multer({ dest: 'uploads/' });

// Rota para upload de vídeos
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }

  const inputFilePath = req.file.path;
  const outputFilePath = path.join(__dirname, 'uploads', `${Date.now()}.mp4`);

  // Convertendo o arquivo .webm para .mp4 com FFmpeg
  ffmpeg(inputFilePath)
    .output(outputFilePath)
    .withVideoCodec('libx264')
    .withAudioCodec('aac')
    .on('end', () => {
      res.download(outputFilePath, 'converted-video.mp4', (err) => {
        if (err) {
          console.error('Erro ao enviar o arquivo:', err);
        }
        fs.unlinkSync(inputFilePath); // Deletando o arquivo original
        fs.unlinkSync(outputFilePath); // Deletando o arquivo convertido
      });
    })
    .on('error', (err) => {
      console.error('Erro na conversão', err);
      res.status(500).send('Erro ao converter o vídeo');
    })
    .run();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
