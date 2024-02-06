const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware pre spracovanie JSON telies požiadaviek
app.use(express.json());

// Endpoint na čítanie konkrétneho Markdown súboru
app.get('/markdown/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'markdown_files', filename);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(404).send('File not found');
            return;
        }
        res.send(data);
    });
});

// Nový endpoint na vyhľadávanie vo viacerých Markdown súboroch
app.post('/search', (req, res) => {
    const query = req.body.query; // Textový dotaz od klienta
    const markdownDir = path.join(__dirname, 'markdown_files');

    fs.readdir(markdownDir, (err, files) => {
        if (err) {
            res.status(500).send('Error reading directory');
            return;
        }

        let foundContent = null;
        let filesProcessed = 0;

        // Prehľadávanie každého Markdown súboru
        files.forEach(file => {
            const filePath = path.join(markdownDir, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                filesProcessed++;
                if (!err && data.includes(query)) {
                    foundContent = data;
                }

                // Ak boli všetky súbory spracované a bola nájdená zhoda
                if (filesProcessed === files.length) {
                    if (foundContent) {
                        res.send(foundContent);
                    } else {
                        res.status(404).send('No matching content found');
                    }
                }
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
