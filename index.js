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
    origin: 'https://screen-recorder-react.netlify.app/',  
  }));


const upload = multer({ dest: 'uploads/' });


app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    console.error('Nenhum arquivo enviado');
    return res.status(400).send('Nenhum arquivo enviado.');
  }

  const inputFilePath = req.file.path;
  const outputFilePath = path.join(__dirname, 'uploads', `${Date.now()}.mp4`);

  console.log('Arquivo recebido:', inputFilePath);
  console.log('Caminho do arquivo de saída:', outputFilePath);


  ffmpeg(inputFilePath)
    .output(outputFilePath)
    .withVideoCodec('libx264')
    .withAudioCodec('aac')
    .on('end', () => {
      console.log('Conversão finalizada');
   
      res.download(outputFilePath, 'converted-video.mp4', (err) => {
        if (err) {
          console.error('Erro ao enviar o arquivo:', err);
        }
      
        fs.unlinkSync(inputFilePath); 
        fs.unlinkSync(outputFilePath); 
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
