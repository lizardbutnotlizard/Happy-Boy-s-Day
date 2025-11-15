const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static('public'));

// API: scan assets và trả list ảnh + audio
app.get('/api/assets', (req, res) => {
    const imgDir = path.join(__dirname, 'public/assets/images');
    const audioDir = path.join(__dirname, 'public/assets/audio');
    
    const images = fs.readdirSync(imgDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).sort();
    const audios = fs.readdirSync(audioDir).filter(f => /\.(mp3|wav|ogg|m4a)$/i.test(f));
    
    // map: mỗi image kèm tất cả audio (nếu có nhiều sound)
    const pairs = images.map(img => ({
        image: `assets/images/${img}`,
        audio: audios.length > 0 ? `assets/audio/${audios[0]}` : null
    }));
    
    res.json({ pairs });
});

app.listen(3000, () => console.log('🚀 Server at http://localhost:3000'));