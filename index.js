import express from 'express';
import cors from 'cors';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtendo o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Habilitar CORS

app.use(cors({
    origin: 'https://seu-frontend.netlify.app',  // Substitua pelo seu domínio do Netlify
  }));

// Configuração do Multer para salvar o arquivo temporariamente
const upload = multer({ dest: 'uploads/' });

// Rota para upload de vídeos
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    console.error('Nenhum arquivo enviado');
    return res.status(400).send('Nenhum arquivo enviado.');
  }

  const inputFilePath = req.file.path;
  const outputFilePath = path.join(__dirname, 'uploads', `${Date.now()}.mp4`);

  console.log('Arquivo recebido:', inputFilePath);
  console.log('Caminho do arquivo de saída:', outputFilePath);

  // Convertendo o arquivo .webm para .mp4 com FFmpeg
  ffmpeg(inputFilePath)
    .output(outputFilePath)
    .withVideoCodec('libx264')
    .withAudioCodec('aac')
    .on('end', () => {
      console.log('Conversão finalizada');
      // Enviar o arquivo convertido para o cliente
      res.download(outputFilePath, 'converted-video.mp4', (err) => {
        if (err) {
          console.error('Erro ao enviar o arquivo:', err);
        }
        // Limpeza de arquivos temporários
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
