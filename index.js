import express from 'express';
import cors from 'cors';
import fs from 'fs'
import axios from 'axios';
import bodyParser from 'body-parser';
const app = express();
const PORT = process.env.PORT || 4000;

import  { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
// Middleware para fazer o parse do corpo das requisições
app.use(bodyParser.json());
app.use(cors()); // Habilita CORS para todas as rotas

app.get('/', (req, res) => {
    res.send('Servidor em execução. Acesse /api para a API.');
});

// Rota para a raiz da API
app.get('/api', (req, res) => {
    res.send('Hello, world! This is my API.');
});

// Rota para receber os dados e salvar no arquivo de texto
app.post('/api/save-to-txt', async (req, res) => {
    const { name } = req.body;
    await prisma.pessoa.create({
        data: {
            nome: name
        }
    })
    const nomesArray = await prisma.pessoa.findMany();

    // Formata a lista de nomes para a mensagem
    const nomesFormatted = nomesArray.map((pessoa, index) => `${index + 1}. ${pessoa.nome}`).join('\n');

    // Enviar mensagem para o Telegram com a lista de nomes
    const token = '6773581735:AAEm-wAQAcM783Gef1vL41mdonM2N-DnyoM';

    // IDs dos usuários do Telegram
    const chatIds = ['6980166412', '1313432061', '1229458971'];

    // Função para enviar mensagem para um chatId específico
    const sendMessage = (chatId, message) => {
        axios.get(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
            .then(response => {
                console.log(`Mensagem enviada para ${chatId}:`, response.data);
            })
            .catch(error => {
                console.error(`Erro ao enviar mensagem para ${chatId}:`, error);
            });
    };

    // Agendar o envio de mensagens para cada chatId
    chatIds.forEach((chatId, index) => {
        setTimeout(() => {
            const message = `Nome confirmado: ${name}\n\nLista de nomes:\n${nomesFormatted}`;
            sendMessage(chatId, message);
        }, index * 1000); // Enviar a cada 1 segundo (1000 ms)
    });

    res.send({ message: 'Nome confirmado com sucesso!' });
});

app.get('/api/guests-list', async (req, res) => {
    try {
      const data = await fs.promises.readFile('./convidados.txt', { encoding: 'utf8' });
      res.send(data);
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      res.status(500).send('Erro ao ler arquivo');
    }
});

app.delete('/api/delete', async (req, res) => {
    try {
        const {name} = req.body
        await prisma.pessoa.delete({
            where: {
                nome: name
            }
        })
        res.send({message: "deu certo"})

    } catch (error) {
        console.log(error);
        // res.sendStatus(500)
        res.send({message: "Nome não encontrado"})
    }
    
})

app.get('/api/confirmados', async (req, res) => {
    try {
        // const data = await fs.promises.readFile('./nomes.txt', { encoding: 'utf8' });
        const data = await prisma.pessoa.findMany();
        res.send(data);
      } catch (error) {
        console.error('Erro ao ler arquivo:', error);
        res.status(500).send('Erro ao ler arquivo');
      }
});

app.listen(PORT, () => {
    console.log(`API is running on port ${PORT}`);
});
